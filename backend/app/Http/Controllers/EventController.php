<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelEventRequest;
use App\Http\Requests\ListEventsRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\CommunityOrganizer;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;

class EventController extends Controller
{
    public function index(ListEventsRequest $request)
    {
        $filters = $request->validated();
        $perPage = $filters['per_page'] ?? 12;

        $events = Event::query()
            ->whereHas('status', fn ($query) => $query->where('code', 'published'))
            ->when($filters['search'] ?? null, function ($query, string $search) {
                $query->where(function ($query) use ($search) {
                    $query->where('title', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            })
            ->when($filters['date'] ?? null, fn ($query, string $date) => $query->whereDate('starts_at', $date))
            ->when($filters['category'] ?? null, fn ($query, string $category) => $query->whereHas(
                'category',
                fn ($query) => $query->where('code', $category),
            ))
            ->when($filters['modality'] ?? null, fn ($query, string $modality) => $query->whereHas(
                'modality',
                fn ($query) => $query->where('code', $modality),
            ))
            ->when($filters['community_id'] ?? null, fn ($query, int $communityId) => $query->whereHas(
                'communityOrganizer',
                fn ($query) => $query->where('community_id', $communityId),
            ))
            ->with($this->eventRelations())
            ->withCount('activeRegistrations')
            ->orderBy('starts_at')
            ->paginate($perPage)
            ->withQueryString();

        return EventResource::collection($events);
    }

    public function show(Event $event): EventResource
    {
        abort_unless($event->status()->where('code', 'published')->exists(), Response::HTTP_NOT_FOUND);

        return new EventResource($this->loadEvent($event));
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $data = $request->validated();
        $organizer = $this->organizer($data['organizer_id']);

        Gate::forUser($organizer)->authorize('create', Event::class);

        $communityOrganizer = $this->communityOrganizer($organizer, $data['community_id']);
        $publishedStatus = EventStatus::query()->where('code', 'published')->sole();

        $event = Event::query()->create([
            ...Arr::except($data, ['organizer_id', 'community_id']),
            'community_organizer_id' => $communityOrganizer->id,
            'event_status_id' => $publishedStatus->id,
        ]);

        return (new EventResource($this->loadEvent($event)))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateEventRequest $request, Event $event): EventResource
    {
        $data = $request->validated();
        $organizer = $this->organizer($data['organizer_id']);

        Gate::forUser($organizer)->authorize('update', $event);
        $this->ensureNotCancelled($event);

        $event->loadMissing('communityOrganizer');
        $communityId = $data['community_id'] ?? $event->communityOrganizer->community_id;
        $communityOrganizer = $this->communityOrganizer($organizer, $communityId);

        $event->fill(Arr::except($data, ['organizer_id', 'community_id']));
        $event->community_organizer_id = $communityOrganizer->id;
        $event->save();

        return new EventResource($this->loadEvent($event));
    }

    public function cancel(CancelEventRequest $request, Event $event): EventResource
    {
        $organizer = $this->organizer($request->validated('organizer_id'));

        Gate::forUser($organizer)->authorize('cancel', $event);
        $this->ensureNotCancelled($event);

        $event->update([
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
        ]);

        return new EventResource($this->loadEvent($event));
    }

    private function organizer(int $organizerId): User
    {
        $organizer = User::query()->findOrFail($organizerId);

        abort_unless(
            $organizer->roles()->where('code', 'organizer')->exists(),
            Response::HTTP_FORBIDDEN,
            'El usuario no tiene el rol de organizador.',
        );

        return $organizer;
    }

    private function communityOrganizer(User $organizer, int $communityId): CommunityOrganizer
    {
        $assignment = CommunityOrganizer::query()
            ->where('community_id', $communityId)
            ->where('user_id', $organizer->id)
            ->first();

        abort_unless(
            $assignment,
            Response::HTTP_FORBIDDEN,
            'El organizador no administra la comunidad indicada.',
        );

        return $assignment;
    }

    private function ensureNotCancelled(Event $event): void
    {
        abort_if(
            $event->status()->where('code', 'cancelled')->exists(),
            Response::HTTP_CONFLICT,
            'El evento ya está cancelado.',
        );
    }

    private function loadEvent(Event $event): Event
    {
        return $event->load($this->eventRelations())->loadCount('activeRegistrations');
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
