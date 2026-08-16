<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\CommunityMembership;
use App\Models\CommunityRole;
use App\Models\Event;
use App\Models\EventStatus;
use App\Models\MembershipStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommunityOnboardingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_onboarding_routes_require_authentication(): void
    {
        $this->getJson('/api/me/communities')->assertUnauthorized();
        $this->getJson('/api/me/events')->assertUnauthorized();
        $this->postJson('/api/communities', ['name' => 'Comunidad nueva'])->assertUnauthorized();
    }

    public function test_student_without_communities_receives_empty_dashboard_lists(): void
    {
        $this->seed();
        $student = $this->student();

        $this->authenticatedGet($student, '/api/me/communities')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->authenticatedGet($student, '/api/me/events')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_student_can_create_a_community_and_becomes_its_organizer(): void
    {
        $this->seed();
        $student = $this->student();

        $this->authenticatedPost($student, '/api/communities', [
            'name' => 'Club de Robótica',
            'description' => 'Comunidad de robótica de ESPOL.',
        ])
            ->assertCreated()
            ->assertJsonStructure(['data' => ['id', 'name', 'description']])
            ->assertJsonPath('data.name', 'Club de Robótica');

        $student->refresh();
        $community = Community::query()->where('name', 'Club de Robótica')->sole();

        $this->assertFalse($student->is_admin);
        $this->assertDatabaseHas('community_memberships', [
            'community_id' => $community->id,
            'user_id' => $student->id,
            'community_role_id' => CommunityRole::query()->where('code', 'organizer')->sole()->id,
            'membership_status_id' => MembershipStatus::query()->where('code', 'active')->sole()->id,
        ]);

        $this->authenticatedGet($student, '/api/me/communities')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'description']]])
            ->assertJsonPath('data.0.id', $community->id);
    }

    public function test_community_name_must_be_unique(): void
    {
        $this->seed();
        $student = $this->student();

        $this->authenticatedPost($student, '/api/communities', [
            'name' => 'Club de Robótica',
        ])->assertCreated();

        $this->authenticatedPost($student, '/api/communities', [
            'name' => 'Club de Robótica',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_dashboard_lists_only_own_events_including_cancelled_events(): void
    {
        $this->seed();
        $organizer = User::query()->where('email', 'organizer@espol.edu.ec')->sole();
        $event = Event::query()->where('title', 'Hackathon TAWS')->sole();

        Event::factory()->create([
            'community_id' => $event->community_id,
            'event_category_id' => $event->event_category_id,
            'event_modality_id' => $event->event_modality_id,
            'location_id' => $event->location_id,
            'event_status_id' => EventStatus::query()->where('code', 'cancelled')->sole()->id,
            'title' => 'Evento cancelado propio',
            'starts_at' => now()->addYear(),
        ]);

        $otherCommunity = Community::factory()->create();
        $otherOrganizer = User::factory()->create();
        CommunityMembership::factory()->create([
            'community_id' => $otherCommunity->id,
            'user_id' => $otherOrganizer->id,
            'community_role_id' => CommunityRole::query()->where('code', 'organizer')->sole()->id,
            'membership_status_id' => MembershipStatus::query()->where('code', 'active')->sole()->id,
        ]);
        Event::factory()->create([
            'community_id' => $otherCommunity->id,
            'event_category_id' => $event->event_category_id,
            'event_modality_id' => $event->event_modality_id,
            'location_id' => $event->location_id,
            'event_status_id' => $event->event_status_id,
            'title' => 'Evento ajeno',
        ]);

        $this->authenticatedGet($organizer, '/api/me/events?per_page=1')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'title',
                    'description',
                    'image_url',
                    'starts_at',
                    'capacity',
                    'available_capacity',
                    'category',
                    'modality',
                    'location',
                    'community',
                    'status',
                    'created_at',
                    'updated_at',
                ]],
                'links',
                'meta',
            ])
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonFragment(['code' => 'cancelled'])
            ->assertJsonMissing(['title' => 'Evento ajeno']);
    }

    public function test_organizer_event_dashboard_rejects_invalid_pagination(): void
    {
        $this->seed();
        $organizer = User::query()->where('email', 'organizer@espol.edu.ec')->sole();

        $this->authenticatedGet($organizer, '/api/me/events?per_page=51')
            ->assertUnprocessable()
            ->assertJsonValidationErrors('per_page');
    }

    private function student(): User
    {
        return User::query()->where('email', 'student@espol.edu.ec')->sole();
    }

    private function authenticatedGet(User $user, string $uri)
    {
        return $this->actingAs($user, 'web')
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->getJson($uri);
    }

    private function authenticatedPost(User $user, string $uri, array $payload)
    {
        return $this->actingAs($user, 'web')
            ->withHeader('Origin', 'http://localhost:5173')
            ->withHeader('Referer', 'http://localhost:5173/')
            ->withSession(['_token' => 'test-csrf-token'])
            ->withHeader('X-CSRF-TOKEN', 'test-csrf-token')
            ->postJson($uri, $payload);
    }
}
