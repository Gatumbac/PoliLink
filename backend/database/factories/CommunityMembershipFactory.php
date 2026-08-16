<?php

namespace Database\Factories;

use App\Models\Community;
use App\Models\CommunityMembership;
use App\Models\CommunityRole;
use App\Models\MembershipStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CommunityMembership>
 */
class CommunityMembershipFactory extends Factory
{
    public function definition(): array
    {
        return [
            'community_id' => Community::factory(),
            'user_id' => User::factory(),
            'community_role_id' => CommunityRole::factory(),
            'membership_status_id' => MembershipStatus::factory(),
            'requested_at' => now(),
            'reviewed_at' => null,
            'reviewed_by' => null,
        ];
    }
}
