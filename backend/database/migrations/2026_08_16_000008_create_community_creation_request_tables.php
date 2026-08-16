<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_creation_request_statuses', function (Blueprint $table): void {
            $table->id();
            $table->string('code')->unique();
            $table->string('name')->unique();
            $table->timestamps();
        });

        Schema::create('community_creation_requests', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->foreignId('requested_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('status_id')
                ->constrained('community_creation_request_statuses')
                ->restrictOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('community_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();

            $table->index(['requested_by', 'status_id']);
            $table->index(['status_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_creation_requests');
        Schema::dropIfExists('community_creation_request_statuses');
    }
};
