<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductImageVariantRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'variant' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'variant.max' => 'La variante no puede superar los 255 caracteres.',
        ];
    }
}
