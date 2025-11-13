<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class StorePickingCostScaleRequest extends FormRequest
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
            'quantity_from' => ['required', 'integer', 'min:1'],
            'quantity_to' => ['nullable', 'integer', 'gt:quantity_from'],
            'cost_without_assembly' => ['required', 'numeric', 'min:0'],
            'cost_with_assembly' => ['required', 'numeric', 'min:0'],
            'palletizing_without_pallet' => ['required', 'numeric', 'min:0'],
            'palletizing_with_pallet' => ['required', 'numeric', 'min:0'],
            'cost_with_labeling' => ['required', 'numeric', 'min:0'],
            'cost_without_labeling' => ['required', 'numeric', 'min:0'],
            'additional_assembly' => ['required', 'numeric', 'min:0'],
            'quality_control' => ['required', 'numeric', 'min:0'],
            'dome_sticking_unit' => ['required', 'numeric', 'min:0'],
            'shavings_50g_unit' => ['required', 'numeric', 'min:0'],
            'shavings_100g_unit' => ['required', 'numeric', 'min:0'],
            'shavings_200g_unit' => ['required', 'numeric', 'min:0'],
            'bag_10x15_unit' => ['required', 'numeric', 'min:0'],
            'bag_20x30_unit' => ['required', 'numeric', 'min:0'],
            'bag_35x45_unit' => ['required', 'numeric', 'min:0'],
            'bubble_wrap_5x10_unit' => ['required', 'numeric', 'min:0'],
            'bubble_wrap_10x15_unit' => ['required', 'numeric', 'min:0'],
            'bubble_wrap_20x30_unit' => ['required', 'numeric', 'min:0'],
            'production_time' => ['required', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'quantity_from' => 'cantidad desde',
            'quantity_to' => 'cantidad hasta',
            'cost_without_assembly' => 'costo sin armado',
            'cost_with_assembly' => 'costo con armado',
            'palletizing_without_pallet' => 'palletizado sin pallet',
            'palletizing_with_pallet' => 'palletizado con pallet',
            'cost_with_labeling' => 'costo con rotulado',
            'cost_without_labeling' => 'costo sin rotulado',
            'additional_assembly' => 'ensamble adicional',
            'quality_control' => 'control de calidad',
            'dome_sticking_unit' => 'pegado de domes (unitario)',
            'production_time' => 'tiempo de producción',
            'is_active' => 'estado',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'quantity_to.gt' => 'La cantidad hasta debe ser mayor que la cantidad desde.',
        ];
    }
}
