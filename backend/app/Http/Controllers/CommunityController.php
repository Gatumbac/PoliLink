<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommunityRequest;
use App\Http\Resources\CommunityResource;
use App\Models\Community;
use App\Models\CommunityMembership;
use App\Models\CommunityRole;
use App\Models\MembershipStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CommunityController extends Controller
{
    public function store(StoreCommunityRequest $request): JsonResponse
    {
        $community = DB::transaction(function () use ($request) {
            $community = Community::query()->create($request->validated());
            $user = $request->user();

            CommunityMembership::query()->create([
                'community_id' => $community->id,
                'user_id' => $user->id,
                'community_role_id' => CommunityRole::query()->where('code', 'organizer')->sole()->id,
                'membership_status_id' => MembershipStatus::query()->where('code', 'active')->sole()->id,
                'requested_at' => now(),
            ]);

            return $community;
        });

        return (new CommunityResource($community))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
