<?php

namespace Database\Factories;

use App\Models\CommunityCreationRequestStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityCreationRequestStatus>
 */
class CommunityCreationRequestStatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('creation-status-###'),
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
