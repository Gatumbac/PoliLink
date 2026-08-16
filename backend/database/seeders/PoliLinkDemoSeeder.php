<?php

namespace Database\Seeders;

use App\Models\Community;
use App\Models\CommunityMembership;
use App\Models\CommunityRole;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventModality;
use App\Models\EventStatus;
use App\Models\Location;
use App\Models\MembershipStatus;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;

class PoliLinkDemoSeeder extends Seeder
{
    public function run(): void
    {
        $organizer = User::query()->updateOrCreate(
            ['email' => 'organizer@espol.edu.ec'],
            [
                'first_name' => 'Organizador',
                'last_name' => 'PoliLink',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        );
        $student = User::query()->updateOrCreate(
            ['email' => 'student@espol.edu.ec'],
            [
                'first_name' => 'Estudiante',
                'last_name' => 'PoliLink',
                'email_verified_at' => now(),
                'password' => Hash::make('password'),
            ],
        );

        $community = Community::query()->updateOrCreate(
            ['name' => 'TAWS'],
            ['description' => 'Comunidad estudiantil de tecnología y desarrollo de software.'],
        );

        $activeStatusId = MembershipStatus::query()->where('code', 'active')->sole()->id;
        $organizerRoleId = CommunityRole::query()->where('code', 'organizer')->sole()->id;
        $memberRoleId = CommunityRole::query()->where('code', 'member')->sole()->id;

        CommunityMembership::query()->updateOrCreate(
            [
                'community_id' => $community->id,
                'user_id' => $organizer->id,
            ],
            [
                'community_role_id' => $organizerRoleId,
                'membership_status_id' => $activeStatusId,
                'requested_at' => now(),
                'reviewed_at' => null,
                'reviewed_by' => null,
            ],
        );
        CommunityMembership::query()->updateOrCreate(
            [
                'community_id' => $community->id,
                'user_id' => $student->id,
            ],
            [
                'community_role_id' => $memberRoleId,
                'membership_status_id' => $activeStatusId,
                'requested_at' => now(),
                'reviewed_at' => now(),
                'reviewed_by' => $organizer->id,
            ],
        );

        $event = Event::query()->updateOrCreate(
            [
                'community_id' => $community->id,
                'title' => 'Hackathon TAWS',
            ],
            [
                'event_category_id' => EventCategory::query()->where('code', 'hackathon')->sole()->id,
                'event_modality_id' => EventModality::query()->where('code', 'in_person')->sole()->id,
                'location_id' => Location::query()->where('name', 'Campus Gustavo Galindo')->sole()->id,
                'event_status_id' => EventStatus::query()->where('code', 'published')->sole()->id,
                'description' => 'Hackathon de demostración para el avance de PoliLink.',
                'starts_at' => Carbon::create(2026, 8, 20, 9),
                'capacity' => 50,
            ],
        );

        Registration::query()->updateOrCreate(
            [
                'event_id' => $event->id,
                'user_id' => $student->id,
            ],
            [
                'registration_status_id' => RegistrationStatus::query()->where('code', 'active')->sole()->id,
                'registered_at' => now(),
                'cancelled_at' => null,
            ],
        );
    }
}
