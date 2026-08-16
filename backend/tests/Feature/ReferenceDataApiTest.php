<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\CommunityOrganizer;
use App\Models\Event;
use App\Models\EventStatus;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReferenceDataApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_reference_endpoints_return_sorted_filter_and_form_data(): void
    {
        $this->seed();

        $this->getJson('/api/event-categories')
            ->assertOk()
            ->assertJsonCount(6, 'data')
            ->assertJsonStructure(['data' => [['id', 'code', 'name']]])
            ->assertJsonPath('data.0.name', 'Charla');

        $this->getJson('/api/event-modalities')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonStructure(['data' => [['id', 'code', 'name']]])
            ->assertJsonPath('data.0.name', 'Híbrida');

        $this->getJson('/api/locations')
            ->assertOk()
            ->assertJsonCount(4, 'data')
            ->assertJsonStructure(['data' => [['id', 'name', 'description']]])
            ->assertJsonPath('data.0.name', 'Auditorio FIEC');
    }

    public function test_communities_endpoint_includes_only_communities_with_published_events(): void
    {
        $this->seed();
        $hiddenCommunity = Community::factory()->create(['name' => 'Comunidad sin publicación']);
        $organizer = $this->organizer();
        $assignment = CommunityOrganizer::factory()->create([
            'community_id' => $hiddenCommunity->id,
            'user_id' => $organizer->id,
        ]);
        $event = Event::query()->where('title', 'Hackathon TAWS')->sole();

        Event::factory()->create([
            'community_organizer_id' => $assignment->id,
            'event_category_id' => $event->event_category_id,
            'event_modality_id' => $event->event_modality_id,
            'location_id' => $event->location_id,
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
        ]);

        $this->getJson('/api/communities')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'TAWS')
            ->assertJsonStructure(['data' => [['id', 'name', 'description']]]);
    }

    private function organizer()
    {
        return \App\Models\User::query()->where('email', 'organizer@espol.edu.ec')->sole();
    }
}
