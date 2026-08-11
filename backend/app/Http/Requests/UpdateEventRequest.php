<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'community_id' => ['sometimes', 'required', 'integer', 'exists:communities,id'],
            'event_category_id' => ['sometimes', 'required', 'integer', 'exists:event_categories,id'],
            'event_modality_id' => ['sometimes', 'required', 'integer', 'exists:event_modalities,id'],
            'location_id' => ['sometimes', 'required', 'integer', 'exists:locations,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string'],
            'starts_at' => ['sometimes', 'required', 'date', 'after:now'],
            'capacity' => ['sometimes', 'required', 'integer', 'min:1'],
        ];
    }
}
