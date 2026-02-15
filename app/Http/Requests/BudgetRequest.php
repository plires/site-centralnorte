<?php

namespace App\Http\Requests;

use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
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
        $isEditing = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $user = Auth::user();
        $isAdmin = $user && $user->role && $user->role->name === 'admin';

        $rules = [
            'title' => 'required|string|max:255',
            'client_id' => [
                'required',
                Rule::exists('clients', 'id')->whereNull('deleted_at'),
            ],
            'picking_payment_condition_id' => [
                'nullable',
                Rule::exists('picking_payment_conditions', 'id')->whereNull('deleted_at'),
            ],
            'issue_date' => $this->getIssueDateRules($isEditing),
            'expiry_date' => $this->getExpiryDateRules($isEditing),
            'send_email_to_client' => 'boolean',
            'footer_comments' => 'nullable|string',
            'rejection_comments' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                Rule::exists('products', 'id')->whereNull('deleted_at'),
            ],
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.production_time_days' => 'nullable|integer|min:1',
            'items.*.logo_printing' => 'nullable|string|max:255',
            'items.*.variant_group' => 'nullable|string|max:100',
            'items.*.is_variant' => 'nullable|boolean',
            'items.*.is_selected' => 'nullable|boolean',
            // Permitir campos adicionales que vienen del frontend pero no los usamos
            'items.*.id' => 'nullable',
            'items.*.line_total' => 'nullable|numeric',
            'items.*.product' => 'nullable|array',
        ];

        // Si es admin y está editando, permitir cambiar el user_id
        if ($isAdmin) {
            $rules['user_id'] = [
                'required',
                'exists:users,id',
                function ($attribute, $value, $fail) {
                    $user = \App\Models\User::with('role')->find($value);

                    if (!$user) {
                        $fail('El usuario seleccionado no existe.');
                        return;
                    }

                    // Permitir solo vendedores y admins
                    if (!$user->role || !in_array($user->role->name, ['vendedor', 'admin'])) {
                        $fail('Debe seleccionar un vendedor o administrador válido.');
                    }
                }
            ];
        }

        return $rules;
    }

    /**
     * Get validation rules for issue_date based on operation type
     * Para creación debe ser hoy, para edición el campo no se debe editar
     */
    private function getIssueDateRules(bool $isEditing): array
    {
        $rules = ['required', 'date'];

        if ($isEditing) {
            // Al editar: El frontend no debería permitir cambiar esta fecha
            // Pero si llega, no debe ser mayor a hoy por seguridad
            $todayArgentina = now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d');
            $rules[] = function ($attribute, $value, $fail) use ($todayArgentina) {
                $inputDate = Carbon::parse($value)->format('Y-m-d');
                if ($inputDate > $todayArgentina) {
                    $fail('La fecha de emisión no puede ser mayor a hoy.');
                }
            };
        } else {
            // Al crear: DEBE ser exactamente hoy en Argentina
            $todayArgentina = now()->timezone('America/Argentina/Buenos_Aires')->format('Y-m-d');
            $rules[] = function ($attribute, $value, $fail) use ($todayArgentina) {
                $inputDate = Carbon::parse($value)->format('Y-m-d');
                if ($inputDate !== $todayArgentina) {
                    $todayFormatted = Carbon::parse($todayArgentina)->format('d/m/Y');
                    $fail("La fecha de emisión debe ser la fecha de hoy ({$todayFormatted}).");
                }
            };
        }

        return $rules;
    }

    /**
     * Get validation rules for expiry_date based on operation type
     * Flexible, sin validación rígida de días específicos
     */
    private function getExpiryDateRules(bool $isEditing): array
    {
        $rules = [
            'required',
            'date',
            'after:issue_date', // Siempre debe ser posterior a la fecha de emisión
        ];

        if (!$isEditing) {
            // Al crear: Solo debe ser posterior a la fecha de emisión
            // (el frontend inicializa con BUDGET_VALIDITY_DAYS pero el usuario puede cambiarla)
            // No hay restricción adicional más allá de ser posterior a issue_date
        } else {
            // Al editar: Puede ser cualquier fecha posterior a la fecha de emisión
            // (sin restricción de que sea "mínimo mañana", más flexible para el usuario)
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
     * No auto-calcular fecha de vencimiento, debe venir del frontend
     */
    protected function prepareForValidation()
    {
        // El frontend ya debe enviar tanto issue_date como expiry_date
        // No necesitamos auto-calcular nada aquí
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        $isEditing = $this->isMethod('PUT') || $this->isMethod('PATCH');
        $todayArgentina = now()->timezone('America/Argentina/Buenos_Aires')->format('d/m/Y');

        return [
            'title.required' => 'El título del presupuesto es obligatorio.',
            'title.string' => 'El título debe ser un texto válido.',
            'title.max' => 'El título no puede tener más de 255 caracteres.',

            'client_id.required' => 'Debe seleccionar un cliente.',
            'client_id.exists' => 'El cliente seleccionado no existe.',

            'picking_payment_condition_id.exists' => 'La condición de pago seleccionada no existe.',

            'user_id.required' => 'Debe asignar un vendedor al presupuesto.',
            'user_id.exists' => 'El vendedor seleccionado no existe.',

            'user_id.required' => 'Debe seleccionar un vendedor.',
            'user_id.exists' => 'El vendedor seleccionado no existe.',

            'issue_date.required' => 'La fecha de emisión es obligatoria.',
            'issue_date.date' => 'La fecha de emisión debe ser una fecha válida.',

            'expiry_date.required' => 'La fecha de vencimiento es obligatoria.',
            'expiry_date.date' => 'La fecha de vencimiento debe ser una fecha válida.',
            'expiry_date.after' => 'La fecha de vencimiento debe ser posterior a la fecha de emisión.',

            'send_email_to_client.boolean' => 'El campo de envío automático debe ser verdadero o falso.',

            'footer_comments.string' => 'Los comentarios del pie deben ser texto válido.',
            'rejection_comments.string' => 'Los comentarios de rechazo deben ser texto válido.',

            'items.required' => 'Debe agregar al menos un producto al presupuesto.',
            'items.min' => 'Debe agregar al menos un producto al presupuesto.',
            'items.array' => 'Los productos deben estar en formato válido.',

            // Validaciones de items
            'items.*.product_id.required' => 'Debe seleccionar un producto.',
            'items.*.product_id.exists' => 'El producto seleccionado no existe.',

            'items.*.quantity.required' => 'La cantidad es obligatoria.',
            'items.*.quantity.integer' => 'La cantidad debe ser un número entero.',
            'items.*.quantity.min' => 'La cantidad debe ser mayor a 0.',

            'items.*.unit_price.required' => 'El precio unitario es obligatorio.',
            'items.*.unit_price.numeric' => 'El precio unitario debe ser un número.',
            'items.*.unit_price.min' => 'El precio unitario debe ser mayor o igual a 0.',

            'items.*.production_time_days.integer' => 'El tiempo de producción debe ser un número entero.',
            'items.*.production_time_days.min' => 'El tiempo de producción debe ser mayor a 0.',

            'items.*.logo_printing.string' => 'La descripción de impresión de logo debe ser texto válido.',
            'items.*.logo_printing.max' => 'La descripción de impresión de logo no puede tener más de 255 caracteres.',

            'items.*.variant_group.string' => 'El grupo de variantes debe ser texto válido.',
            'items.*.variant_group.max' => 'El grupo de variantes no puede tener más de 100 caracteres.',

            'items.*.is_variant.boolean' => 'El campo de variante debe ser verdadero o falso.',
            'items.*.is_selected.boolean' => 'El campo de selección debe ser verdadero o falso.',
        ];
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'client_id' => 'cliente',
            'picking_payment_condition_id' => 'condición de pago',
            'user_id' => 'vendedor',
            'issue_date' => 'fecha de emisión',
            'expiry_date' => 'fecha de vencimiento',
            'send_email_to_client' => 'envío automático al cliente',
            'footer_comments' => 'comentarios del pie',
            'items' => 'productos',
            'items.*.product_id' => 'producto',
            'items.*.quantity' => 'cantidad',
            'items.*.unit_price' => 'precio unitario',
            'items.*.production_time_days' => 'tiempo de producción',
            'items.*.logo_printing' => 'impresión de logo',
            'items.*.variant_group' => 'grupo de variantes',
            'items.*.is_variant' => 'es variante',
            'items.*.is_selected' => 'está seleccionado',
        ];
    }
}
