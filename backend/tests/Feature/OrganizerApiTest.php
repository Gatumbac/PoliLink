<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\EventStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OrganizerApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_organizer_can_list_managed_communities_and_own_events_including_cancelled(): void
    {
        $this->seed();
        $organizer = User::query()->where('email', 'organizer@polilink.test')->sole();
        $event = Event::query()->where('title', 'Hackathon TAWS')->sole();

        Event::factory()->create([
            'community_organizer_id' => $event->community_organizer_id,
            'event_category_id' => $event->event_category_id,
            'event_modality_id' => $event->event_modality_id,
            'location_id' => $event->location_id,
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
            'title' => 'Evento cancelado propio',
            'starts_at' => now()->addMonth(),
        ]);

        $this->getJson("/api/organizers/{$organizer->id}/communities")
            ->assertOk()
            ->assertJsonPath('data.0.name', 'TAWS');

        $this->getJson("/api/organizers/{$organizer->id}/events")
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonFragment(['code' => 'cancelled']);
    }

    public function test_user_without_organizer_role_cannot_access_the_organizer_panel(): void
    {
        $this->seed();
        $student = User::query()->where('email', 'student@polilink.test')->sole();

        $this->getJson("/api/organizers/{$student->id}/communities")->assertForbidden();
        $this->getJson("/api/organizers/{$student->id}/events")->assertForbidden();
    }
}
