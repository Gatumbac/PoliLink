<?php

namespace App\Http\Controllers;

use App\Http\Requests\CancelEventRequest;
use App\Http\Requests\ListEventsRequest;
use App\Http\Requests\StoreEventImageRequest;
use App\Http\Requests\StoreEventRequest;
use App\Http\Requests\UpdateEventRequest;
use App\Http\Resources\EventResource;
use App\Models\CommunityOrganizer;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\User;
use App\Services\EventImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class EventController extends Controller
{
    public function __construct(
        private readonly EventImageService $eventImageService,
    ) {}

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
        $organizer = $request->user();

        Gate::forUser($organizer)->authorize('create', Event::class);

        $communityOrganizer = $this->communityOrganizer($organizer, $data['community_id']);
        $publishedStatus = EventStatus::query()->where('code', 'published')->sole();
        $image = $data['image'] ?? null;
        $imagePath = $image ? $this->eventImageService->store($image) : null;

        try {
            $event = Event::query()->create([
                ...Arr::except($data, ['community_id', 'image']),
                'community_organizer_id' => $communityOrganizer->id,
                'event_status_id' => $publishedStatus->id,
                'image_path' => $imagePath,
            ]);
        } catch (Throwable $exception) {
            $this->eventImageService->delete($imagePath);

            throw $exception;
        }

        return (new EventResource($this->loadEvent($event)))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function update(UpdateEventRequest $request, Event $event): EventResource
    {
        $data = $request->validated();
        $organizer = $request->user();

        Gate::forUser($organizer)->authorize('update', $event);
        $this->ensureNotCancelled($event);

        $event->loadMissing('communityOrganizer');
        $communityId = $data['community_id'] ?? $event->communityOrganizer->community_id;
        $communityOrganizer = $this->communityOrganizer($organizer, $communityId);

        $event->fill(Arr::except($data, ['community_id']));
        $event->community_organizer_id = $communityOrganizer->id;
        $event->save();

        return new EventResource($this->loadEvent($event));
    }

    public function storeImage(StoreEventImageRequest $request, Event $event): EventResource
    {
        $organizer = $request->user();

        Gate::forUser($organizer)->authorize('update', $event);
        $this->ensureNotCancelled($event);

        $previousImagePath = $event->image_path;
        $imagePath = $this->eventImageService->store($request->file('image'));

        try {
            $event->update(['image_path' => $imagePath]);
        } catch (Throwable $exception) {
            $this->eventImageService->delete($imagePath);

            throw $exception;
        }

        $this->eventImageService->delete($previousImagePath);

        return new EventResource($this->loadEvent($event));
    }

    public function removeImage(Request $request, Event $event): EventResource
    {
        $organizer = $request->user();

        Gate::forUser($organizer)->authorize('update', $event);
        $this->ensureNotCancelled($event);

        $previousImagePath = $event->image_path;
        $event->update(['image_path' => null]);
        $this->eventImageService->delete($previousImagePath);

        return new EventResource($this->loadEvent($event));
    }

    public function cancel(CancelEventRequest $request, Event $event): EventResource
    {
        $organizer = $request->user();

        Gate::forUser($organizer)->authorize('cancel', $event);
        $this->ensureNotCancelled($event);

        $event->update([
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
        ]);

        return new EventResource($this->loadEvent($event));
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
