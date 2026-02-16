import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Grid3x3, Plus, Trash2 } from 'lucide-react';

export default function ProductVariantsSection({ variants, onChange, errors = {} }) {
    const addVariant = (type) => {
        const newVariant = {
            id: `temp_${Date.now()}`,
            sku: '',
            stock: 0,
            primary_color: '',
            secondary_color: '',
            variant_type: type,
        };

        if (type === 'apparel') {
            newVariant.size = '';
            newVariant.color = '';
        } else {
            newVariant.primary_color_text = '';
            newVariant.secondary_color_text = '';
            newVariant.material_text = '';
        }

        onChange([...variants, newVariant]);
    };

    const removeVariant = (index) => {
        onChange(variants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const updated = [...variants];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    const apparelVariants = variants.filter((v) => v.variant_type === 'apparel');
    const standardVariants = variants.filter((v) => v.variant_type === 'standard');

    // No se pueden mezclar tipos: si hay apparel, se bloquea standard y viceversa
    const isApparelLocked = standardVariants.length > 0;
    const isStandardLocked = apparelVariants.length > 0;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Grid3x3 className="mr-2 h-5 w-5" />
                    Variantes del Producto
                </CardTitle>
                <CardDescription>Gestiona las variantes del producto (tamaños, colores, configuraciones, etc.)</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="apparel" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="apparel">
                            Apparel
                            {apparelVariants.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {apparelVariants.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="standard">
                            Standard
                            {standardVariants.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {standardVariants.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab Apparel */}
                    <TabsContent value="apparel" className="space-y-4">
                        {apparelVariants.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                                <Grid3x3 className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    Existen dos tipos de variantes: Apparel (todo lo que es indumentaria) y Standard: (lo que no es indumentaria){' '}
                                    <br />
                                    No hay variantes tipo Apparel. Haz clic en "Agregar Variante Apparel" para comenzar.
                                </p>
                            </div>
                        ) : (
                            apparelVariants.map((variant, globalIndex) => {
                                const index = variants.indexOf(variant);
                                return (
                                    <div key={variant.id || globalIndex} className="rounded-lg border border-gray-200 p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="font-medium">Variante Apparel #{globalIndex + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeVariant(index)}
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {/* SKU */}
                                            <div className="space-y-2">
                                                <Label>SKU *</Label>
                                                <Input
                                                    value={variant.sku}
                                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                    placeholder="SKU único"
                                                    className={errors[`variants.${index}.sku`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.sku`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.sku`]}</span>
                                                )}
                                            </div>

                                            {/* Tamaño */}
                                            <div className="space-y-2">
                                                <Label>Tamaño</Label>
                                                <Input
                                                    value={variant.size || ''}
                                                    onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                                    placeholder="Ej: M, L, XL"
                                                    className={errors[`variants.${index}.size`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.size`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.size`]}</span>
                                                )}
                                            </div>

                                            {/* Color */}
                                            <div className="space-y-2">
                                                <Label>Color</Label>
                                                <Input
                                                    value={variant.color || ''}
                                                    onChange={(e) => updateVariant(index, 'color', e.target.value)}
                                                    placeholder="Ej: Rojo, Azul"
                                                    className={errors[`variants.${index}.color`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.color`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.color`]}</span>
                                                )}
                                            </div>

                                            {/* Stock */}
                                            <div className="space-y-2">
                                                <Label>Stock</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    min="0"
                                                    className={errors[`variants.${index}.stock`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.stock`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.stock`]}</span>
                                                )}
                                            </div>

                                            {/* Color Primario */}
                                            <div className="space-y-2">
                                                <Label>Color Primario</Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={variant.primary_color || '#000000'}
                                                        onChange={(e) => updateVariant(index, 'primary_color', e.target.value)}
                                                        className="border-input h-9 w-9 cursor-pointer rounded-md border p-0.5"
                                                    />
                                                    <Input
                                                        value={variant.primary_color || ''}
                                                        onChange={(e) => updateVariant(index, 'primary_color', e.target.value)}
                                                        placeholder="#000000"
                                                        className={errors[`variants.${index}.primary_color`] ? 'border-red-500' : ''}
                                                    />
                                                </div>
                                                {errors[`variants.${index}.primary_color`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.primary_color`]}</span>
                                                )}
                                            </div>

                                            {/* Color Secundario */}
                                            <div className="space-y-2">
                                                <Label>Color Secundario</Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={variant.secondary_color || '#FFFFFF'}
                                                        onChange={(e) => updateVariant(index, 'secondary_color', e.target.value)}
                                                        className="border-input h-9 w-9 cursor-pointer rounded-md border p-0.5"
                                                    />
                                                    <Input
                                                        value={variant.secondary_color || ''}
                                                        onChange={(e) => updateVariant(index, 'secondary_color', e.target.value)}
                                                        placeholder="#FFFFFF"
                                                        className={errors[`variants.${index}.secondary_color`] ? 'border-red-500' : ''}
                                                    />
                                                </div>
                                                {errors[`variants.${index}.secondary_color`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.secondary_color`]}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {isApparelLocked ? (
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>No se pueden agregar variantes Apparel porque ya existen variantes Standard. Eliminá las variantes Standard primero.</span>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => addVariant('apparel')} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Variante Apparel
                            </Button>
                        )}
                    </TabsContent>

                    {/* Tab Standard */}
                    <TabsContent value="standard" className="space-y-4">
                        {standardVariants.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                                <Grid3x3 className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-500">
                                    Existen dos tipos de variantes: Apparel (todo lo que es indumentaria) y Standard: (lo que no es indumentaria){' '}
                                    <br />
                                    No hay variantes tipo Standard. Haz clic en "Agregar Variante Standard" para comenzar.
                                </p>
                            </div>
                        ) : (
                            standardVariants.map((variant, globalIndex) => {
                                const index = variants.indexOf(variant);
                                return (
                                    <div key={variant.id || globalIndex} className="rounded-lg border border-gray-200 p-4">
                                        <div className="mb-4 flex items-center justify-between">
                                            <h4 className="font-medium">Variante Standard #{globalIndex + 1}</h4>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeVariant(index)}
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                            {/* SKU */}
                                            <div className="space-y-2">
                                                <Label>SKU *</Label>
                                                <Input
                                                    value={variant.sku}
                                                    onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                                                    placeholder="SKU único"
                                                    className={errors[`variants.${index}.sku`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.sku`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.sku`]}</span>
                                                )}
                                            </div>

                                            {/* Nombre color primario */}
                                            <div className="space-y-2">
                                                <Label>Nombre color primario</Label>
                                                <Input
                                                    value={variant.primary_color_text || ''}
                                                    onChange={(e) => updateVariant(index, 'primary_color_text', e.target.value)}
                                                    placeholder="Nombre color primario"
                                                    className={errors[`variants.${index}.primary_color_text`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.primary_color_text`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.primary_color_text`]}</span>
                                                )}
                                            </div>

                                            {/* Color Primario */}
                                            <div className="space-y-2">
                                                <Label>Color Primario</Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={variant.primary_color || '#000000'}
                                                        onChange={(e) => updateVariant(index, 'primary_color', e.target.value)}
                                                        className="border-input h-9 w-9 cursor-pointer rounded-md border p-0.5"
                                                    />
                                                    <Input
                                                        value={variant.primary_color || ''}
                                                        onChange={(e) => updateVariant(index, 'primary_color', e.target.value)}
                                                        placeholder="#000000"
                                                        className={errors[`variants.${index}.primary_color`] ? 'border-red-500' : ''}
                                                    />
                                                </div>
                                                {errors[`variants.${index}.primary_color`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.primary_color`]}</span>
                                                )}
                                            </div>

                                            {/* Material */}
                                            <div className="space-y-2">
                                                <Label>Material</Label>
                                                <Input
                                                    value={variant.material_text || ''}
                                                    onChange={(e) => updateVariant(index, 'material_text', e.target.value)}
                                                    placeholder="Material"
                                                    className={errors[`variants.${index}.material_text`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.material_text`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.material_text`]}</span>
                                                )}
                                            </div>

                                            {/* Nombre color secundario */}
                                            <div className="space-y-2">
                                                <Label>Nombre color secundario</Label>
                                                <Input
                                                    value={variant.secondary_color_text || ''}
                                                    onChange={(e) => updateVariant(index, 'secondary_color_text', e.target.value)}
                                                    placeholder="Nombre color secundario"
                                                    className={errors[`variants.${index}.secondary_color_text`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.secondary_color_text`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.secondary_color_text`]}</span>
                                                )}
                                            </div>

                                            {/* Color Secundario */}
                                            <div className="space-y-2">
                                                <Label>Color Secundario</Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="color"
                                                        value={variant.secondary_color || '#FFFFFF'}
                                                        onChange={(e) => updateVariant(index, 'secondary_color', e.target.value)}
                                                        className="border-input h-9 w-9 cursor-pointer rounded-md border p-0.5"
                                                    />
                                                    <Input
                                                        value={variant.secondary_color || ''}
                                                        onChange={(e) => updateVariant(index, 'secondary_color', e.target.value)}
                                                        placeholder="#FFFFFF"
                                                        className={errors[`variants.${index}.secondary_color`] ? 'border-red-500' : ''}
                                                    />
                                                </div>
                                                {errors[`variants.${index}.secondary_color`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.secondary_color`]}</span>
                                                )}
                                            </div>

                                            {/* Stock */}
                                            <div className="space-y-2">
                                                <Label>Stock</Label>
                                                <Input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                                                    placeholder="0"
                                                    min="0"
                                                    className={errors[`variants.${index}.stock`] ? 'border-red-500' : ''}
                                                />
                                                {errors[`variants.${index}.stock`] && (
                                                    <span className="text-xs text-red-500">{errors[`variants.${index}.stock`]}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}

                        {isStandardLocked ? (
                            <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>No se pueden agregar variantes Standard porque ya existen variantes Apparel. Eliminá las variantes Apparel primero.</span>
                            </div>
                        ) : (
                            <Button type="button" variant="outline" onClick={() => addVariant('standard')} className="w-full">
                                <Plus className="mr-2 h-4 w-4" />
                                Agregar Variante Standard (no Apparel)
                            </Button>
                        )}
                    </TabsContent>
                </Tabs>

                {errors.variants && <span className="mt-2 block text-xs text-red-500">{errors.variants}</span>}
            </CardContent>
        </Card>
    );
}
