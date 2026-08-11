<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organizer_id' => ['required', 'integer', 'exists:users,id'],
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'event_category_id' => ['required', 'integer', 'exists:event_categories,id'],
            'event_modality_id' => ['required', 'integer', 'exists:event_modalities,id'],
            'location_id' => ['required', 'integer', 'exists:locations,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'starts_at' => ['required', 'date', 'after:now'],
            'capacity' => ['required', 'integer', 'min:1'],
        ];
    }
}
