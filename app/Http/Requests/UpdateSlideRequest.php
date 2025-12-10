<?php

namespace App\Http\Requests;

use App\Models\Slide;
use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSlideRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:80'],
            'image_desktop' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // opcional en update
            'image_mobile' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:10240'], // opcional en update
            'link' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
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
            $slide = $this->route('slide');

            // Verificar límite de slides activos solo si:
            // 1. Se quiere activar el slide
            // 2. El slide actualmente no está activo
            // 3. Ya se alcanzó el límite
            if (
                $this->input('is_active', false) &&
                !$slide->is_active &&
                !Slide::canActivateMore()
            ) {
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
            'sort_order' => 'orden',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'El título es obligatorio.',
            'title.max' => 'El título no puede superar los 80 caracteres.',

            'image_desktop.image' => 'El archivo de escritorio debe ser una imagen válida.',
            'image_desktop.mimes' => 'La imagen de escritorio debe ser JPEG, PNG, JPG o WebP.',
            'image_desktop.max' => 'La imagen de escritorio no puede superar los 10MB.',

            'image_mobile.image' => 'El archivo móvil debe ser una imagen válida.',
            'image_mobile.mimes' => 'La imagen móvil debe ser JPEG, PNG, JPG o WebP.',
            'image_mobile.max' => 'La imagen móvil no puede superar los 10MB.',

            'link.max' => 'El enlace no puede superar los 255 caracteres.',
        ];
    }
}
