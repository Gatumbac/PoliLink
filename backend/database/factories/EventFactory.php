<?php

namespace Database\Factories;

use App\Models\CommunityOrganizer;
use App\Models\Event;
use App\Models\EventCategory;
use App\Models\EventModality;
use App\Models\EventStatus;
use App\Models\Location;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Event>
 */
class EventFactory extends Factory
{
    public function definition(): array
    {
        return [
            'community_organizer_id' => CommunityOrganizer::factory(),
            'event_category_id' => EventCategory::factory(),
            'event_modality_id' => EventModality::factory(),
            'location_id' => Location::factory(),
            'event_status_id' => EventStatus::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'starts_at' => fake()->dateTimeBetween('+1 day', '+1 year'),
            'capacity' => fake()->numberBetween(1, 100),
        ];
    }
}
