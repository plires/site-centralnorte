<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePickingBoxRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'dimensions' => [
                'required',
                'string',
                'max:50',
                Rule::unique('picking_boxes', 'dimensions')->ignore($this->pickingBox),
            ],
            'cost' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'dimensions' => 'dimensiones',
            'cost' => 'costo',
            'is_active' => 'estado',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'dimensions.unique' => 'Ya existe otra caja con estas dimensiones.',
        ];
    }
}
