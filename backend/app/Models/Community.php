<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'description'])]
class Community extends Model
{
    use HasFactory;

    public function organizerAssignments(): HasMany
    {
        return $this->hasMany(CommunityOrganizer::class);
    }

    public function organizers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'community_organizers')->withTimestamps();
    }
}
