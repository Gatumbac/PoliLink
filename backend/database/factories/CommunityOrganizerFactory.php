<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\CommunityOrganizer;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityOrganizer>
 */
class CommunityOrganizerFactory extends Factory
{
    public function definition(): array
    {
        return [
            'community_id' => Community::factory(),
            'user_id' => User::factory(),
        ];
    }
}
