<?php

namespace Tests\Feature;

use App\Models\Community;
use App\Models\Event;
use App\Models\Registration;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DomainModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeded_models_expose_the_expected_relationships(): void
    {
        $this->seed();

        $organizer = User::query()->where('email', 'organizer@polilink.test')->sole();
        $student = User::query()->where('email', 'student@polilink.test')->sole();
        $community = Community::query()->where('name', 'TAWS')->sole();
        $event = Event::query()->where('title', 'Hackathon TAWS')->sole();
        $registration = Registration::query()->sole();

        $this->assertTrue($organizer->roles->contains('code', 'organizer'));
        $this->assertTrue($student->roles->contains('code', 'student'));
        $this->assertTrue($organizer->managedCommunities->contains($community));
        $this->assertTrue($community->organizers->contains($organizer));
        $this->assertSame('TAWS', $event->communityOrganizer->community->name);
        $this->assertSame('Hackathon', $event->category->name);
        $this->assertSame('In person', $event->modality->name);
        $this->assertSame('Campus Gustavo Galindo', $event->location->name);
        $this->assertSame('Published', $event->status->name);
        $this->assertTrue($registration->student->is($student));
        $this->assertTrue($registration->event->is($event));
        $this->assertSame('Active', $registration->status->name);
    }

    public function test_seeders_are_idempotent_and_available_capacity_uses_active_count(): void
    {
        $this->seed();
        $this->seed();

        $this->assertDatabaseCount('roles', 2);
        $this->assertDatabaseCount('event_categories', 6);
        $this->assertDatabaseCount('event_modalities', 3);
        $this->assertDatabaseCount('locations', 4);
        $this->assertDatabaseCount('event_statuses', 2);
        $this->assertDatabaseCount('registration_statuses', 2);
        $this->assertDatabaseCount('users', 2);
        $this->assertDatabaseCount('communities', 1);
        $this->assertDatabaseCount('community_organizers', 1);
        $this->assertDatabaseCount('events', 1);
        $this->assertDatabaseCount('registrations', 1);

        $event = Event::query()->withCount('activeRegistrations')->sole();

        $this->assertSame(1, $event->active_registrations_count);
        $this->assertSame(49, $event->available_capacity);
        $this->assertSame(49, Event::query()->sole()->available_capacity);
    }

    public function test_factories_create_a_valid_event_and_registration_graph(): void
    {
        $event = Event::factory()->create();
        $registration = Registration::factory()->for($event)->create();

        $this->assertNotNull($event->communityOrganizer);
        $this->assertNotNull($event->category);
        $this->assertNotNull($event->modality);
        $this->assertNotNull($event->location);
        $this->assertNotNull($event->status);
        $this->assertTrue($registration->event->is($event));
        $this->assertNotNull($registration->student);
        $this->assertNotNull($registration->status);
    }
}
