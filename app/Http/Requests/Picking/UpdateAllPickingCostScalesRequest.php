<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAllPickingCostScalesRequest extends FormRequest
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
      'scales' => ['required', 'array', 'min:1'],
      'scales.*.id' => ['nullable'],
      'scales.*.quantity_from' => ['required', 'integer', 'min:1'],
      'scales.*.quantity_to' => ['nullable', 'integer', 'min:1'],
      'scales.*.cost_without_assembly' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.cost_with_assembly' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.palletizing_without_pallet' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.palletizing_with_pallet' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.cost_with_labeling' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.cost_without_labeling' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.additional_assembly' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.quality_control' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.dome_sticking_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.shavings_50g_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.shavings_100g_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.shavings_200g_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.bag_10x15_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.bag_20x30_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.bag_35x45_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.bubble_wrap_5x10_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.bubble_wrap_10x15_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.bubble_wrap_20x30_unit' => ['required', 'numeric', 'min:0', 'max:999999.99'],
      'scales.*.production_time' => ['required', 'string', 'max:50'],
      'scales.*.is_active' => ['boolean'],
    ];
  }

  /**
   * Get custom attributes for validator errors.
   */
  public function attributes(): array
  {
    return [
      'scales' => 'escalas de costos',
      'scales.*.quantity_from' => 'cantidad desde',
      'scales.*.quantity_to' => 'cantidad hasta',
      'scales.*.cost_without_assembly' => 'costo sin armado',
      'scales.*.cost_with_assembly' => 'costo con armado',
      'scales.*.palletizing_without_pallet' => 'palletizado sin pallet',
      'scales.*.palletizing_with_pallet' => 'palletizado con pallet',
      'scales.*.cost_with_labeling' => 'costo con rotulado',
      'scales.*.cost_without_labeling' => 'costo sin rotulado',
      'scales.*.additional_assembly' => 'ensamble adicional',
      'scales.*.quality_control' => 'control de calidad',
      'scales.*.dome_sticking_unit' => 'pegado de domes (unitario)',
      'scales.*.shavings_50g_unit' => 'viruta 50g (unitario)',
      'scales.*.shavings_100g_unit' => 'viruta 100g (unitario)',
      'scales.*.shavings_200g_unit' => 'viruta 200g (unitario)',
      'scales.*.bag_10x15_unit' => 'bolsa 10x15 (unitario)',
      'scales.*.bag_20x30_unit' => 'bolsa 20x30 (unitario)',
      'scales.*.bag_35x45_unit' => 'bolsa 35x45 (unitario)',
      'scales.*.bubble_wrap_5x10_unit' => 'pluribol 5x10 (unitario)',
      'scales.*.bubble_wrap_10x15_unit' => 'pluribol 10x15 (unitario)',
      'scales.*.bubble_wrap_20x30_unit' => 'pluribol 20x30 (unitario)',
      'scales.*.production_time' => 'tiempo de producción',
      'scales.*.is_active' => 'estado',
    ];
  }

  /**
   * Get custom messages for validator errors.
   */
  public function messages(): array
  {
    return [
      // Validaciones del array principal
      'scales.required' => 'Debe proporcionar al menos una escala de costos.',
      'scales.array' => 'El formato de las escalas no es válido.',
      'scales.min' => 'Debe proporcionar al menos una escala de costos.',

      // Validaciones de cantidad desde
      'scales.*.quantity_from.required' => 'La cantidad desde es obligatoria en la fila :position.',
      'scales.*.quantity_from.integer' => 'La cantidad desde debe ser un número entero en la fila :position.',
      'scales.*.quantity_from.min' => 'La cantidad desde debe ser mayor o igual a 1 en la fila :position.',

      // Validaciones de cantidad hasta
      'scales.*.quantity_to.integer' => 'La cantidad hasta debe ser un número entero en la fila :position.',
      'scales.*.quantity_to.min' => 'La cantidad hasta debe ser mayor o igual a 1 en la fila :position.',

      // Validaciones de costos (genérico para todos los campos numéricos)
      'scales.*.cost_without_assembly.required' => 'El costo sin armado es obligatorio en la fila :position.',
      'scales.*.cost_without_assembly.numeric' => 'El costo sin armado debe ser un número válido en la fila :position.',
      'scales.*.cost_without_assembly.min' => 'El costo sin armado no puede ser negativo en la fila :position.',
      'scales.*.cost_without_assembly.max' => 'El costo sin armado no puede superar $999,999.99 en la fila :position.',

      'scales.*.cost_with_assembly.required' => 'El costo con armado es obligatorio en la fila :position.',
      'scales.*.cost_with_assembly.numeric' => 'El costo con armado debe ser un número válido en la fila :position.',
      'scales.*.cost_with_assembly.min' => 'El costo con armado no puede ser negativo en la fila :position.',
      'scales.*.cost_with_assembly.max' => 'El costo con armado no puede superar $999,999.99 en la fila :position.',

      'scales.*.palletizing_without_pallet.required' => 'El palletizado sin pallet es obligatorio en la fila :position.',
      'scales.*.palletizing_without_pallet.numeric' => 'El palletizado sin pallet debe ser un número válido en la fila :position.',
      'scales.*.palletizing_without_pallet.min' => 'El palletizado sin pallet no puede ser negativo en la fila :position.',
      'scales.*.palletizing_without_pallet.max' => 'El palletizado sin pallet no puede superar $999,999.99 en la fila :position.',

      'scales.*.palletizing_with_pallet.required' => 'El palletizado con pallet es obligatorio en la fila :position.',
      'scales.*.palletizing_with_pallet.numeric' => 'El palletizado con pallet debe ser un número válido en la fila :position.',
      'scales.*.palletizing_with_pallet.min' => 'El palletizado con pallet no puede ser negativo en la fila :position.',
      'scales.*.palletizing_with_pallet.max' => 'El palletizado con pallet no puede superar $999,999.99 en la fila :position.',

      'scales.*.cost_with_labeling.required' => 'El costo con rotulado es obligatorio en la fila :position.',
      'scales.*.cost_with_labeling.numeric' => 'El costo con rotulado debe ser un número válido en la fila :position.',
      'scales.*.cost_with_labeling.min' => 'El costo con rotulado no puede ser negativo en la fila :position.',
      'scales.*.cost_with_labeling.max' => 'El costo con rotulado no puede superar $999,999.99 en la fila :position.',

      'scales.*.cost_without_labeling.required' => 'El costo sin rotulado es obligatorio en la fila :position.',
      'scales.*.cost_without_labeling.numeric' => 'El costo sin rotulado debe ser un número válido en la fila :position.',
      'scales.*.cost_without_labeling.min' => 'El costo sin rotulado no puede ser negativo en la fila :position.',
      'scales.*.cost_without_labeling.max' => 'El costo sin rotulado no puede superar $999,999.99 en la fila :position.',

      'scales.*.additional_assembly.required' => 'El ensamble adicional es obligatorio en la fila :position.',
      'scales.*.additional_assembly.numeric' => 'El ensamble adicional debe ser un número válido en la fila :position.',
      'scales.*.additional_assembly.min' => 'El ensamble adicional no puede ser negativo en la fila :position.',
      'scales.*.additional_assembly.max' => 'El ensamble adicional no puede superar $999,999.99 en la fila :position.',

      'scales.*.quality_control.required' => 'El control de calidad es obligatorio en la fila :position.',
      'scales.*.quality_control.numeric' => 'El control de calidad debe ser un número válido en la fila :position.',
      'scales.*.quality_control.min' => 'El control de calidad no puede ser negativo en la fila :position.',
      'scales.*.quality_control.max' => 'El control de calidad no puede superar $999,999.99 en la fila :position.',

      'scales.*.dome_sticking_unit.required' => 'El pegado de domes es obligatorio en la fila :position.',
      'scales.*.dome_sticking_unit.numeric' => 'El pegado de domes debe ser un número válido en la fila :position.',
      'scales.*.dome_sticking_unit.min' => 'El pegado de domes no puede ser negativo en la fila :position.',
      'scales.*.dome_sticking_unit.max' => 'El pegado de domes no puede superar $999,999.99 en la fila :position.',

      // Virutas
      'scales.*.shavings_50g_unit.required' => 'La viruta 50g es obligatoria en la fila :position.',
      'scales.*.shavings_50g_unit.numeric' => 'La viruta 50g debe ser un número válido en la fila :position.',
      'scales.*.shavings_50g_unit.min' => 'La viruta 50g no puede ser negativa en la fila :position.',
      'scales.*.shavings_50g_unit.max' => 'La viruta 50g no puede superar $999,999.99 en la fila :position.',

      'scales.*.shavings_100g_unit.required' => 'La viruta 100g es obligatoria en la fila :position.',
      'scales.*.shavings_100g_unit.numeric' => 'La viruta 100g debe ser un número válido en la fila :position.',
      'scales.*.shavings_100g_unit.min' => 'La viruta 100g no puede ser negativa en la fila :position.',
      'scales.*.shavings_100g_unit.max' => 'La viruta 100g no puede superar $999,999.99 en la fila :position.',

      'scales.*.shavings_200g_unit.required' => 'La viruta 200g es obligatoria en la fila :position.',
      'scales.*.shavings_200g_unit.numeric' => 'La viruta 200g debe ser un número válido en la fila :position.',
      'scales.*.shavings_200g_unit.min' => 'La viruta 200g no puede ser negativa en la fila :position.',
      'scales.*.shavings_200g_unit.max' => 'La viruta 200g no puede superar $999,999.99 en la fila :position.',

      // Bolsas
      'scales.*.bag_10x15_unit.required' => 'La bolsa 10x15 es obligatoria en la fila :position.',
      'scales.*.bag_10x15_unit.numeric' => 'La bolsa 10x15 debe ser un número válido en la fila :position.',
      'scales.*.bag_10x15_unit.min' => 'La bolsa 10x15 no puede ser negativa en la fila :position.',
      'scales.*.bag_10x15_unit.max' => 'La bolsa 10x15 no puede superar $999,999.99 en la fila :position.',

      'scales.*.bag_20x30_unit.required' => 'La bolsa 20x30 es obligatoria en la fila :position.',
      'scales.*.bag_20x30_unit.numeric' => 'La bolsa 20x30 debe ser un número válido en la fila :position.',
      'scales.*.bag_20x30_unit.min' => 'La bolsa 20x30 no puede ser negativa en la fila :position.',
      'scales.*.bag_20x30_unit.max' => 'La bolsa 20x30 no puede superar $999,999.99 en la fila :position.',

      'scales.*.bag_35x45_unit.required' => 'La bolsa 35x45 es obligatoria en la fila :position.',
      'scales.*.bag_35x45_unit.numeric' => 'La bolsa 35x45 debe ser un número válido en la fila :position.',
      'scales.*.bag_35x45_unit.min' => 'La bolsa 35x45 no puede ser negativa en la fila :position.',
      'scales.*.bag_35x45_unit.max' => 'La bolsa 35x45 no puede superar $999,999.99 en la fila :position.',

      // Pluribol
      'scales.*.bubble_wrap_5x10_unit.required' => 'El pluribol 5x10 es obligatorio en la fila :position.',
      'scales.*.bubble_wrap_5x10_unit.numeric' => 'El pluribol 5x10 debe ser un número válido en la fila :position.',
      'scales.*.bubble_wrap_5x10_unit.min' => 'El pluribol 5x10 no puede ser negativo en la fila :position.',
      'scales.*.bubble_wrap_5x10_unit.max' => 'El pluribol 5x10 no puede superar $999,999.99 en la fila :position.',

      'scales.*.bubble_wrap_10x15_unit.required' => 'El pluribol 10x15 es obligatorio en la fila :position.',
      'scales.*.bubble_wrap_10x15_unit.numeric' => 'El pluribol 10x15 debe ser un número válido en la fila :position.',
      'scales.*.bubble_wrap_10x15_unit.min' => 'El pluribol 10x15 no puede ser negativo en la fila :position.',
      'scales.*.bubble_wrap_10x15_unit.max' => 'El pluribol 10x15 no puede superar $999,999.99 en la fila :position.',

      'scales.*.bubble_wrap_20x30_unit.required' => 'El pluribol 20x30 es obligatorio en la fila :position.',
      'scales.*.bubble_wrap_20x30_unit.numeric' => 'El pluribol 20x30 debe ser un número válido en la fila :position.',
      'scales.*.bubble_wrap_20x30_unit.min' => 'El pluribol 20x30 no puede ser negativo en la fila :position.',
      'scales.*.bubble_wrap_20x30_unit.max' => 'El pluribol 20x30 no puede superar $999,999.99 en la fila :position.',

      // Tiempo de producción
      'scales.*.production_time.required' => 'El tiempo de producción es obligatorio en la fila :position.',
      'scales.*.production_time.string' => 'El tiempo de producción debe ser texto en la fila :position.',
      'scales.*.production_time.max' => 'El tiempo de producción no puede superar los 50 caracteres en la fila :position.',

      // Estado
      'scales.*.is_active.boolean' => 'El estado debe ser activo o inactivo en la fila :position.',
    ];
  }

  /**
   * Handle a failed validation attempt and customize error messages with row numbers.
   */
  protected function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
  {
    $errors = $validator->errors();
    $modifiedErrors = [];

    foreach ($errors->messages() as $key => $messages) {
      // Extraer el índice del array si existe (ej: scales.0.cost_without_assembly -> índice 0)
      if (preg_match('/scales\.(\d+)\./', $key, $matches)) {
        $index = (int)$matches[1];
        $rowNumber = $index + 1; // Convertir a número de fila legible (1-indexed)

        // Reemplazar :position con el número de fila
        $modifiedMessages = array_map(function ($message) use ($rowNumber) {
          return str_replace(':position', "#{$rowNumber}", $message);
        }, $messages);

        $modifiedErrors[$key] = $modifiedMessages;
      } else {
        $modifiedErrors[$key] = $messages;
      }
    }

    $validator->errors()->merge($modifiedErrors);

    parent::failedValidation($validator);
  }
}
