<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListOrganizerEventsRequest;
use App\Http\Resources\CommunityResource;
use App\Http\Resources\EventResource;
use App\Models\Event;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function communities(Request $request)
    {
        return CommunityResource::collection(
            $request->user()->managedCommunities()->orderBy('name')->get(),
        );
    }

    public function events(ListOrganizerEventsRequest $request)
    {
        $events = Event::query()
            ->whereHas(
                'communityOrganizer',
                fn ($query) => $query->where('user_id', $request->user()->id),
            )
            ->with($this->eventRelations())
            ->withCount('activeRegistrations')
            ->orderByDesc('starts_at')
            ->paginate($request->validated('per_page', 12))
            ->withQueryString();

        return EventResource::collection($events);
    }

    /**
     * @return array<int, string>
     */
    private function eventRelations(): array
    {
        return [
            'communityOrganizer.community',
            'category',
            'modality',
            'location',
            'status',
        ];
    }
}
