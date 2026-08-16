<?php

namespace Tests\Feature;

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class DatabaseSchemaTest extends TestCase
{
    use RefreshDatabase;

    public function test_domain_tables_and_user_name_columns_are_migrated(): void
    {
        $this->assertTrue(Schema::hasColumns('users', ['first_name', 'last_name']));

        foreach ([
            'roles',
            'role_user',
            'communities',
            'community_organizers',
            'event_categories',
            'event_modalities',
            'locations',
            'event_statuses',
            'registration_statuses',
            'events',
            'registrations',
        ] as $table) {
            $this->assertTrue(Schema::hasTable($table));
        }
    }

    public function test_role_and_community_organizer_relationships_are_unique(): void
    {
        $userId = $this->createUser();
        $roleId = DB::table('roles')->insertGetId([
            'code' => 'organizer',
            'name' => 'Organizer',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $communityId = DB::table('communities')->insertGetId([
            'name' => 'TAWS',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('role_user')->insert([
            'user_id' => $userId,
            'role_id' => $roleId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        DB::table('community_organizers')->insert([
            'community_id' => $communityId,
            'user_id' => $userId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        DB::table('role_user')->insert([
            'user_id' => $userId,
            'role_id' => $roleId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_registration_is_unique_per_event_and_student(): void
    {
        $studentId = $this->createUser('student@espol.edu.ec');
        $organizerId = $this->createUser('organizer@espol.edu.ec');
        $communityId = DB::table('communities')->insertGetId([
            'name' => 'TAWS',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $communityOrganizerId = DB::table('community_organizers')->insertGetId([
            'community_id' => $communityId,
            'user_id' => $organizerId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $categoryId = $this->createReference('event_categories', 'hackathon', 'Hackathon');
        $modalityId = $this->createReference('event_modalities', 'in_person', 'In person');
        $locationId = DB::table('locations')->insertGetId([
            'name' => 'Campus Gustavo Galindo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $eventStatusId = $this->createReference('event_statuses', 'published', 'Published');
        $registrationStatusId = $this->createReference('registration_statuses', 'active', 'Active');
        $eventId = DB::table('events')->insertGetId([
            'community_organizer_id' => $communityOrganizerId,
            'event_category_id' => $categoryId,
            'event_modality_id' => $modalityId,
            'location_id' => $locationId,
            'event_status_id' => $eventStatusId,
            'title' => 'Hackathon TAWS',
            'description' => 'Evento de prueba.',
            'starts_at' => now()->addWeek(),
            'capacity' => 30,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        DB::table('registrations')->insert([
            'event_id' => $eventId,
            'student_id' => $studentId,
            'registration_status_id' => $registrationStatusId,
            'registered_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        DB::table('registrations')->insert([
            'event_id' => $eventId,
            'student_id' => $studentId,
            'registration_status_id' => $registrationStatusId,
            'registered_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_foreign_keys_reject_unknown_role_assignments(): void
    {
        $this->expectException(QueryException::class);

        DB::table('role_user')->insert([
            'user_id' => 999,
            'role_id' => 999,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createUser(string $email = 'user@espol.edu.ec'): int
    {
        return DB::table('users')->insertGetId([
            'first_name' => 'Usuario',
            'last_name' => 'Prueba',
            'email' => $email,
            'password' => 'password',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function createReference(string $table, string $code, string $name): int
    {
        return DB::table($table)->insertGetId([
            'code' => $code,
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
