<?php

namespace App\Http\Controllers;

use App\Http\Requests\ListOrganizerEventsRequest;
use App\Http\Resources\CommunityResource;
use App\Http\Resources\EventResource;
use App\Models\Event;
use App\Models\User;
use Symfony\Component\HttpFoundation\Response;

class OrganizerController extends Controller
{
    public function communities(User $organizer)
    {
        $this->ensureOrganizer($organizer);

        return CommunityResource::collection(
            $organizer->managedCommunities()->orderBy('name')->get(),
        );
    }

    public function events(ListOrganizerEventsRequest $request, User $organizer)
    {
        $this->ensureOrganizer($organizer);

        $events = Event::query()
            ->whereHas(
                'communityOrganizer',
                fn ($query) => $query->where('user_id', $organizer->id),
            )
            ->with($this->eventRelations())
            ->withCount('activeRegistrations')
            ->orderByDesc('starts_at')
            ->paginate($request->validated('per_page', 12))
            ->withQueryString();

        return EventResource::collection($events);
    }

    private function ensureOrganizer(User $organizer): void
    {
        abort_unless(
            $organizer->roles()->where('code', 'organizer')->exists(),
            Response::HTTP_FORBIDDEN,
            'El usuario no tiene el rol de organizador.',
        );
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
