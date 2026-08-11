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
            EventCategory::query()->orderBy('name')->get(),
        );
    }

    public function modalities()
    {
        return EventModalityResource::collection(
            EventModality::query()->orderBy('name')->get(),
        );
    }

    public function locations()
    {
        return LocationResource::collection(
            Location::query()->orderBy('name')->get(),
        );
    }

    public function communities()
    {
        return CommunityResource::collection(
            Community::query()
                ->whereHas('organizerAssignments.events.status', fn ($query) => $query->where('code', 'published'))
                ->orderBy('name')
                ->get(),
        );
    }
}
