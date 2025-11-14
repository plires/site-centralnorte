<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class StorePickingComponentIncrementRequest extends FormRequest
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
            'components_from' => ['required', 'integer', 'min:1'],
            'components_to' => ['nullable', 'integer', 'gt:components_from'],
            'description' => ['required', 'string', 'max:255'],
            'percentage' => ['required', 'numeric', 'min:0', 'max:1'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'components_from' => 'componentes desde',
            'components_to' => 'componentes hasta',
            'description' => 'descripción',
            'percentage' => 'porcentaje',
            'is_active' => 'estado',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'components_to.gt' => 'Los componentes hasta debe ser mayor que los componentes desde.',
            'percentage.max' => 'El porcentaje no puede ser mayor a 1 (100%).',
        ];
    }
}
