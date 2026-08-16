<?php

namespace App\Http\Controllers;

use App\Http\Resources\CommunityResource;
use App\Http\Resources\EventCategoryResource;
use App\Http\Resources\EventModalityResource;
use App\Http\Resources\LocationResource;
use App\Models\Community;
use App\Models\EventCategory;
use App\Models\EventModality;
use App\Models\Location;

class ReferenceDataController extends Controller
{
    public function categories()
    {
        return EventCategoryResource::collection(
            EventCategory::query()->where('is_active', true)->orderBy('name')->get(),
        );
    }

    public function modalities()
    {
        return EventModalityResource::collection(
            EventModality::query()->where('is_active', true)->orderBy('name')->get(),
        );
    }

    public function locations()
    {
        return LocationResource::collection(
            Location::query()->where('is_active', true)->orderBy('name')->get(),
        );
    }

    public function communities()
    {
        return CommunityResource::collection(
            Community::query()
                ->whereHas('events.status', fn ($query) => $query->where('code', 'published'))
                ->orderBy('name')
                ->get(),
        );
    }
}
