<?php

namespace Database\Factories;

use App\Models\CommunityCreationRequest;
use App\Models\CommunityCreationRequestStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityCreationRequest>
 */
class CommunityCreationRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->company(),
            'description' => fake()->paragraph(),
            'image_path' => null,
            'requested_by' => User::factory(),
            'status_id' => CommunityCreationRequestStatus::factory(),
            'reviewed_by' => null,
            'reviewed_at' => null,
            'rejection_reason' => null,
            'community_id' => null,
        ];
    }
}
