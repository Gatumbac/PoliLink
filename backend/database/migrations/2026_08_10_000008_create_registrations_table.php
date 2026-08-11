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
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('student_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('registration_status_id')->constrained()->restrictOnDelete();
            $table->timestamp('registered_at')->useCurrent();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'student_id']);
            $table->index(['event_id', 'registration_status_id']);
            $table->index(['student_id', 'registration_status_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
