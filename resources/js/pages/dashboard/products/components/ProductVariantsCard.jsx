import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Grid3x3, Package } from 'lucide-react';

export default function ProductVariantsCard({ variants }) {
    if (!variants || variants.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Grid3x3 className="mr-2 h-5 w-5" />
                        Variantes del Producto
                    </CardTitle>
                    <CardDescription>Configuraciones y opciones disponibles</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-400 italic">Este producto no tiene variantes</p>
                </CardContent>
            </Card>
        );
    }

    // Separar variantes por tipo
    const apparelVariants = variants.filter((v) => v.variant_type === 'apparel');
    const standardVariants = variants.filter((v) => v.variant_type === 'standard');

    const renderVariantBadge = (variant) => {
        const isLowStock = variant.stock < 10;
        const isOutOfStock = variant.stock === 0;

        return (
            <div key={variant.id || variant.sku} className="rounded-lg border border-gray-200 p-4">
                {/* SKU */}
                <div className="mb-3 flex items-center justify-between">
                    <span className="font-mono text-xs font-semibold text-gray-600">{variant.sku}</span>
                    <Badge variant={isOutOfStock ? 'destructive' : isLowStock ? 'warning' : 'default'} className="text-xs">
                        Stock: {variant.stock || 0}
                    </Badge>
                </div>

                <Separator className="my-2" />

                {/* Detalles según tipo de variante */}
                {variant.variant_type === 'apparel' ? (
                    <div className="space-y-2">
                        {variant.size && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-sm font-medium text-gray-700">Talle:</span>
                                <Badge variant="outline">{variant.size}</Badge>
                            </div>
                        )}
                        {variant.color && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-sm font-medium text-gray-700">Color:</span>
                                <div className="flex items-center gap-2">
                                    {variant.primary_color && (
                                        <div
                                            className="h-4 w-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: variant.primary_color }}
                                            title={variant.primary_color}
                                        />
                                    )}
                                    <span className="text-xs text-gray-700">{variant.color}</span>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {variant.primary_color_text && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-sm font-medium text-gray-700">Color primario:</span>
                                <div className="flex items-center gap-2">
                                    {variant.primary_color && (
                                        <div
                                            className="h-4 w-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: variant.primary_color }}
                                            title={variant.primary_color}
                                        />
                                    )}
                                    <span className="text-xs text-gray-700">{variant.primary_color_text}</span>
                                </div>
                            </div>
                        )}
                        {variant.secondary_color_text && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-sm font-medium text-gray-700">Color secundario:</span>
                                <div className="flex items-center gap-2">
                                    {variant.secondary_color && (
                                        <div
                                            className="h-4 w-4 rounded-full border border-gray-300"
                                            style={{ backgroundColor: variant.secondary_color }}
                                            title={variant.secondary_color}
                                        />
                                    )}
                                    <span className="text-xs text-gray-700">{variant.secondary_color_text}</span>
                                </div>
                            </div>
                        )}
                        {variant.material_text && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-sm font-medium text-gray-700">Material:</span>
                                <Badge variant="outline" className="text-xs">
                                    {variant.material_text}
                                </Badge>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Grid3x3 className="mr-2 h-5 w-5" />
                    Variantes del Producto
                </CardTitle>
                <CardDescription>Configuraciones y opciones disponibles ({variants.length})</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {/* Variantes tipo Apparel */}
                    {apparelVariants.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <h4 className="text-sm font-semibold text-gray-700">Variantes de Indumentaria</h4>
                                <Badge variant="secondary" className="text-xs">
                                    {apparelVariants.length}
                                </Badge>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">{apparelVariants.map(renderVariantBadge)}</div>
                        </div>
                    )}

                    {/* Separador si hay ambos tipos */}
                    {apparelVariants.length > 0 && standardVariants.length > 0 && <Separator />}

                    {/* Variantes tipo Standard */}
                    {standardVariants.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4 text-gray-500" />
                                <h4 className="text-sm font-semibold text-gray-700">Variantes Estándar</h4>
                                <Badge variant="secondary" className="text-xs">
                                    {standardVariants.length}
                                </Badge>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">{standardVariants.map(renderVariantBadge)}</div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
