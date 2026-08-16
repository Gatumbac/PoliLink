<?php

namespace App\Http\Resources;

use App\Services\EventImageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'image_url' => app(EventImageService::class)->url($this->image_path),
            'starts_at' => $this->starts_at?->toISOString(),
            'capacity' => $this->capacity,
            'available_capacity' => $this->available_capacity,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'code' => $this->category->code,
                'name' => $this->category->name,
            ]),
            'modality' => $this->whenLoaded('modality', fn () => [
                'id' => $this->modality->id,
                'code' => $this->modality->code,
                'name' => $this->modality->name,
            ]),
            'location' => $this->whenLoaded('location', fn () => [
                'id' => $this->location->id,
                'name' => $this->location->name,
                'description' => $this->location->description,
            ]),
            'community' => $this->when(
                $this->relationLoaded('communityOrganizer') && $this->communityOrganizer->relationLoaded('community'),
                fn () => [
                    'id' => $this->communityOrganizer->community->id,
                    'name' => $this->communityOrganizer->community->name,
                    'description' => $this->communityOrganizer->community->description,
                ],
            ),
            'status' => $this->whenLoaded('status', fn () => [
                'code' => $this->status->code,
                'name' => $this->status->name,
            ]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
