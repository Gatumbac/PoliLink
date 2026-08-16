<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    private const COMMUNITY_SLUG_INDEX = 'communities_slug_unique';

    private const PENDING_SLUG_INDEX = 'community_creation_requests_pending_slug_unique';

    public function up(): void
    {
        Schema::table('communities', function (Blueprint $table): void {
            $table->string('slug')->nullable()->after('name');
        });

        Schema::table('community_creation_requests', function (Blueprint $table): void {
            $table->string('slug')->nullable()->after('name');
        });

        $this->backfillSlugs('communities');
        $this->backfillSlugs('community_creation_requests');
        $this->ensureNoSlugCollisions('communities');
        $this->ensureNoSlugCollisions('community_creation_requests', pendingOnly: true);

        Schema::table('communities', function (Blueprint $table): void {
            $table->unique('slug', self::COMMUNITY_SLUG_INDEX);
        });

        match (DB::getDriverName()) {
            'mysql', 'mariadb' => $this->addMysqlPendingSlugConstraint(),
            'sqlite', 'pgsql' => $this->addPartialPendingSlugIndex(),
            default => throw new RuntimeException(
                'La unicidad de slugs pendientes no está implementada para este motor de base de datos.',
            ),
        };
    }

    public function down(): void
    {
        match (DB::getDriverName()) {
            'mysql', 'mariadb' => $this->removeMysqlPendingSlugConstraint(),
            'sqlite', 'pgsql' => DB::statement(
                'DROP INDEX IF EXISTS "'.self::PENDING_SLUG_INDEX.'"',
            ),
            default => throw new RuntimeException(
                'La unicidad de slugs pendientes no está implementada para este motor de base de datos.',
            ),
        };

        Schema::table('communities', function (Blueprint $table): void {
            $table->dropUnique(self::COMMUNITY_SLUG_INDEX);
        });

        Schema::table('communities', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });

        Schema::table('community_creation_requests', function (Blueprint $table): void {
            $table->dropColumn('slug');
        });
    }

    private function backfillSlugs(string $table): void
    {
        DB::table($table)
            ->select(['id', 'name'])
            ->orderBy('id')
            ->get()
            ->each(function (object $record) use ($table): void {
                $slug = Str::slug($record->name);

                if ($slug === '') {
                    throw new RuntimeException(
                        "No se pudo generar un slug para {$table}#{$record->id}.",
                    );
                }

                DB::table($table)
                    ->where('id', $record->id)
                    ->update(['slug' => $slug]);
            });
    }

    private function ensureNoSlugCollisions(string $table, bool $pendingOnly = false): void
    {
        $duplicates = DB::table($table)
            ->when($pendingOnly, fn ($query) => $query->where('status', 'pending'))
            ->select('slug')
            ->groupBy('slug')
            ->havingRaw('COUNT(*) > 1')
            ->pluck('slug');

        if ($duplicates->isNotEmpty()) {
            throw new RuntimeException(
                "Existen slugs duplicados en {$table}: ".$duplicates->implode(', '),
            );
        }
    }

    private function addMysqlPendingSlugConstraint(): void
    {
        DB::statement(
            'ALTER TABLE community_creation_requests '
            .'ADD pending_slug VARCHAR(255) '
            ."GENERATED ALWAYS AS (IF(status = 'pending', slug, NULL)) STORED",
        );
        DB::statement(
            'CREATE UNIQUE INDEX '.self::PENDING_SLUG_INDEX
            .' ON community_creation_requests (pending_slug)',
        );
    }

    private function addPartialPendingSlugIndex(): void
    {
        DB::statement(
            'CREATE UNIQUE INDEX "'.self::PENDING_SLUG_INDEX.'" '
            .'ON "community_creation_requests" ("slug") '
            .'WHERE "status" = \'pending\'',
        );
    }

    private function removeMysqlPendingSlugConstraint(): void
    {
        DB::statement(
            'DROP INDEX '.self::PENDING_SLUG_INDEX.' ON community_creation_requests',
        );
        DB::statement(
            'ALTER TABLE community_creation_requests DROP COLUMN pending_slug',
        );
    }
};
