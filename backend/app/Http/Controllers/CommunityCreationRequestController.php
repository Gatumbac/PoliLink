<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListCommunityCreationRequestsRequest;
use App\Http\Requests\RejectCommunityCreationRequest;
use App\Http\Requests\StoreCommunityCreationRequest;
use App\Http\Resources\CommunityCreationRequestResource;
use App\Models\Community;
use App\Models\CommunityCreationRequest as CommunityCreationRequestModel;
use App\Models\CommunityCreationRequestStatus;
use App\Models\CommunityMembership;
use App\Models\CommunityRole;
use App\Models\MembershipStatus;
use App\Services\PublicImageStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class CommunityCreationRequestController extends Controller
{
    public function __construct(
        private readonly PublicImageStorageService $imageStorage,
    ) {}

    public function store(StoreCommunityCreationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $this->ensureNameCanBeRequested($data['name']);

        $imagePath = isset($data['image'])
            ? $this->imageStorage->store($data['image'], 'community-requests')
            : null;

        try {
            $creationRequest = CommunityCreationRequestModel::query()->create([
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'image_path' => $imagePath,
                'requested_by' => $request->user()->id,
                'status_id' => CommunityCreationRequestStatus::query()->where('code', 'pending')->sole()->id,
            ]);
        } catch (Throwable $exception) {
            $this->imageStorage->delete($imagePath);

            throw $exception;
        }

        return (new CommunityCreationRequestResource($creationRequest->load('status')))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function mine(ListCommunityCreationRequestsRequest $request): JsonResponse
    {
        $requests = CommunityCreationRequestModel::query()
            ->where('requested_by', $request->user()->id)
            ->with(['status', 'community'])
            ->orderByDesc('created_at')
            ->paginate($request->validated('per_page', 12))
            ->withQueryString();

        return CommunityCreationRequestResource::collection($requests)->response();
    }

    public function adminIndex(ListCommunityCreationRequestsRequest $request): JsonResponse
    {
        $statusCode = $request->validated('status', 'pending');

        $requests = CommunityCreationRequestModel::query()
            ->whereHas('status', fn ($query) => $query->where('code', $statusCode))
            ->with(['status', 'requester', 'community'])
            ->orderBy('created_at')
            ->paginate($request->validated('per_page', 12))
            ->withQueryString();

        return CommunityCreationRequestResource::collection($requests)->response();
    }

    public function approve(Request $request, CommunityCreationRequestModel $communityCreationRequest): JsonResponse
    {
        $sourceImagePath = null;
        $targetImagePath = null;

        try {
            $approvedRequest = DB::transaction(function () use (
                $request,
                $communityCreationRequest,
                &$sourceImagePath,
                &$targetImagePath,
            ) {
                $lockedRequest = CommunityCreationRequestModel::query()
                    ->whereKey($communityCreationRequest->id)
                    ->with('status')
                    ->lockForUpdate()
                    ->firstOrFail();

                $this->ensurePending($lockedRequest);
                abort_if(
                    Community::query()->where('name', $lockedRequest->name)->exists(),
                    Response::HTTP_CONFLICT,
                    'Ya existe una comunidad con ese nombre.',
                );

                $sourceImagePath = $lockedRequest->image_path;
                $targetImagePath = $sourceImagePath
                    ? $this->imageStorage->move($sourceImagePath, 'communities')
                    : null;

                $community = Community::query()->create([
                    'name' => $lockedRequest->name,
                    'description' => $lockedRequest->description,
                    'is_active' => true,
                    'image_path' => $targetImagePath,
                ]);

                CommunityMembership::query()->create([
                    'community_id' => $community->id,
                    'user_id' => $lockedRequest->requested_by,
                    'community_role_id' => CommunityRole::query()->where('code', 'organizer')->sole()->id,
                    'membership_status_id' => MembershipStatus::query()->where('code', 'active')->sole()->id,
                    'requested_at' => $lockedRequest->created_at,
                    'reviewed_at' => now(),
                    'reviewed_by' => $request->user()->id,
                ]);

                $lockedRequest->update([
                    'status_id' => CommunityCreationRequestStatus::query()->where('code', 'approved')->sole()->id,
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                    'community_id' => $community->id,
                    'image_path' => $targetImagePath,
                ]);

                return $lockedRequest->load(['status', 'requester', 'community']);
            });
        } catch (Throwable $exception) {
            $this->restoreMovedImage($targetImagePath, $sourceImagePath);

            throw $exception;
        }

        return CommunityCreationRequestResource::make($approvedRequest)->response();
    }

    public function reject(
        RejectCommunityCreationRequest $request,
        CommunityCreationRequestModel $communityCreationRequest,
    ): CommunityCreationRequestResource {
        $imagePath = null;

        $rejectedRequest = DB::transaction(function () use (
            $request,
            $communityCreationRequest,
            &$imagePath,
        ) {
            $lockedRequest = CommunityCreationRequestModel::query()
                ->whereKey($communityCreationRequest->id)
                ->with('status')
                ->lockForUpdate()
                ->firstOrFail();

            $this->ensurePending($lockedRequest);
            $imagePath = $lockedRequest->image_path;

            $lockedRequest->update([
                'status_id' => CommunityCreationRequestStatus::query()->where('code', 'rejected')->sole()->id,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
                'rejection_reason' => $request->validated('rejection_reason'),
                'image_path' => null,
            ]);

            return $lockedRequest->load(['status', 'requester', 'community']);
        });

        $this->imageStorage->delete($imagePath);

        return new CommunityCreationRequestResource($rejectedRequest);
    }

    private function ensureNameCanBeRequested(string $name): void
    {
        $communityExists = Community::query()->where('name', $name)->exists();
        $pendingRequestExists = CommunityCreationRequestModel::query()
            ->where('name', $name)
            ->whereHas('status', fn ($query) => $query->where('code', 'pending'))
            ->exists();

        if ($communityExists || $pendingRequestExists) {
            throw ValidationException::withMessages([
                'name' => 'Ya existe una comunidad o solicitud pendiente con ese nombre.',
            ]);
        }
    }

    private function ensurePending(CommunityCreationRequestModel $creationRequest): void
    {
        abort_unless(
            $creationRequest->status->code === 'pending',
            Response::HTTP_CONFLICT,
            'La solicitud ya fue procesada.',
        );
    }

    private function restoreMovedImage(?string $targetPath, ?string $sourcePath): void
    {
        if ($targetPath === null) {
            return;
        }

        try {
            if ($sourcePath !== null) {
                $this->imageStorage->moveTo($targetPath, $sourcePath);
            } else {
                $this->imageStorage->delete($targetPath);
            }
        } catch (Throwable) {
            // The original exception is more useful to the API caller.
        }
    }
}
