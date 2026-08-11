<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('community_organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_category_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_modality_id')->constrained()->restrictOnDelete();
            $table->foreignId('location_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_status_id')->constrained()->restrictOnDelete();
            $table->string('title');
            $table->text('description');
            $table->dateTime('starts_at');
            $table->unsignedInteger('capacity');
            $table->timestamps();

            $table->index(['event_status_id', 'starts_at']);
            $table->index(['event_category_id', 'starts_at']);
            $table->index(['event_modality_id', 'starts_at']);
            $table->index('location_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
