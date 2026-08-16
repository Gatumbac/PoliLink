<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'community_id' => ['required', 'integer', 'exists:communities,id'],
            'event_category_id' => [
                'required',
                'integer',
                Rule::exists('event_categories', 'id')->where('is_active', true),
            ],
            'event_modality_id' => [
                'required',
                'integer',
                Rule::exists('event_modalities', 'id')->where('is_active', true),
            ],
            'location_id' => [
                'required',
                'integer',
                Rule::exists('locations', 'id')->where('is_active', true),
            ],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'starts_at' => ['required', 'date', 'after:now'],
            'capacity' => ['required', 'integer', 'min:1'],
        ];
    }
}
