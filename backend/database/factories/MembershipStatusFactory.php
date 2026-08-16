<?php

namespace Database\Factories;

use App\Models\MembershipStatus;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MembershipStatus>
 */
class MembershipStatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('membership-status-###'),
            'name' => fake()->unique()->words(2, true),
        ];
    }
}
