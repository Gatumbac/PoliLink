<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\CommunityOrganizer;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EventApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_catalogue_lists_only_published_events_and_applies_filters(): void
    {
        $this->seed();
        $event = $this->seededEvent();
        Event::factory()->create([
            'community_organizer_id' => $event->community_organizer_id,
            'event_category_id' => $event->event_category_id,
            'event_modality_id' => $event->event_modality_id,
            'location_id' => $event->location_id,
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
            'title' => 'Evento cancelado',
        ]);

        $response = $this->getJson('/api/events?search=Hackathon&date=2026-08-20&category=hackathon&modality=in_person&community_id='.$event->communityOrganizer->community_id);

        $response
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $event->id)
            ->assertJsonPath('data.0.available_capacity', 49)
            ->assertJsonPath('data.0.community.name', 'TAWS')
            ->assertJsonPath('data.0.category.code', 'hackathon')
            ->assertJsonPath('meta.per_page', 12);
    }

    public function test_public_detail_hides_cancelled_events(): void
    {
        $this->seed();
        $event = $this->seededEvent();

        $this->getJson("/api/events/{$event->id}")
            ->assertOk()
            ->assertJsonPath('data.id', $event->id);

        $event->update([
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
        ]);

        $this->getJson("/api/events/{$event->id}")->assertNotFound();
    }

    public function test_organizer_can_create_an_event_for_a_managed_community(): void
    {
        $this->seed();
        $organizer = $this->organizer();

        $response = $this->authenticatedPost($organizer, '/api/events', $this->eventPayload());

        $response
            ->assertCreated()
            ->assertJsonPath('data.status.code', 'published')
            ->assertJsonPath('data.community.name', 'TAWS');

        $this->assertDatabaseHas('events', ['title' => 'Taller Laravel']);
    }

    public function test_event_creation_requires_authentication_and_a_managed_community(): void
    {
        $this->seed();
        $student = User::query()->where('email', 'student@polilink.test')->sole();
        $organizer = $this->organizer();
        $unmanagedCommunity = Community::factory()->create();

        $this->authenticatedPost($student, '/api/events', $this->eventPayload())->assertForbidden();

        $this->authenticatedPost($organizer, '/api/events', $this->eventPayload([
            'community_id' => $unmanagedCommunity->id,
        ]))->assertForbidden();

        $this->authenticatedPost($organizer, '/api/events', $this->eventPayload([
            'capacity' => 0,
        ]))->assertUnprocessable();

    }

    public function test_event_writes_require_authentication(): void
    {
        $this->seed();
        $event = $this->seededEvent();

        $this->postJson('/api/events', $this->eventPayload())->assertUnauthorized();
        $this->patchJson("/api/events/{$event->id}", ['title' => 'Cambio'])->assertUnauthorized();
        $this->patchJson("/api/events/{$event->id}/cancel")->assertUnauthorized();
    }

    public function test_owner_can_update_an_event_and_move_it_to_another_managed_community(): void
    {
        $this->seed();
        $organizer = $this->organizer();
        $event = $this->seededEvent();
        $secondCommunity = Community::factory()->create();
        CommunityOrganizer::factory()->create([
            'community_id' => $secondCommunity->id,
            'user_id' => $organizer->id,
        ]);

        $this->authenticatedPatch($organizer, "/api/events/{$event->id}", [
            'title' => 'Hackathon TAWS actualizado',
            'community_id' => $secondCommunity->id,
        ])
            ->assertOk()
            ->assertJsonPath('data.title', 'Hackathon TAWS actualizado')
            ->assertJsonPath('data.community.id', $secondCommunity->id);
    }

    public function test_non_owner_cannot_update_an_event(): void
    {
        $this->seed();
        $event = $this->seededEvent();
        $otherOrganizer = User::factory()->create();
        $otherOrganizer->roles()->attach(Role::query()->where('code', 'organizer')->sole());

        $this->authenticatedPatch($otherOrganizer, "/api/events/{$event->id}", [
            'title' => 'Cambio no permitido',
        ])->assertForbidden();
    }

    public function test_owner_can_cancel_an_event_once(): void
    {
        $this->seed();
        $event = $this->seededEvent();
        $organizer = $this->organizer();

        $this->authenticatedPatch($organizer, "/api/events/{$event->id}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status.code', 'cancelled');

        $this->authenticatedPatch($organizer, "/api/events/{$event->id}/cancel")->assertConflict();
    }

    private function organizer(): User
    {
        return User::query()->where('email', 'organizer@polilink.test')->sole();
    }

    private function seededEvent(): Event
    {
        return Event::query()->with('communityOrganizer')->where('title', 'Hackathon TAWS')->sole();
    }

    private function eventPayload(array $overrides = []): array
    {
        $event = $this->seededEvent();

        return [
            'community_id' => $event->communityOrganizer->community_id,
            'event_category_id' => $event->event_category_id,
            'event_modality_id' => $event->event_modality_id,
            'location_id' => $event->location_id,
            'title' => 'Taller Laravel',
            'description' => 'Taller de prueba para la API de eventos.',
            'starts_at' => now()->addWeek()->toIso8601String(),
            'capacity' => 25,
            ...$overrides,
        ];
    }

    private function authenticatedPost(User $user, string $uri, array $payload)
    {
        return $this->actingAs($user, 'sanctum')
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withSession(['_token' => 'test-csrf-token'])
            ->withHeader('X-CSRF-TOKEN', 'test-csrf-token')
            ->postJson($uri, $payload);
    }

    private function authenticatedPatch(User $user, string $uri, array $payload = [])
    {
        return $this->actingAs($user, 'sanctum')
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withSession(['_token' => 'test-csrf-token'])
            ->withHeader('X-CSRF-TOKEN', 'test-csrf-token')
            ->patchJson($uri, $payload);
    }
}
