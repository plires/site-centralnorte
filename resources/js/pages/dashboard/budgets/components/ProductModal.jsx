import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Package, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import ProductVariantSelector from './ProductVariantSelector';
import VariantForm from './VariantForm';

export default function ProductModal({ products, existingItems = [], editingItem = null, onClose, onSubmit, checkForDuplicates = null }) {
    // Estados principales
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isVariantMode, setIsVariantMode] = useState(false);
    const [selectedProductVariantId, setSelectedProductVariantId] = useState(null);
    const [variants, setVariants] = useState([]);
    const [errors, setErrors] = useState([]);
    const [warnings, setWarnings] = useState([]);

    useEffect(() => {
        if (selectedProduct || variants.length > 0) {
            validateForm();
        }
    }, [selectedProduct, variants, isVariantMode]);

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
                setSelectedProductVariantId(editingItem.product_variant_id || null);

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
        setSelectedProductVariantId(null);
    };

    const createEmptyVariant = () => ({
        id: `variant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        quantity: '1',
        unit_price: '',
        production_time_days: '',
        logo_printing: '',
    });

    // Función mejorada para manejar selección de producto
    const handleProductSelect = (productId) => {
        const product = products.find((p) => p.id == productId);
        if (!product) return;

        setSelectedProduct(product);
        setSelectedProductVariantId(null);

        // Crear nueva variante con precio del producto
        const newVariant = {
            ...createEmptyVariant(),
            unit_price: product.last_price ? product.last_price.toString() : '',
        };

        setVariants([newVariant]);
        setIsVariantMode(false);

        // Limpiar errores previos al cambiar producto
        setErrors([]);
        setWarnings([]);

        // La validación se ejecutará automáticamente por el useEffect
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

    // Función mejorada para toggle del modo variante
    const handleVariantModeToggle = (checked) => {
        setIsVariantMode(checked);

        if (checked) {
            // Al activar modo variante, asegurar al menos 2 variantes
            if (variants.length < 2) {
                const newVariants = [
                    { ...variants[0] },
                    {
                        ...createEmptyVariant(),
                        unit_price: selectedProduct?.last_price?.toString() || '',
                    },
                ];
                setVariants(newVariants);
            }
        } else {
            // Al desactivar, mantener solo la primera
            setVariants([{ ...variants[0] }]);
        }

        // La validación se ejecutará automáticamente por el useEffect
    };

    // Función mejorada para agregar variante
    const addVariant = () => {
        const newVariant = {
            ...createEmptyVariant(),
            unit_price: selectedProduct?.last_price?.toString() || '',
        };
        setVariants([...variants, newVariant]);

        // La validación se ejecutará automáticamente por el useEffect
    };

    // Función mejorada para remover variante
    const removeVariant = (variantId) => {
        if (variants.length <= 1) return;

        const newVariants = variants.filter((v) => v.id !== variantId);
        setVariants(newVariants);

        // La validación se ejecutará automáticamente por el useEffect
    };

    // Función helper para verificar si hay errores en una variante específica
    const hasVariantError = (index, field) => {
        return errors.some((e) => e.field === `variant_${index}_${field}`);
    };

    // Función helper para obtener mensaje de error de una variante específica
    const getVariantError = (index, field) => {
        const error = errors.find((e) => e.field === `variant_${index}_${field}`);
        return error ? error.message : null;
    };

    // Función mejorada para actualizar variantes con validación inmediata
    const updateVariant = (variantId, field, value) => {
        setVariants((prev) => prev.map((variant) => (variant.id === variantId ? { ...variant, [field]: value } : variant)));

        // La validación se ejecutará automáticamente por el useEffect
    };

    // Función de validación
    const validateForm = () => {
        const newErrors = [];
        const newWarnings = [];

        // 1. Validar producto seleccionado
        if (!selectedProduct) {
            newErrors.push({ field: 'product', message: 'Debe seleccionar un producto' });
            setErrors(newErrors);
            setWarnings(newWarnings);
            return false;
        }

        // 1a. Validar selección de variante si el producto tiene variantes
        if (selectedProduct.variants && selectedProduct.variants.length > 0 && !selectedProductVariantId) {
            newErrors.push({
                field: 'product_variant',
                message: 'Debe seleccionar una variante del producto',
            });
        }

        // 2. Verificar duplicados en el presupuesto (solo si no estamos editando)
        if (!editingItem && checkForDuplicates) {
            const tempItem = {
                product_id: selectedProduct.id,
                product: selectedProduct,
            };

            const duplicateCheck = checkForDuplicates([tempItem], editingItem);
            if (duplicateCheck.length > 0) {
                newWarnings.push({
                    type: 'duplicate',
                    message: 'Este producto ya existe en el presupuesto. Al confirmar, se reemplazará la línea existente.',
                });
            }
        }

        // 3. Validar cada variante/línea
        variants.forEach((variant, index) => {
            const quantity = variant.quantity?.toString().trim();
            const unitPrice = variant.unit_price?.toString().trim();

            // 3a. Validar cantidad
            if (!quantity || quantity === '') {
                newErrors.push({
                    field: `variant_${index}_quantity`,
                    message: isVariantMode ? `Cantidad en variante ${index + 1} es obligatoria` : 'La cantidad es obligatoria',
                });
            } else {
                const parsedQuantity = parseInt(quantity);
                if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
                    newErrors.push({
                        field: `variant_${index}_quantity`,
                        message: isVariantMode ? `Cantidad en variante ${index + 1} debe ser mayor a 0` : 'La cantidad debe ser mayor a 0',
                    });
                }
            }

            // 3b. Validar precio unitario
            if (!unitPrice || unitPrice === '') {
                newErrors.push({
                    field: `variant_${index}_price`,
                    message: isVariantMode ? `Precio en variante ${index + 1} es obligatorio` : 'El precio unitario es obligatorio',
                });
            } else {
                const parsedPrice = parseFloat(unitPrice);
                if (isNaN(parsedPrice) || parsedPrice <= 0) {
                    newErrors.push({
                        field: `variant_${index}_price`,
                        message: isVariantMode ? `Precio en variante ${index + 1} debe ser mayor a 0` : 'El precio unitario debe ser mayor a 0',
                    });
                }
            }
        });

        // 4. Validaciones específicas para modo variante
        if (isVariantMode) {
            // 4a. Verificar mínimo 2 variantes
            if (variants.length < 2) {
                newErrors.push({
                    field: 'variants',
                    message: 'Los productos con variantes deben tener al menos 2 opciones',
                });
            }

            // 4b. Verificar que no haya variantes idénticas (solo si no hay errores de validación básica)
            if (variants.length >= 2 && !newErrors.some((e) => e.field.includes('quantity') || e.field.includes('price'))) {
                const duplicateVariants = [];
                const processedPairs = new Set();

                variants.forEach((variant, i) => {
                    variants.forEach((otherVariant, j) => {
                        if (i !== j) {
                            const pairKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
                            if (processedPairs.has(pairKey)) return;

                            const quantity1 = parseInt(variant.quantity?.toString().trim() || '0');
                            const price1 = parseFloat(variant.unit_price?.toString().trim() || '0');
                            const quantity2 = parseInt(otherVariant.quantity?.toString().trim() || '0');
                            const price2 = parseFloat(otherVariant.unit_price?.toString().trim() || '0');

                            if (!isNaN(quantity1) && !isNaN(price1) && !isNaN(quantity2) && !isNaN(price2)) {
                                if (quantity1 === quantity2 && price1 === price2) {
                                    duplicateVariants.push(`Variantes ${i + 1} y ${j + 1} son idénticas`);
                                    processedPairs.add(pairKey);
                                }
                            }
                        }
                    });
                });

                if (duplicateVariants.length > 0) {
                    newErrors.push({
                        field: 'variants',
                        message: duplicateVariants[0],
                    });
                }
            }
        }

        // 5. Actualizar estados
        setErrors(newErrors);
        setWarnings(newWarnings);

        // 6. Retornar resultado
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

        console.log('Modal: Generando items con variant_group:', variantGroup);

        const itemsToReturn = variants.map((variant, index) => {
            const quantity = parseInt(variant.quantity);
            const unitPrice = parseFloat(variant.unit_price);

            // FIX: Generar IDs únicos para evitar duplicación
            let itemId;

            if (editingItem?.isVariantGroup) {
                // Si estamos editando un grupo de variantes, usar los IDs existentes
                itemId = editingItem.items[index]?.id || `new_${Date.now()}_${index}`;
            } else if (editingItem && !editingItem.isVariantGroup && isVariantMode) {
                // FIX: Si estamos convirtiendo un item regular a variantes, generar nuevos IDs únicos para TODAS las variantes
                itemId = `converted_${Date.now()}_${index}`;
            } else if (editingItem && !editingItem.isVariantGroup && !isVariantMode) {
                // Si estamos editando un item regular y manteniéndolo como regular, usar el ID existente
                itemId = editingItem.id;
            } else {
                // Para nuevos items
                itemId = `new_${Date.now()}_${index}`;
            }

            const item = {
                id: itemId,
                product_id: selectedProduct.id,
                product_variant_id: selectedProductVariantId,
                product: selectedProduct,
                quantity,
                unit_price: unitPrice,
                production_time_days: variant.production_time_days ? parseInt(variant.production_time_days) : null,
                logo_printing: variant.logo_printing || null,
                line_total: quantity * unitPrice,
                variant_group: variantGroup,
                is_variant: isVariantMode,
                // FIX: Solo la primera variante debe estar seleccionada inicialmente
                is_selected: isVariantMode ? index === 0 : true,
            };

            console.log(`Modal enviando item ${item.id}: variant_group=${item.variant_group}, is_selected=${item.is_selected}, index=${index}`);
            return item;
        });

        console.log(
            'Modal: Items finales a enviar:',
            itemsToReturn.map((item) => ({
                id: item.id,
                variant_group: item.variant_group,
                is_selected: item.is_selected,
            })),
        );

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
                        <Select className="py-5" value={selectedProduct?.id?.toString() || ''} onValueChange={handleProductSelect}>
                            <SelectTrigger className="mt-2 min-h-[50px]">
                                <SelectValue placeholder="Seleccionar producto..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map((product) => (
                                    <SelectItem className="py-2" key={product.id} value={product.id.toString()}>
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

                    {/* ⬅️ NUEVO: Selector de variantes del producto */}
                    {selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0 && (
                        <ProductVariantSelector
                            product={selectedProduct}
                            selectedVariantId={selectedProductVariantId}
                            onVariantSelect={setSelectedProductVariantId}
                        />
                    )}

                    {/* ⬅️ NUEVO: Mostrar error si no se seleccionó variante */}
                    {errors.some((e) => e.field === 'product_variant') && (
                        <Alert className="border-red-200 bg-red-50">
                            <X className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">{errors.find((e) => e.field === 'product_variant').message}</AlertDescription>
                        </Alert>
                    )}

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
                                    <VariantForm
                                        key={variant.id}
                                        variant={variant}
                                        index={index}
                                        isVariantMode={isVariantMode}
                                        canRemove={variants.length > 1}
                                        onUpdate={updateVariant}
                                        onRemove={removeVariant}
                                        errors={errors}
                                        formatCurrency={formatCurrency}
                                        calculateLineTotal={calculateLineTotal}
                                        hasVariantError={hasVariantError} // Nueva prop
                                        getVariantError={getVariantError} // Nueva prop
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
