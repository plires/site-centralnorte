<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProductImageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'image' => 'required|file|mimes:jpg,jpeg,png,gif,webp|max:5120', // máx 5MB
            'variant' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'image.required' => 'No se recibió ninguna imagen.',
            'image.file'     => 'El archivo enviado no es válido.',
            'image.uploaded' => 'La imagen no puede superar los 5 MB.',
            'image.mimes'    => 'El formato de la imagen no es válido. Solo se aceptan JPG, PNG, GIF y WEBP.',
            'image.max'      => 'La imagen no puede superar los 5 MB.',
            'variant.max'    => 'La variante no puede superar los 255 caracteres.',
        ];
    }
}
