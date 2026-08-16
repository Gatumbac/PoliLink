<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'name',
    'description',
    'image_path',
    'requested_by',
    'status_id',
    'reviewed_by',
    'reviewed_at',
    'rejection_reason',
    'community_id',
])]
class CommunityCreationRequest extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(CommunityCreationRequestStatus::class, 'status_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function community(): BelongsTo
    {
        return $this->belongsTo(Community::class);
    }
}
