import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Package, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProductModal({ products, existingItems = [], editingItem = null, onClose, onSubmit, checkForDuplicates = null }) {
    // Estados principales
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isVariantMode, setIsVariantMode] = useState(false);
    const [variants, setVariants] = useState([]);
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);

    // Inicialización
    useEffect(() => {
        if (editingItem) {
            initializeEditMode();
        } else {
            initializeCreateMode();
        }
    }, [editingItem, products]);

    const initializeEditMode = () => {
        if (editingItem.isVariantGroup) {
            // Editando grupo de variantes
            const firstItem = editingItem.items[0];
            const product = products.find((p) => p.id === firstItem.product_id);

            if (product) {
                setSelectedProduct(product);
                setIsVariantMode(true);

                const variantData = editingItem.items.map((item, index) => ({
                    id: `variant_${index}_${Date.now()}`,
                    quantity: item.quantity.toString(),
                    unit_price: item.unit_price.toString(),
                    production_time_days: item.production_time_days ? item.production_time_days.toString() : '',
                    logo_printing: item.logo_printing || '',
                }));

                setVariants(variantData);
            }
        } else {
            // Editando item individual
            const product = products.find((p) => p.id === editingItem.product_id);

            if (product) {
                setSelectedProduct(product);
                setIsVariantMode(false);

                setVariants([
                    {
                        id: `variant_0_${Date.now()}`,
                        quantity: editingItem.quantity.toString(),
                        unit_price: editingItem.unit_price.toString(),
                        production_time_days: editingItem.production_time_days ? editingItem.production_time_days.toString() : '',
                        logo_printing: editingItem.logo_printing || '',
                    },
                ]);
            }
        }
    };

    const initializeCreateMode = () => {
        setSelectedProduct(null);
        setIsVariantMode(false);
        setVariants([createEmptyVariant()]);
        setErrors([]);
        setWarnings([]);
    };

    const createEmptyVariant = () => ({
        id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: '',
        unit_price: '',
        production_time_days: '',
        logo_printing: '',
    });

    const handleProductSelect = (productId) => {
        const product = products.find((p) => p.id == productId);
        if (!product) return;

        setSelectedProduct(product);

        // Crear nueva variante con precio del producto
        const newVariant = {
            ...createEmptyVariant(),
            unit_price: product.last_price ? product.last_price.toString() : '',
        };

        setVariants([newVariant]);
        setIsVariantMode(false);

        // Verificar duplicados
        checkDuplicates(product);
    };

    const checkDuplicates = (product) => {
        if (!checkForDuplicates) return;

        // Crear un item temporal para la verificación de duplicados
        const tempItem = {
            product_id: product.id,
            product: product,
        };

        const duplicateCheck = checkForDuplicates([tempItem], editingItem);
        if (duplicateCheck.length > 0) {
            setWarnings([
                {
                    type: 'duplicate',
                    message: `Este producto ya existe en el presupuesto. Al confirmar, se reemplazará la línea existente.`,
                },
            ]);
        } else {
            setWarnings([]);
        }
    };

    const handleVariantModeToggle = (checked) => {
        setIsVariantMode(checked);

        if (checked) {
            // Al activar modo variante, asegurar al menos 2 variantes
            if (variants.length < 2) {
                const newVariants = [{ ...variants[0] }, { ...createEmptyVariant() }];
                setVariants(newVariants);
            }
        } else {
            // Al desactivar, mantener solo la primera
            setVariants([{ ...variants[0] }]);
        }

        validateForm();
    };

    const addVariant = () => {
        const newVariant = {
            ...createEmptyVariant(),
            unit_price: selectedProduct?.last_price?.toString() || '',
        };
        setVariants([...variants, newVariant]);
    };

    const removeVariant = (variantId) => {
        if (variants.length <= 1) return;

        const newVariants = variants.filter((v) => v.id !== variantId);
        setVariants(newVariants);
        validateForm();
    };

    const updateVariant = (variantId, field, value) => {
        setVariants((prev) => prev.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)));

        validateForm();
    };

    const validateForm = () => {
        const newErrors = [];

        // Validar producto seleccionado
        if (!selectedProduct) {
            newErrors.push({ field: 'product', message: 'Debe seleccionar un producto' });
        }

        // Validar variantes
        variants.forEach((variant, index) => {
            if (!variant.quantity || parseInt(variant.quantity) <= 0) {
                newErrors.push({
                    field: `variant_${index}_quantity`,
                    message: `Cantidad en variante ${index + 1} debe ser mayor a 0`,
                });
            }

            if (!variant.unit_price || parseFloat(variant.unit_price) < 0) {
                newErrors.push({
                    field: `variant_${index}_price`,
                    message: `Precio en variante ${index + 1} debe ser mayor o igual a 0`,
                });
            }
        });

        // Validar modo variante
        if (isVariantMode && variants.length < 2) {
            newErrors.push({ field: 'variants', message: 'Productos con variantes deben tener al menos 2 opciones' });
        }

        // Validar que las variantes sean distintas
        if (isVariantMode && variants.length >= 2) {
            const duplicateVariants = [];
            variants.forEach((variant, i) => {
                variants.forEach((otherVariant, j) => {
                    if (i !== j && variant.quantity === otherVariant.quantity && variant.unit_price === otherVariant.unit_price) {
                        duplicateVariants.push(`Variantes ${i + 1} y ${j + 1} son idénticas`);
                    }
                });
            });

            if (duplicateVariants.length > 0) {
                newErrors.push({ field: 'variants', message: duplicateVariants[0] });
            }
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount || 0);
    };

    const calculateLineTotal = (quantity, unitPrice) => {
        const qty = parseFloat(quantity) || 0;
        const price = parseFloat(unitPrice) || 0;
        return qty * price;
    };

    const handleSubmit = () => {
        if (!validateForm()) return;

        // Generar el variant_group UNA SOLA VEZ fuera del map
        const variantGroup = isVariantMode
            ? editingItem?.isVariantGroup
                ? editingItem.group
                : `variant_${selectedProduct.name}_${Date.now()}`
            : null;

        console.log('Variant group generado:', variantGroup);

        const itemsToReturn = variants.map((variant, index) => {
            const quantity = parseInt(variant.quantity);
            const unitPrice = parseFloat(variant.unit_price);

            const item = {
                id: editingItem?.isVariantGroup
                    ? editingItem.items[index]?.id || `new_${Date.now()}_${index}`
                    : editingItem && !editingItem.isVariantGroup
                      ? editingItem.id
                      : `new_${Date.now()}_${index}`,
                product_id: selectedProduct.id,
                product: selectedProduct,
                quantity,
                unit_price: unitPrice,
                production_time_days: variant.production_time_days ? parseInt(variant.production_time_days) : null,
                logo_printing: variant.logo_printing || null,
                line_total: quantity * unitPrice,
                variant_group: variantGroup,
                is_variant: isVariantMode,
                is_selected: isVariantMode ? index === 0 : true, // Primera variante siempre seleccionada
            };

            console.log(`Modal enviando item ${item.id}: variant_group=${item.variant_group}, is_selected=${item.is_selected}`);
            return item;
        });

        console.log('Modal: Items finales a enviar:', itemsToReturn);
        onSubmit(itemsToReturn);
    };

    const isFormValid = errors.length === 0 && selectedProduct && variants.length > 0;

    return (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
            <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        {editingItem ? 'Editar Producto' : 'Agregar Producto'}
                    </CardTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Selector de producto */}
                    <div>
                        <Label className="text-base font-medium">Producto *</Label>
                        <Select value={selectedProduct?.id?.toString() || ''} onValueChange={handleProductSelect}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Seleccionar producto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem key={product.id} value={product.id.toString()}>
                                        <div className="flex items-center gap-3">
                                            {product.images && product.images.length > 0 ? (
                                                <img src={product.images[0].url} alt={product.name} className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                                                    <Package className="h-5 w-5 text-gray-400" />
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium">{product.name}</span>
                                                {product.last_price && (
                                                    <span className="text-sm text-gray-500">{formatCurrency(product.last_price)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.some((e) => e.field === 'product') && (
                            <p className="mt-1 text-sm text-red-600">{errors.find((e) => e.field === 'product').message}</p>
                        )}
                    </div>

                    {/* Alertas de advertencia */}
                    {warnings.length > 0 && (
                        <Alert className="border-amber-200 bg-amber-50">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <AlertDescription className="text-amber-800">{warnings[0].message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Errores de validación */}
                    {errors.some((e) => e.field === 'variants') && (
                        <Alert className="border-red-200 bg-red-50">
                            <X className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">{errors.find((e) => e.field === 'variants').message}</AlertDescription>
                        </Alert>
                    )}

                    {/* Solo mostrar formularios si hay producto seleccionado */}
                    {selectedProduct && (
                        <>
                            {/* Formularios de variantes */}
                            <div className="space-y-4">
                                {variants.map((variant, index) => (
                                    <VariantFormSimple
                                        key={variant.id}
                                        variant={variant}
                                        index={index}
                                        isVariantMode={isVariantMode}
                                        canRemove={variants.length > 1}
                                        onUpdate={updateVariant}
                                        onRemove={() => removeVariant(variant.id)}
                                        errors={errors}
                                        formatCurrency={formatCurrency}
                                        calculateLineTotal={calculateLineTotal}
                                    />
                                ))}
                            </div>

                            {/* Checkbox para modo variante */}
                            <div className="flex items-center space-x-2 border-t pt-4">
                                <Checkbox id="is_variant" checked={isVariantMode} onCheckedChange={handleVariantModeToggle} />
                                <Label htmlFor="is_variant" className="text-sm font-medium">
                                    Es un producto con variantes
                                </Label>
                            </div>

                            {/* Panel informativo para variantes */}
                            {isVariantMode && (
                                <div className="rounded-lg bg-blue-50 p-4">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="font-medium text-blue-900">Variantes del producto</h4>
                                        <Button type="button" size="sm" onClick={addVariant} className="flex items-center gap-1">
                                            <Plus className="h-3 w-3" />
                                            Agregar variante
                                        </Button>
                                    </div>
                                    <div className="space-y-1 text-sm text-blue-700">
                                        <p>• Los productos con variantes deben tener al menos 2 opciones diferentes</p>
                                        <p>• Las variantes deben diferir en cantidad o precio</p>
                                        <p>
                                            • <strong>La primera variante se incluirá por defecto</strong> en el presupuesto
                                        </p>
                                        <p>• Podrás cambiar la selección después desde el presupuesto principal</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end gap-3 border-t pt-6">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button type="button" onClick={handleSubmit} disabled={!isFormValid} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            {editingItem ? 'Actualizar' : 'Agregar'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

// Componente de formulario de variante simplificado (sin radio buttons)
function VariantFormSimple({ variant, index, isVariantMode, canRemove, onUpdate, onRemove, errors, formatCurrency, calculateLineTotal }) {
    const hasError = errors.some((e) => e.field.includes(`variant_${index}`));
    const lineTotal = calculateLineTotal(variant.quantity, variant.unit_price);

    return (
        <div className={`rounded-lg border p-4 ${hasError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="mb-4 flex items-center justify-between">
                <h5 className="font-medium text-gray-900">{isVariantMode ? `Variante ${index + 1}` : 'Producto'}</h5>
                {canRemove && (
                    <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:bg-red-100 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <Label htmlFor={`quantity_${variant.id}`} className="text-sm font-medium">
                        Cantidad *
                    </Label>
                    <Input
                        id={`quantity_${variant.id}`}
                        type="number"
                        min="1"
                        value={variant.quantity}
                        onChange={(e) => onUpdate(variant.id, 'quantity', e.target.value)}
                        placeholder="Ej: 100"
                        className={`mt-1 ${hasError ? 'border-red-300' : ''}`}
                    />
                    {errors.some((e) => e.field === `variant_${index}_quantity`) && (
                        <p className="mt-1 text-xs text-red-600">{errors.find((e) => e.field === `variant_${index}_quantity`).message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={`unit_price_${variant.id}`} className="text-sm font-medium">
                        Precio Unitario *
                    </Label>
                    <Input
                        id={`unit_price_${variant.id}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.unit_price}
                        onChange={(e) => onUpdate(variant.id, 'unit_price', e.target.value)}
                        placeholder="Ej: 1500.00"
                        className={`mt-1 ${hasError ? 'border-red-300' : ''}`}
                    />
                    {errors.some((e) => e.field === `variant_${index}_price`) && (
                        <p className="mt-1 text-xs text-red-600">{errors.find((e) => e.field === `variant_${index}_price`).message}</p>
                    )}
                </div>

                <div>
                    <Label htmlFor={`production_time_${variant.id}`} className="text-sm font-medium">
                        Tiempo de Producción (días)
                    </Label>
                    <Input
                        id={`production_time_${variant.id}`}
                        type="number"
                        min="1"
                        value={variant.production_time_days}
                        onChange={(e) => onUpdate(variant.id, 'production_time_days', e.target.value)}
                        placeholder="Ej: 15"
                        className="mt-1"
                    />
                </div>

                <div>
                    <Label htmlFor={`logo_printing_${variant.id}`} className="text-sm font-medium">
                        Impresión de Logo
                    </Label>
                    <Input
                        id={`logo_printing_${variant.id}`}
                        value={variant.logo_printing}
                        onChange={(e) => onUpdate(variant.id, 'logo_printing', e.target.value)}
                        placeholder="Ej: Serigrafía 1 color"
                        className="mt-1"
                    />
                </div>
            </div>

            {/* Total de la línea */}
            {variant.quantity && variant.unit_price && lineTotal > 0 && (
                <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 p-3">
                    <span className="text-sm font-medium text-green-800">Total de esta línea:</span>
                    <span className="text-lg font-bold text-green-900">{formatCurrency(lineTotal)}</span>
                </div>
            )}

            {/* Mensaje informativo para variantes */}
            {isVariantMode && index === 0 && (
                <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-2">
                    <p className="text-sm text-blue-700">
                        <strong>Nota:</strong> La primera variante se incluirá por defecto en el presupuesto. Podrás cambiar la selección después
                        desde el presupuesto.
                    </p>
                </div>
            )}
        </div>
    );
}
