<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListMyMembershipsRequest;
use App\Http\Resources\CommunityMembershipResource;
use App\Models\Community;
use App\Models\CommunityMembership;
use App\Models\CommunityRole;
use App\Models\MembershipStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CommunityMembershipController extends Controller
{
    public function store(Request $request, Community $community): JsonResponse
    {
        $user = $request->user();
        [$membership, $wasReactivated] = DB::transaction(function () use ($community, $user) {
            $membership = CommunityMembership::query()
                ->where('community_id', $community->id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            $memberRoleId = CommunityRole::query()->where('code', 'member')->sole()->id;
            $pendingStatusId = MembershipStatus::query()->where('code', 'pending')->sole()->id;

            if ($membership === null) {
                return [
                    CommunityMembership::query()->create([
                        'community_id' => $community->id,
                        'user_id' => $user->id,
                        'community_role_id' => $memberRoleId,
                        'membership_status_id' => $pendingStatusId,
                        'requested_at' => now(),
                    ]),
                    false,
                ];
            }

            $membership->load(['role', 'status']);

            abort_if(
                in_array($membership->status->code, ['pending', 'active'], true),
                Response::HTTP_CONFLICT,
                $membership->status->code === 'pending'
                    ? 'Ya tienes una solicitud pendiente para esta comunidad.'
                    : 'Ya tienes una membresía activa en esta comunidad.',
            );

            $membership->update([
                'community_role_id' => $memberRoleId,
                'membership_status_id' => $pendingStatusId,
                'requested_at' => now(),
                'reviewed_at' => null,
                'reviewed_by' => null,
            ]);

            return [$membership, true];
        });

        return (new CommunityMembershipResource($this->loadMembership($membership)))
            ->response()
            ->setStatusCode($wasReactivated ? Response::HTTP_OK : Response::HTTP_CREATED);
    }

    public function destroy(Request $request, Community $community): CommunityMembershipResource
    {
        $user = $request->user();
        $membership = DB::transaction(function () use ($community, $user) {
            $membership = CommunityMembership::query()
                ->where('community_id', $community->id)
                ->where('user_id', $user->id)
                ->lockForUpdate()
                ->first();

            abort_if(
                $membership === null,
                Response::HTTP_NOT_FOUND,
                'No tienes una solicitud o membresía en esta comunidad.',
            );

            $membership->load(['role', 'status']);

            abort_unless(
                in_array($membership->status->code, ['pending', 'active'], true),
                Response::HTTP_NOT_FOUND,
                'No tienes una solicitud o membresía cancelable en esta comunidad.',
            );

            abort_if(
                $membership->status->code === 'active'
                    && $membership->role->code === 'organizer',
                Response::HTTP_CONFLICT,
                'Un organizer activo no puede abandonar la comunidad todavía.',
            );

            $membership->update([
                'membership_status_id' => MembershipStatus::query()->where('code', 'left')->sole()->id,
            ]);

            return $membership;
        });

        return new CommunityMembershipResource($this->loadMembership($membership));
    }

    public function mine(ListMyMembershipsRequest $request)
    {
        $memberships = CommunityMembership::query()
            ->where('user_id', $request->user()->id)
            ->join('communities', 'communities.id', '=', 'community_memberships.community_id')
            ->select('community_memberships.*')
            ->with(['community', 'role', 'status'])
            ->orderBy('communities.name')
            ->paginate($request->validated('per_page', 12))
            ->withQueryString();

        return CommunityMembershipResource::collection($memberships);
    }

    private function loadMembership(CommunityMembership $membership): CommunityMembership
    {
        return $membership->load(['community', 'role', 'status']);
    }
}
