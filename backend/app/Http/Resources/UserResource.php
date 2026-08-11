<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles
                ->sortBy('code')
                ->values()
                ->map(fn ($role) => [
                    'code' => $role->code,
                    'name' => $role->name,
                ])),
        ];
    }
}
