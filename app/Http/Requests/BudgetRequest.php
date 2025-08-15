<?php

// app/Http/Requests/BudgetRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BudgetRequest extends FormRequest
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
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'issue_date' => [
                'required',
                'date',
                'after_or_equal:today'
            ],
            'expiry_date' => [
                'required',
                'date',
                'after:issue_date'
            ],
            'send_email_to_client' => 'boolean',
            'footer_comments' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.production_time_days' => 'nullable|integer|min:1',
            'items.*.logo_printing' => 'nullable|string|max:255',
            'items.*.variant_group' => 'nullable|string|max:100',
            'items.*.is_variant' => 'nullable|boolean',
            // Permitir campos adicionales que vienen del frontend pero no los usamos
            'items.*.id' => 'nullable',
            'items.*.line_total' => 'nullable|numeric',
            'items.*.product' => 'nullable|array',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título del presupuesto es obligatorio.',
            'client_id.required' => 'Debe seleccionar un cliente.',
            'client_id.exists' => 'El cliente seleccionado no existe.',
            'issue_date.required' => 'La fecha de emisión es obligatoria.',
            'issue_date.after_or_equal' => 'La fecha de emisión no puede ser anterior a hoy.',
            'expiry_date.required' => 'La fecha de vencimiento es obligatoria.',
            'expiry_date.after' => 'La fecha de vencimiento debe ser posterior a la fecha de emisión.',
            'items.required' => 'Debe agregar al menos un producto al presupuesto.',
            'items.min' => 'Debe agregar al menos un producto al presupuesto.',
            'items.*.product_id.required' => 'Debe seleccionar un producto.',
            'items.*.product_id.exists' => 'El producto seleccionado no existe.',
            'items.*.quantity.required' => 'La cantidad es obligatoria.',
            'items.*.quantity.min' => 'La cantidad debe ser mayor a 0.',
            'items.*.unit_price.required' => 'El precio unitario es obligatorio.',
            'items.*.unit_price.min' => 'El precio unitario debe ser mayor o igual a 0.',
            'items.*.production_time_days.min' => 'El tiempo de producción debe ser mayor a 0 días.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);

            // Validar que los grupos de variantes tengan al menos 2 items
            $variantGroups = [];

            foreach ($items as $index => $item) {
                if (!empty($item['variant_group'])) {
                    $variantGroups[$item['variant_group']][] = $index;
                }
            }

            foreach ($variantGroups as $group => $indexes) {
                if (count($indexes) < 2) {
                    foreach ($indexes as $index) {
                        $validator->errors()->add(
                            "items.{$index}.variant_group",
                            "Los productos con variantes deben tener al menos 2 opciones."
                        );
                    }
                }
            }

            // Validar que no haya productos duplicados (mismo product_id)
            // Solo para productos sin variantes
            $regularProducts = [];
            $variantProducts = [];

            foreach ($items as $index => $item) {
                if (!empty($item['variant_group'])) {
                    $variantProducts[$item['product_id']][] = $index;
                } else {
                    $regularProducts[$item['product_id']][] = $index;
                }
            }

            // Verificar duplicados en productos regulares
            foreach ($regularProducts as $productId => $indexes) {
                if (count($indexes) > 1) {
                    foreach ($indexes as $index) {
                        $validator->errors()->add(
                            "items.{$index}.product_id",
                            "No puede haber productos regulares duplicados en el presupuesto."
                        );
                    }
                }
            }

            // Verificar que no haya el mismo producto como regular y como variante
            $conflictingProducts = array_intersect(array_keys($regularProducts), array_keys($variantProducts));
            foreach ($conflictingProducts as $productId) {
                $validator->errors()->add(
                    "items.0.product_id",
                    "Un producto no puede existir tanto como item regular como con variantes."
                );
            }
        });
    }
}
