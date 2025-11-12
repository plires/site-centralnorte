import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Box, Package, Shirt } from 'lucide-react';

/**
 * Componente para seleccionar una variante específica del producto mediante radio buttons
 * Muestra SOLO las variantes correspondientes al tipo de producto (Apparel o Standard)
 */
export default function ProductVariantSelector({ product, selectedVariantId, onVariantSelect, className = '' }) {
    if (!product?.variants || product.variants.length === 0) {
        return null;
    }

    /**
     * Determinar el tipo de producto basándose en sus categorías
     * Un producto es Apparel si tiene una categoría que contenga "Apparel"
     */
    const isApparelProduct = () => {
        if (!product.categories || product.categories.length === 0) {
            return false;
        }

        return product.categories.some((category) => category.name && category.name.toLowerCase().includes('apparel'));
    };

    const productIsApparel = isApparelProduct();

    /**
     * Filtrar variantes según el tipo de producto
     * - Si el producto es Apparel → solo variantes apparel
     * - Si el producto es Standard → solo variantes standard
     */
    const relevantVariants = product.variants.filter((variant) => {
        if (productIsApparel) {
            return variant.variant_type === 'apparel';
        } else {
            return variant.variant_type === 'standard';
        }
    });

    // Si no hay variantes relevantes después de filtrar, no mostrar nada
    if (relevantVariants.length === 0) {
        return (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-medium text-yellow-900">Sin variantes disponibles</h4>
                </div>
                <p className="mt-2 text-sm text-yellow-700">
                    Este producto no tiene variantes del tipo {productIsApparel ? 'Apparel' : 'Standard'} disponibles.
                </p>
            </div>
        );
    }

    /**
     * Renderizar descripción de variante según su tipo
     */
    const renderVariantDescription = (variant) => {
        if (variant.variant_type === 'apparel') {
            const parts = [];

            if (variant.size) parts.push(`Talla: ${variant.size}`);
            if (variant.color) parts.push(`Color: ${variant.color}`);

            return (
                <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{parts.join(' • ') || 'Sin descripción'}</span>
                </div>
            );
        }

        // Variante STANDARD
        const descriptionParts = [];

        if (variant.primary_color_text) {
            descriptionParts.push(`Color Primario: ${variant.primary_color_text}`);
        }
        if (variant.secondary_color_text) {
            descriptionParts.push(`Color Secundario: ${variant.secondary_color_text}`);
        }
        if (variant.material_text) {
            descriptionParts.push(`Material: ${variant.material_text}`);
        }

        return (
            <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{descriptionParts.join(' - ') || 'Sin descripción'}</span>
            </div>
        );
    };

    /**
     * Renderizar badge de stock con colores semánticos
     */
    const renderStockBadge = (stock) => {
        if (stock > 10) {
            return (
                <Badge variant="default" className="border-green-200 bg-green-100 text-green-800">
                    Stock: {stock}
                </Badge>
            );
        } else if (stock > 0) {
            return (
                <Badge variant="default" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    Stock bajo: {stock}
                </Badge>
            );
        }
        return <Badge variant="destructive">Sin stock</Badge>;
    };

    /**
     * Obtener título del selector según el tipo de producto
     */
    const getSelectorTitle = () => {
        if (productIsApparel) {
            return {
                icon: Shirt,
                title: 'Seleccionar Variante de Ropa',
                description: 'Selecciona la talla y color deseados.',
            };
        } else {
            return {
                icon: Box,
                title: 'Seleccionar Variante del Producto',
                description: 'Selecciona la variante deseada.',
            };
        }
    };

    const selectorInfo = getSelectorTitle();
    const SelectorIcon = selectorInfo.icon;

    return (
        <div className={`space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 ${className}`}>
            {/* Encabezado */}
            <div className="flex items-center gap-2">
                <SelectorIcon className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">{selectorInfo.title}</h4>
            </div>

            <p className="text-sm text-blue-700">{selectorInfo.description}</p>

            {/* Lista de variantes con radio buttons */}
            <RadioGroup value={selectedVariantId?.toString()} onValueChange={(value) => onVariantSelect(parseInt(value))}>
                <div className="space-y-2">
                    {relevantVariants.map((variant) => (
                        <div
                            key={variant.id}
                            className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                                selectedVariantId === variant.id
                                    ? 'border-primary bg-primary/5 ring-primary/20 ring-2'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                            <RadioGroupItem value={variant.id.toString()} id={`variant-${variant.id}`} className="mt-0" />
                            <Label
                                htmlFor={`variant-${variant.id}`}
                                className="flex flex-1 cursor-pointer flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                            >
                                {/* Descripción de la variante */}
                                <div className="flex flex-col gap-1">
                                    {renderVariantDescription(variant)}
                                    {/* {variant.sku && <span className="text-xs text-gray-500">SKU: {variant.sku}</span>} */}
                                </div>

                                {/* Badge de stock */}
                                <div className="flex items-center gap-2">{renderStockBadge(variant.stock)}</div>
                            </Label>
                        </div>
                    ))}
                </div>
            </RadioGroup>

            {/* Advertencia si no se ha seleccionado */}
            {!selectedVariantId && (
                <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <span className="text-sm font-medium text-red-600">⚠️ Debes seleccionar una variante para continuar</span>
                </div>
            )}

            {/* Información adicional */}
            <div className="text-xs text-blue-600">
                💡 Mostrando {relevantVariants.length} variante{relevantVariants.length !== 1 ? 's' : ''}
                {productIsApparel ? ' de ropa' : ' estándar'} disponible{relevantVariants.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
