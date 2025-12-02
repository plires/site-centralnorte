<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePickingBudgetRequest extends FormRequest
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
            // Cliente - Ahora usa client_id desde el ClientCombobox
            'client_id' => ['required', 'exists:clients,id'],

            // Cantidades base
            'total_kits' => ['required', 'integer', 'min:1', 'max:100000'],
            'total_components_per_kit' => ['required', 'integer', 'min:1', 'max:100'],

            // Cajas - AHORA SON OPCIONALES
            'boxes' => ['nullable', 'array'],
            'boxes.*.box_id' => ['required', 'exists:picking_boxes,id'],
            'boxes.*.quantity' => ['required', 'integer', 'min:1'],
            'boxes.*.box_unit_cost' => ['required', 'numeric', 'min:0'],
            'boxes.*.box_dimensions' => ['required', 'string', 'max:50'],

            // Servicios - Requeridos (siempre debe haber al menos el tipo de armado y rotulado)
            'services' => ['required', 'array', 'min:1'],
            'services.*.service_type' => ['required', 'string', 'in:assembly,palletizing,labeling,dome_sticking,additional_assembly,quality_control,shavings,bag,bubble_wrap'],
            'services.*.service_description' => ['required', 'string', 'max:255'],
            'services.*.unit_cost' => ['required', 'numeric', 'min:0'],
            'services.*.quantity' => ['required', 'integer', 'min:1'],

            // Notas opcionales
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'client_id' => 'cliente',
            'total_kits' => 'cantidad de kits',
            'total_components_per_kit' => 'componentes por kit',
            'boxes' => 'cajas',
            'boxes.*.box_id' => 'caja',
            'boxes.*.quantity' => 'cantidad de cajas',
            'boxes.*.box_unit_cost' => 'costo unitario',
            'boxes.*.box_dimensions' => 'dimensiones',
            'services' => 'servicios',
            'services.*.service_type' => 'tipo de servicio',
            'services.*.service_description' => 'descripción del servicio',
            'services.*.unit_cost' => 'costo unitario del servicio',
            'services.*.quantity' => 'cantidad del servicio',
            'notes' => 'notas',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'client_id.required' => 'Debe seleccionar un cliente.',
            'client_id.exists' => 'El cliente seleccionado no existe.',

            'total_kits.required' => 'La cantidad de kits es obligatoria.',
            'total_kits.integer' => 'La cantidad de kits debe ser un número entero.',
            'total_kits.min' => 'Debe haber al menos 1 kit.',
            'total_kits.max' => 'La cantidad de kits no puede superar los 100,000.',

            'total_components_per_kit.required' => 'Los componentes por kit son obligatorios.',
            'total_components_per_kit.integer' => 'Los componentes por kit deben ser un número entero.',
            'total_components_per_kit.min' => 'Debe haber al menos 1 componente por kit.',
            'total_components_per_kit.max' => 'Los componentes por kit no pueden superar los 100.',

            'boxes.array' => 'Las cajas deben ser un listado válido.',
            'boxes.*.box_id.required' => 'Debe seleccionar una caja.',
            'boxes.*.box_id.exists' => 'La caja seleccionada no existe.',
            'boxes.*.quantity.required' => 'La cantidad de cajas es obligatoria.',
            'boxes.*.quantity.integer' => 'La cantidad de cajas debe ser un número entero.',
            'boxes.*.quantity.min' => 'Debe haber al menos 1 caja.',

            'services.required' => 'Debe seleccionar al menos este servicio.',
            'services.array' => 'Los servicios deben ser un listado válido.',
            'services.min' => 'Debe seleccionar al menos este servicio.',
            'services.*.service_type.required' => 'El tipo de servicio es obligatorio.',
            'services.*.service_type.in' => 'El tipo de servicio no es válido.',
            'services.*.service_description.required' => 'La descripción del servicio es obligatoria.',
            'services.*.unit_cost.required' => 'El costo del servicio es obligatorio.',
            'services.*.unit_cost.numeric' => 'El costo del servicio debe ser un número.',
            'services.*.unit_cost.min' => 'El costo del servicio no puede ser negativo.',
            'services.*.quantity.required' => 'La cantidad del servicio es obligatoria.',
            'services.*.quantity.integer' => 'La cantidad del servicio debe ser un número entero.',
            'services.*.quantity.min' => 'La cantidad del servicio debe ser al menos 1.',

            'notes.string' => 'Las notas deben ser texto válido.',
            'notes.max' => 'Las notas no pueden superar los 1000 caracteres.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $boxes = $this->input('boxes', []);
            $services = $this->input('services', []);

            // Solo validar duplicados si hay cajas (ya que ahora son opcionales)
            if (!empty($boxes)) {
                $boxIds = array_column($boxes, 'box_id');

                // Verificar duplicados
                if (count($boxIds) !== count(array_unique($boxIds))) {
                    $validator->errors()->add(
                        'boxes',
                        'No se pueden agregar cajas duplicadas al presupuesto.'
                    );
                }
            }

            // Verificar que exista al menos un servicio de tipo "assembly"
            $hasAssemblyService = false;
            foreach ($services as $service) {
                if (isset($service['service_type']) && $service['service_type'] === 'assembly') {
                    $hasAssemblyService = true;
                    break;
                }
            }

            if (!$hasAssemblyService) {
                $validator->errors()->add(
                    'services',
                    'Debe seleccionar el tipo de producto madre del kit (con o sin armado).'
                );
            }
        });
    }
}
