<?php

namespace App\Http\Requests\Picking;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAllPickingBoxesRequest extends FormRequest
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
            'boxes' => ['required', 'array', 'min:1'],
            'boxes.*.id' => ['nullable'],
            'boxes.*.dimensions' => ['required', 'string', 'max:50'],
            'boxes.*.cost' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'boxes.*.is_active' => ['boolean'],
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'boxes' => 'cajas',
            'boxes.*.dimensions' => 'dimensiones',
            'boxes.*.cost' => 'costo',
            'boxes.*.is_active' => 'estado',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            // Validaciones del array principal
            'boxes.required' => 'Debe proporcionar al menos una caja.',
            'boxes.array' => 'El formato de las cajas no es válido.',
            'boxes.min' => 'Debe proporcionar al menos una caja.',

            // Validaciones de dimensiones
            'boxes.*.dimensions.required' => 'Las dimensiones son obligatorias en la fila :position.',
            'boxes.*.dimensions.string' => 'Las dimensiones deben ser texto en la fila :position.',
            'boxes.*.dimensions.max' => 'Las dimensiones no pueden superar los 50 caracteres en la fila :position.',

            // Validaciones de costo
            'boxes.*.cost.required' => 'El costo es obligatorio en la fila :position.',
            'boxes.*.cost.numeric' => 'El costo debe ser un número válido en la fila :position.',
            'boxes.*.cost.min' => 'El costo no puede ser negativo en la fila :position.',
            'boxes.*.cost.max' => 'El costo no puede superar $999,999.99 en la fila :position.',

            // Validaciones de estado
            'boxes.*.is_active.boolean' => 'El estado debe ser activo o inactivo en la fila :position.',
        ];
    }

    /**
     * Prepare the data for validation.
     * 
     * Agrega números de fila legibles para los mensajes de error.
     */
    protected function prepareForValidation(): void
    {
        // No modificamos los datos, solo los usamos para los mensajes
    }

    /**
     * Get custom error messages with row numbers.
     */
    public function failedValidation(\Illuminate\Contracts\Validation\Validator $validator)
    {
        $errors = $validator->errors();
        $modifiedErrors = [];

        foreach ($errors->messages() as $key => $messages) {
            // Extraer el índice del array si existe (ej: boxes.0.dimensions -> índice 0)
            if (preg_match('/boxes\.(\d+)\./', $key, $matches)) {
                $index = (int)$matches[1];
                $rowNumber = $index + 1; // Convertir a número de fila legible (1-indexed)
                
                // Reemplazar :position con el número de fila
                $modifiedMessages = array_map(function($message) use ($rowNumber) {
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
