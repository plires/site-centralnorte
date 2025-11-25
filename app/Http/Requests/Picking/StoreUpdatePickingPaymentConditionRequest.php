<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class StoreUpdatePickingPaymentConditionRequest extends FormRequest
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
            'description' => ['required', 'string', 'max:100'],
            'percentage' => ['required', 'numeric', 'min:-100', 'max:100'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
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
            'description.required' => 'La descripción es obligatoria.',
            'description.string' => 'La descripción debe ser un texto válido.',
            'description.max' => 'La descripción no puede superar los 100 caracteres.',

            'percentage.required' => 'El porcentaje es obligatorio.',
            'percentage.numeric' => 'El porcentaje debe ser un número válido.',
            'percentage.min' => 'El porcentaje no puede ser menor a -100%.',
            'percentage.max' => 'El porcentaje no puede ser mayor a 100%.',

            'is_active.boolean' => 'El estado debe ser verdadero o falso.',
        ];
    }
}
