<?php

namespace App\Http\Requests;

use App\Models\Slide;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSlideRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:50'],
            'image_desktop' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // máx 10MB
            'image_mobile' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // máx 10MB
            'link' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable'], // Se prepara en prepareForValidation
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // Convertir is_active a boolean real (FormData envía strings)
        if ($this->has('is_active')) {
            $this->merge([
                'is_active' => filter_var($this->is_active, FILTER_VALIDATE_BOOLEAN),
            ]);
        }
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Verificar límite de slides activos solo si se quiere activar
            if ($this->input('is_active', false) && !Slide::canActivateMore()) {
                $validator->errors()->add(
                    'is_active',
                    'Ya existen ' . Slide::MAX_ACTIVE_SLIDES . ' slides activos. Desactiva uno antes de activar otro.'
                );
            }
        });
    }

    /**
     * Get custom attributes for validator errors.
     */
    public function attributes(): array
    {
        return [
            'title' => 'título',
            'image_desktop' => 'imagen desktop',
            'image_mobile' => 'imagen mobile',
            'link' => 'enlace',
            'is_active' => 'estado activo',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.max' => 'El título no puede superar los 50 caracteres.',

            'image_desktop.required' => 'La imagen de escritorio es obligatoria.',
            'image_desktop.image' => 'El archivo de escritorio debe ser una imagen válida.',
            'image_desktop.mimes' => 'La imagen de escritorio debe ser JPEG, PNG, JPG o WebP.',
            'image_desktop.max' => 'La imagen de escritorio no puede superar los 10MB.',

            'image_mobile.required' => 'La imagen móvil es obligatoria.',
            'image_mobile.image' => 'El archivo móvil debe ser una imagen válida.',
            'image_mobile.mimes' => 'La imagen móvil debe ser JPEG, PNG, JPG o WebP.',
            'image_mobile.max' => 'La imagen móvil no puede superar los 10MB.',

            'link.max' => 'El enlace no puede superar los 255 caracteres.',
        ];
    }
}
