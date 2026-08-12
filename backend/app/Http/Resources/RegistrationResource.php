<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'registered_at' => $this->registered_at?->toISOString(),
            'cancelled_at' => $this->cancelled_at?->toISOString(),
            'status' => $this->whenLoaded('status', fn () => [
                'code' => $this->status->code,
                'name' => $this->status->name,
            ]),
            'event' => $this->whenLoaded('event', fn () => new EventResource($this->event)),
            'student' => $this->whenLoaded('student', fn () => [
                'id' => $this->student->id,
                'first_name' => $this->student->first_name,
                'last_name' => $this->student->last_name,
                'email' => $this->student->email,
            ]),
        ];
    }
}
