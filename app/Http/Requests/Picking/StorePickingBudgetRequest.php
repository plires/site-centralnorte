<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class StorePickingBudgetRequest extends FormRequest
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
            'client_name' => ['required', 'string', 'max:255'],
            'client_email' => ['nullable', 'email', 'max:255'],
            'client_phone' => ['nullable', 'string', 'max:50'],
            'total_kits' => ['required', 'integer', 'min:1', 'max:100000'],
            'total_components_per_kit' => ['required', 'integer', 'min:1', 'max:100'],

            // boxes es un array de cajas
            'boxes' => ['required', 'array', 'min:1'],
            'boxes.*.box_id' => ['required', 'exists:picking_boxes,id'],
            'boxes.*.quantity' => ['required', 'integer', 'min:1'],
            'boxes.*.box_unit_cost' => ['required', 'numeric', 'min:0'],
            'boxes.*.box_dimensions' => ['required', 'string', 'max:50'],

            'services' => ['required', 'array', 'min:1'],
            'services.*.service_type' => ['required', 'string'],
            'services.*.service_description' => ['required', 'string', 'max:255'],
            'services.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'services.*.quantity' => ['required', 'integer', 'min:1'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'client_name' => 'nombre del cliente',
            'client_email' => 'email del cliente',
            'client_phone' => 'teléfono del cliente',
            'total_kits' => 'cantidad de kits',
            'total_components_per_kit' => 'componentes por kit',
            'boxes' => 'cajas',
            'boxes.*.box_id' => 'caja',
            'boxes.*.quantity' => 'cantidad de cajas',
            'boxes.*.box_unit_cost' => 'costo unitario',
            'boxes.*.box_dimensions' => 'dimensiones',
            'services' => 'servicios',
            'notes' => 'notas',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'boxes.required' => 'Debe seleccionar al menos una caja.',
            'boxes.min' => 'Debe seleccionar al menos una caja.',
            'services.required' => 'Debe seleccionar al menos un servicio.',
            'services.min' => 'Debe seleccionar al menos un servicio.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $boxes = $this->input('boxes', []);
            $boxIds = array_column($boxes, 'box_id');

            // Verificar duplicados
            if (count($boxIds) !== count(array_unique($boxIds))) {
                $validator->errors()->add(
                    'boxes',
                    'No se pueden agregar cajas duplicadas al presupuesto.'
                );
            }
        });
    }
}
