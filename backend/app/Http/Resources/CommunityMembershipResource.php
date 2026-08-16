<?php

namespace App\Http\Resources;

use App\Services\PublicImageStorageService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommunityMembershipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'community' => $this->whenLoaded('community', fn () => [
                'id' => $this->community->id,
                'name' => $this->community->name,
                'description' => $this->community->description,
                'image_url' => app(PublicImageStorageService::class)->url($this->community->image_path),
            ]),
            'role' => $this->whenLoaded('role', fn () => [
                'code' => $this->role->code,
                'name' => $this->role->name,
            ]),
            'status' => [
                'code' => $this->status->value,
                'name' => $this->status->label(),
            ],
            'requested_at' => $this->requested_at?->toISOString(),
            'reviewed_at' => $this->reviewed_at?->toISOString(),
        ];
    }
}
