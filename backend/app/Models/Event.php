<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'community_organizer_id',
    'event_category_id',
    'event_modality_id',
    'location_id',
    'event_status_id',
    'title',
    'description',
    'image_path',
    'starts_at',
    'capacity',
])]
class Event extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function communityOrganizer(): BelongsTo
    {
        return $this->belongsTo(CommunityOrganizer::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'event_category_id');
    }

    public function modality(): BelongsTo
    {
        return $this->belongsTo(EventModality::class, 'event_modality_id');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(EventStatus::class, 'event_status_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function activeRegistrations(): HasMany
    {
        return $this->hasMany(Registration::class)->whereHas(
            'status',
            fn ($query) => $query->where('code', 'active'),
        );
    }

    public function getAvailableCapacityAttribute(): int
    {
        $activeRegistrationsCount = array_key_exists('active_registrations_count', $this->attributes)
            ? (int) $this->attributes['active_registrations_count']
            : $this->activeRegistrations()->count();

        return max(0, $this->capacity - $activeRegistrationsCount);
    }
}
