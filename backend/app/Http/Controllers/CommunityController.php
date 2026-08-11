<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCommunityRequest;
use App\Http\Resources\CommunityResource;
use App\Models\Community;
use App\Models\CommunityOrganizer;
use App\Models\Role;
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

            $user->roles()->syncWithoutDetaching([
                Role::query()->where('code', 'organizer')->sole()->id,
            ]);

            CommunityOrganizer::query()->create([
                'community_id' => $community->id,
                'user_id' => $user->id,
            ]);

            return $community;
        });

        return (new CommunityResource($community))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }
}
