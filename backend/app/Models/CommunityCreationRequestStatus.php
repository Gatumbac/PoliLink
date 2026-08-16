<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['code', 'name'])]
class CommunityCreationRequestStatus extends Model
{
    use HasFactory;

    public function requests(): HasMany
    {
        return $this->hasMany(CommunityCreationRequest::class, 'status_id');
    }
}
