<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $product = $this->route('product');
        $ownVariantIds = $product->variants()->pluck('id')->toArray();

        return [
            'sku' => 'required|string|max:255|unique:products,sku,' . $product->id,
            'name' => ['required', 'string', 'max:255'],
            'description' => 'nullable|string',
            'proveedor' => 'nullable|string|max:255',
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
            'is_visible_in_front' => 'boolean',
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
                Rule::unique('product_variants', 'sku')
                    ->whereNull('deleted_at')
                    ->whereNotIn('id', $ownVariantIds),
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
