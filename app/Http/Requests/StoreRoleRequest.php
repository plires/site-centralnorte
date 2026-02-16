<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'        => 'required|string|max:255|unique:roles,name',
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,id',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'       => 'El nombre del rol es obligatorio.',
            'name.max'            => 'El nombre del rol no puede superar los 255 caracteres.',
            'name.unique'         => 'Ya existe un rol con ese nombre. Ingresá uno diferente.',
            'permissions.array'   => 'Los permisos enviados no son válidos.',
            'permissions.*.exists' => 'Uno de los permisos seleccionados no existe.',
        ];
    }
}
