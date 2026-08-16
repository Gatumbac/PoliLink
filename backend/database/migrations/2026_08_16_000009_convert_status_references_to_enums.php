<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var array<string, array{legacy_column: string, legacy_table: string, legacy_indexes: array<int, string>, indexes: array<int, array{columns: array<int, string>, name: string}>, values: array<int, string>, constraint: string}>
     */
    private array $definitions = [
        'events' => [
            'legacy_column' => 'event_status_id',
            'legacy_table' => 'event_statuses',
            'legacy_indexes' => ['events_event_status_id_starts_at_index'],
            'indexes' => [
                ['columns' => ['status', 'starts_at'], 'name' => 'events_status_starts_at_index'],
            ],
            'values' => ['published', 'cancelled'],
            'constraint' => 'events_status_check',
        ],
        'registrations' => [
            'legacy_column' => 'registration_status_id',
            'legacy_table' => 'registration_statuses',
            'legacy_indexes' => [
                'registrations_event_id_registration_status_id_index',
                'registrations_user_id_registration_status_id_index',
            ],
            'indexes' => [
                ['columns' => ['event_id', 'status'], 'name' => 'registrations_event_id_status_index'],
                ['columns' => ['user_id', 'status'], 'name' => 'registrations_user_id_status_index'],
            ],
            'values' => ['active', 'cancelled'],
            'constraint' => 'registrations_status_check',
        ],
        'community_memberships' => [
            'legacy_column' => 'membership_status_id',
            'legacy_table' => 'membership_statuses',
            'legacy_indexes' => ['community_memberships_community_id_membership_status_id_index'],
            'indexes' => [
                ['columns' => ['community_id', 'status'], 'name' => 'community_memberships_community_id_status_index'],
            ],
            'values' => ['pending', 'active', 'rejected', 'left'],
            'constraint' => 'community_memberships_status_check',
        ],
        'community_creation_requests' => [
            'legacy_column' => 'status_id',
            'legacy_table' => 'community_creation_request_statuses',
            'legacy_indexes' => [
                'community_creation_requests_requested_by_status_id_index',
                'community_creation_requests_status_id_created_at_index',
            ],
            'indexes' => [
                ['columns' => ['requested_by', 'status'], 'name' => 'community_creation_requests_requested_by_status_index'],
                ['columns' => ['status', 'created_at'], 'name' => 'community_creation_requests_status_created_at_index'],
            ],
            'values' => ['pending', 'approved', 'rejected'],
            'constraint' => 'community_creation_requests_status_check',
        ],
    ];

    public function up(): void
    {
        foreach ($this->definitions as $table => $definition) {
            $this->addStatusColumnIfNeeded($table);
            $this->copyLegacyStatusCodes($table, $definition);
            $this->removeLegacyStatusReference($table, $definition);
            $this->ensureIndexes($table, $definition['indexes']);
            $this->enforceStatusValues($table, $definition['values'], $definition['constraint']);
        }

        foreach (array_unique(array_column($this->definitions, 'legacy_table')) as $table) {
            Schema::dropIfExists($table);
        }
    }

    public function down(): void
    {
        foreach ($this->definitions as $table => $definition) {
            $this->removeCheckConstraint($table, $definition['constraint']);

            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->string('status')->nullable()->change();
            });
        }
    }

    private function addStatusColumnIfNeeded(string $table): void
    {
        if (Schema::hasColumn($table, 'status')) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->string('status')->nullable();
        });
    }

    /**
     * @param  array{legacy_column: string, legacy_table: string, legacy_indexes: array<int, string>, indexes: array<int, array{columns: array<int, string>, name: string}>, values: array<int, string>, constraint: string}  $definition
     */
    private function copyLegacyStatusCodes(string $table, array $definition): void
    {
        if (! Schema::hasColumn($table, $definition['legacy_column'])
            || ! Schema::hasTable($definition['legacy_table'])) {
            return;
        }

        DB::table($table)
            ->join(
                $definition['legacy_table'],
                $definition['legacy_table'].'.id',
                '=',
                $table.'.'.$definition['legacy_column'],
            )
            ->select($table.'.id', $definition['legacy_table'].'.code')
            ->orderBy($table.'.id')
            ->get()
            ->each(function (object $row) use ($table): void {
                DB::table($table)
                    ->where('id', $row->id)
                    ->update(['status' => $row->code]);
            });

        if (DB::table($table)->whereNull('status')->exists()) {
            throw new RuntimeException("No se pudo convertir todos los estados de {$table}.");
        }
    }

    /**
     * @param  array{legacy_column: string, legacy_table: string, legacy_indexes: array<int, string>, indexes: array<int, array{columns: array<int, string>, name: string}>, values: array<int, string>, constraint: string}  $definition
     */
    private function removeLegacyStatusReference(string $table, array $definition): void
    {
        if (! Schema::hasColumn($table, $definition['legacy_column'])) {
            return;
        }

        Schema::table($table, function (Blueprint $blueprint) use ($definition): void {
            $blueprint->dropForeign([$definition['legacy_column']]);
            foreach ($definition['legacy_indexes'] as $index) {
                if (Schema::hasIndex($blueprint->getTable(), $index)) {
                    $blueprint->dropIndex($index);
                }
            }
            $blueprint->dropColumn($definition['legacy_column']);
        });
    }

    /**
     * @param  array<int, array{columns: array<int, string>, name: string}>  $indexes
     */
    private function ensureIndexes(string $table, array $indexes): void
    {
        foreach ($indexes as $index) {
            if (Schema::hasIndex($table, $index['name'])) {
                continue;
            }

            Schema::table($table, function (Blueprint $blueprint) use ($index): void {
                $blueprint->index($index['columns'], $index['name']);
            });
        }
    }

    /**
     * @param  array<int, string>  $allowed
     */
    private function enforceStatusValues(string $table, array $allowed, string $constraint): void
    {
        if (DB::connection()->getDriverName() === 'sqlite') {
            Schema::table($table, function (Blueprint $blueprint) use ($allowed): void {
                $blueprint->enum('status', $allowed)->nullable(false)->change();
            });

            return;
        }

        Schema::table($table, function (Blueprint $blueprint): void {
            $blueprint->string('status')->nullable(false)->change();
        });

        $this->addCheckConstraint($table, $allowed, $constraint);
    }

    /**
     * @param  array<int, string>  $allowed
     */
    private function addCheckConstraint(string $table, array $allowed, string $constraint): void
    {
        $values = implode(', ', array_map(
            fn (string $value): string => "'".str_replace("'", "''", $value)."'",
            $allowed,
        ));

        $driver = DB::connection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE `{$table}` ADD CONSTRAINT `{$constraint}` CHECK (`status` IN ({$values}))");
        } elseif ($driver === 'pgsql') {
            DB::statement("ALTER TABLE \"{$table}\" ADD CONSTRAINT \"{$constraint}\" CHECK (\"status\" IN ({$values}))");
        }
    }

    private function removeCheckConstraint(string $table, string $constraint): void
    {
        $driver = DB::connection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement("ALTER TABLE `{$table}` DROP CHECK `{$constraint}`");
        } elseif ($driver === 'pgsql') {
            DB::statement("ALTER TABLE \"{$table}\" DROP CONSTRAINT \"{$constraint}\"");
        }
    }
};
