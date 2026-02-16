<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'sku' => 'required|string|max:255|unique:products,sku',
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
            // Atributos
            'attributes' => 'nullable|array',
            'attributes.*.attribute_name' => 'required_with:attributes|string|max:255',
            'attributes.*.value' => 'required_with:attributes|string|max:255',
            // Variantes
            'variants' => 'nullable|array',
            'variants.*.sku' => [
                'required_with:variants',
                'string',
                'max:255',
                'distinct',
                Rule::unique('product_variants', 'sku')->whereNull('deleted_at'),
            ],
            'variants.*.variant_type' => 'required_with:variants|in:apparel,standard',
            'variants.*.stock' => 'nullable|integer|min:0',
            'variants.*.size' => 'nullable|string|max:50',
            'variants.*.color' => 'nullable|string|max:100',
            'variants.*.primary_color_text' => 'nullable|string|max:255',
            'variants.*.secondary_color_text' => 'nullable|string|max:255',
            'variants.*.material_text' => 'nullable|string|max:255',
            'variants.*.primary_color' => 'nullable|string|max:50',
            'variants.*.secondary_color' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            // SKU
            'sku.required'              => 'El SKU es obligatorio.',
            'sku.max'                   => 'El SKU no puede superar los 255 caracteres.',
            'sku.unique'                => 'Este SKU ya está en uso. Ingresá uno diferente.',
            // Nombre
            'name.required'             => 'El nombre del producto es obligatorio.',
            'name.max'                  => 'El nombre no puede superar los 255 caracteres.',
            // Proveedor
            'proveedor.max'             => 'El proveedor no puede superar los 255 caracteres.',
            // Categorías
            'category_ids.required'     => 'Debés seleccionar al menos una categoría.',
            'category_ids.array'        => 'Las categorías enviadas no son válidas.',
            'category_ids.min'          => 'Debés seleccionar al menos una categoría.',
            'category_ids.*.exists'     => 'Una de las categorías seleccionadas no existe.',
            // Atributos
            'attributes.*.attribute_name.required_with' => 'El nombre del atributo es obligatorio.',
            'attributes.*.attribute_name.max'           => 'El nombre del atributo no puede superar los 255 caracteres.',
            'attributes.*.value.required_with'          => 'El valor del atributo es obligatorio.',
            'attributes.*.value.max'                    => 'El valor del atributo no puede superar los 255 caracteres.',
            // Variantes
            'variants.*.sku.required_with'  => 'El SKU de la variante es obligatorio.',
            'variants.*.sku.max'            => 'El SKU de la variante no puede superar los 255 caracteres.',
            'variants.*.sku.distinct'       => 'Hay SKUs de variante duplicados en el formulario.',
            'variants.*.sku.unique'         => 'El SKU de la variante ya está en uso. Ingresá uno diferente.',
            'variants.*.variant_type.required_with' => 'El tipo de variante es obligatorio.',
            'variants.*.variant_type.in'            => 'El tipo de variante debe ser Apparel o Standard.',
            'variants.*.stock.integer'              => 'El stock debe ser un número entero.',
            'variants.*.stock.min'                  => 'El stock no puede ser negativo.',
            'variants.*.size.max'                   => 'El tamaño no puede superar los 50 caracteres.',
            'variants.*.color.max'                  => 'El color no puede superar los 100 caracteres.',
            'variants.*.primary_color_text.max'     => 'El nombre del color primario no puede superar los 255 caracteres.',
            'variants.*.secondary_color_text.max'   => 'El nombre del color secundario no puede superar los 255 caracteres.',
            'variants.*.material_text.max'          => 'El material no puede superar los 255 caracteres.',
            'variants.*.primary_color.max'          => 'El color primario no puede superar los 50 caracteres.',
            'variants.*.secondary_color.max'        => 'El color secundario no puede superar los 50 caracteres.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $variants = $this->input('variants');

            if (!empty($variants)) {
                $types = collect($variants)->pluck('variant_type')->filter()->unique();

                if ($types->count() > 1) {
                    $validator->errors()->add(
                        'variants',
                        'No se pueden mezclar variantes de tipo Apparel y Standard en un mismo producto.'
                    );
                }
            }
        });
    }
}
