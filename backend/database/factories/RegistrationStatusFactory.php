<?php

namespace Database\Factories;

use App\Models\RegistrationStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RegistrationStatus>
 */
class RegistrationStatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('registration-status-###'),
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
