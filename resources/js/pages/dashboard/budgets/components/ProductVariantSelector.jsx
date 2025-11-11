import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Package, Shirt, Box } from 'lucide-react';

/**
 * Componente para seleccionar una variante específica del producto mediante radio buttons
 * Soporta variantes tipo APPAREL (talla/color) y STANDARD (descripciones de elementos)
 */
export default function ProductVariantSelector({ product, selectedVariantId, onVariantSelect, className = '' }) {
    if (!product?.variants || product.variants.length === 0) {
        return null;
    }

    // Separar variantes por tipo
    const apparelVariants = product.variants.filter((v) => v.variant_type === 'apparel');
    const standardVariants = product.variants.filter((v) => v.variant_type === 'standard');

    /**
     * Renderizar descripción de variante según su tipo
     */
    const renderVariantDescription = (variant) => {
        if (variant.variant_type === 'apparel') {
            return (
                <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                        {variant.size && <span>Talla: {variant.size}</span>}
                        {variant.size && variant.color && <span className="mx-1">•</span>}
                        {variant.color && <span>Color: {variant.color}</span>}
                    </span>
                </div>
            );
        }

        // Variante STANDARD
        const descriptions = [variant.primary_color_text, variant.secondary_color_text, variant.material_text].filter(Boolean);

        return (
            <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{descriptions.join(' / ') || 'Sin descripción'}</span>
            </div>
        );
    };

    /**
     * Renderizar badge de stock
     */
    const renderStockBadge = (stock) => {
        if (stock > 10) {
            return <Badge variant="default" className="bg-green-100 text-green-800">Stock: {stock}</Badge>;
        } else if (stock > 0) {
            return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Stock bajo: {stock}</Badge>;
        }
        return <Badge variant="destructive">Sin stock</Badge>;
    };

    /**
     * Renderizar grupo de variantes
     */
    const renderVariantGroup = (variants, title, IconComponent) => {
        if (variants.length === 0) return null;

        return (
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <IconComponent className="h-4 w-4" />
                    {title}
                </div>
                <RadioGroup value={selectedVariantId?.toString()} onValueChange={(value) => onVariantSelect(parseInt(value))}>
                    <div className="space-y-2">
                        {variants.map((variant) => (
                            <div
                                key={variant.id}
                                className={`flex items-center space-x-3 rounded-lg border p-3 transition-colors ${
                                    selectedVariantId === variant.id
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <RadioGroupItem value={variant.id.toString()} id={`variant-${variant.id}`} />
                                <Label
                                    htmlFor={`variant-${variant.id}`}
                                    className="flex flex-1 cursor-pointer flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="flex flex-col gap-1">
                                        {renderVariantDescription(variant)}
                                        {variant.sku && <span className="text-xs text-gray-500">SKU: {variant.sku}</span>}
                                    </div>
                                    <div className="flex items-center gap-2">{renderStockBadge(variant.stock)}</div>
                                </Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
            </div>
        );
    };

    return (
        <div className={`space-y-4 rounded-lg border border-blue-200 bg-blue-50 p-4 ${className}`}>
            <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Seleccionar Variante del Producto</h4>
            </div>

            <p className="text-sm text-blue-700">Este producto tiene variantes disponibles. Selecciona una para agregar al presupuesto.</p>

            {renderVariantGroup(apparelVariants, 'Variantes de Ropa', Shirt)}
            {renderVariantGroup(standardVariants, 'Variantes Estándar', Box)}

            {!selectedVariantId && (
                <p className="text-sm font-medium text-red-600">⚠️ Debes seleccionar una variante para continuar</p>
            )}
        </div>
    );
}
