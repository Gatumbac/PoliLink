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

    public function test_domain_tables_and_user_fields_use_the_new_membership_model(): void
    {
        $this->assertTrue(Schema::hasColumns('users', ['first_name', 'last_name', 'is_admin']));
        $this->assertTrue(Schema::hasColumns('event_categories', ['is_active']));
        $this->assertTrue(Schema::hasColumns('event_modalities', ['is_active']));
        $this->assertTrue(Schema::hasColumns('locations', ['is_active']));
        $this->assertTrue(Schema::hasColumns('events', ['community_id', 'image_path']));
        $this->assertTrue(Schema::hasColumns('registrations', ['user_id']));

        foreach ([
            'communities',
            'community_roles',
            'membership_statuses',
            'community_memberships',
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

        foreach (['roles', 'role_user', 'community_organizers'] as $removedTable) {
            $this->assertFalse(Schema::hasTable($removedTable));
        }
    }

    public function test_membership_is_unique_per_user_and_community(): void
    {
        $userId = $this->createUser();
        $communityId = DB::table('communities')->insertGetId([
            'name' => 'TAWS',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $roleId = $this->createReference('community_roles', 'member', 'Miembro');
        $statusId = $this->createReference('membership_statuses', 'active', 'Activa');

        DB::table('community_memberships')->insert([
            'community_id' => $communityId,
            'user_id' => $userId,
            'community_role_id' => $roleId,
            'membership_status_id' => $statusId,
            'requested_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        DB::table('community_memberships')->insert([
            'community_id' => $communityId,
            'user_id' => $userId,
            'community_role_id' => $roleId,
            'membership_status_id' => $statusId,
            'requested_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_registration_is_unique_per_event_and_user(): void
    {
        $userId = $this->createUser('member@espol.edu.ec');
        $communityId = DB::table('communities')->insertGetId([
            'name' => 'TAWS',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $categoryId = $this->createReference('event_categories', 'hackathon', 'Hackatón');
        $modalityId = $this->createReference('event_modalities', 'in_person', 'Presencial');
        $locationId = DB::table('locations')->insertGetId([
            'name' => 'Campus Gustavo Galindo',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $eventStatusId = $this->createReference('event_statuses', 'published', 'Publicado');
        $registrationStatusId = $this->createReference('registration_statuses', 'active', 'Activa');
        $eventId = DB::table('events')->insertGetId([
            'community_id' => $communityId,
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
            'user_id' => $userId,
            'registration_status_id' => $registrationStatusId,
            'registered_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $this->expectException(QueryException::class);

        DB::table('registrations')->insert([
            'event_id' => $eventId,
            'user_id' => $userId,
            'registration_status_id' => $registrationStatusId,
            'registered_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function test_foreign_keys_reject_unknown_membership_references(): void
    {
        $this->expectException(QueryException::class);

        DB::table('community_memberships')->insert([
            'community_id' => 999,
            'user_id' => 999,
            'community_role_id' => 999,
            'membership_status_id' => 999,
            'requested_at' => now(),
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
            'is_admin' => false,
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
