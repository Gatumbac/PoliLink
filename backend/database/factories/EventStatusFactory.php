<?php

namespace Database\Factories;

use App\Models\EventStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EventStatus>
 */
class EventStatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('event-status-###'),
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
