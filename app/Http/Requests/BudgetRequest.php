<?php

// app/Http/Requests/BudgetRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

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
        $isEditing = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'title' => 'required|string|max:255',
            'client_id' => 'required|exists:clients,id',
            'issue_date' => $this->getIssueDateRules($isEditing),
            'expiry_date' => $this->getExpiryDateRules($isEditing),
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
     * Get validation rules for issue_date based on operation type
     */
    private function getIssueDateRules(bool $isEditing): array
    {
        $rules = ['required', 'date'];

        if ($isEditing) {
            // Al editar: no puede ser mayor a hoy
            $rules[] = 'before_or_equal:today';
        } else {
            // Al crear: debe ser exactamente hoy (no anterior ni posterior)
            $rules[] = 'after_or_equal:today';
            $rules[] = 'before_or_equal:today';
        }

        return $rules;
    }

    /**
     * Get validation rules for expiry_date based on operation type
     */
    private function getExpiryDateRules(bool $isEditing): array
    {
        $rules = [
            'required',
            'date',
            'after:issue_date', // Siempre debe ser posterior a la fecha de emisión
        ];

        if (!$isEditing) {
            // Al crear: debe ser mínimo mañana
            $rules[] = 'after_or_equal:tomorrow';
        }

        // Máximo 1 año desde la fecha de emisión (tanto crear como editar)
        $rules[] = function ($attribute, $value, $fail) {
            $issueDate = Carbon::parse($this->input('issue_date'));
            $expiryDate = Carbon::parse($value);
            $maxDate = $issueDate->copy()->addYear();

            if ($expiryDate->gt($maxDate)) {
                $fail('La fecha de vencimiento no puede ser más de 1 año después de la fecha de emisión.');
            }
        };

        return $rules;
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation()
    {
        // Agregar regla personalizada para "tomorrow"
        $this->getValidatorInstance()->addExtension('after_or_equal_tomorrow', function ($attribute, $value, $parameters, $validator) {
            $tomorrow = Carbon::tomorrow()->startOfDay();
            $inputDate = Carbon::parse($value)->startOfDay();
            return $inputDate->gte($tomorrow);
        });

        $this->getValidatorInstance()->addReplacer('after_or_equal_tomorrow', function ($message, $attribute, $rule, $parameters) {
            return str_replace(':attribute', $attribute, 'El campo :attribute debe ser como mínimo mañana.');
        });
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->addExtension('after_or_equal_tomorrow', function ($attribute, $value, $parameters, $validator) {
            $tomorrow = Carbon::tomorrow()->startOfDay();
            $inputDate = Carbon::parse($value)->startOfDay();
            return $inputDate->gte($tomorrow);
        });

        $validator->addReplacer('after_or_equal_tomorrow', function ($message, $attribute, $rule, $parameters) {
            return 'La fecha de vencimiento debe ser como mínimo mañana.';
        });
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        $isEditing = $this->isMethod('PUT') || $this->isMethod('PATCH');

        return [
            'title.required' => 'El título del presupuesto es obligatorio.',
            'client_id.required' => 'Debe seleccionar un cliente.',
            'client_id.exists' => 'El cliente seleccionado no existe.',
            'issue_date.required' => 'La fecha de emisión es obligatoria.',
            'issue_date.after_or_equal' => $isEditing
                ? 'La fecha de emisión no puede ser mayor a hoy.'
                : 'La fecha de emisión no puede ser anterior a hoy.',
            'issue_date.before_or_equal' => $isEditing
                ? 'La fecha de emisión no puede ser mayor a hoy.'
                : 'La fecha de emisión no puede ser posterior a hoy.',
            'expiry_date.required' => 'La fecha de vencimiento es obligatoria.',
            'expiry_date.after' => 'La fecha de vencimiento debe ser posterior a la fecha de emisión.',
            'expiry_date.after_or_equal' => 'La fecha de vencimiento debe ser como mínimo mañana.',
            'items.required' => 'Debe agregar al menos un producto al presupuesto.',
            'items.min' => 'Debe agregar al menos un producto al presupuesto.',
            'items.*.product_id.required' => 'Debe seleccionar un producto.',
            'items.*.product_id.exists' => 'El producto seleccionado no existe.',
            'items.*.quantity.required' => 'La cantidad es obligatoria.',
            'items.*.quantity.min' => 'La cantidad debe ser mayor a 0.',
            'items.*.unit_price.required' => 'El precio unitario es obligatorio.',
            'items.*.unit_price.min' => 'El precio unitario debe ser mayor o igual a 0.',
            'items.*.production_time_days.min' => 'El tiempo de producción debe ser mayor a 0.',
        ];
    }
}
