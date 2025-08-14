import { useEffect, useState } from 'react';

export function useProductModal(products, existingItems = [], checkForDuplicates = null, editingItem = null) {
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductName, setSelectedProductName] = useState('');
    const [variants, setVariants] = useState([
        {
            id: Date.now(),
            quantity: 1,
            unit_price: 0,
            production_time_days: '',
            logo_printing: '',
        },
    ]);
    const [isVariantMode, setIsVariantMode] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    // Inicializar datos cuando se está editando
    useEffect(() => {
        if (editingItem) {
            if (editingItem.isVariantGroup) {
                // Editar grupo de variantes
                const firstItem = editingItem.items[0];
                const product = products.find((p) => p.id == firstItem.product_id);

                if (product) {
                    setSelectedProduct(product);
                    setSelectedProductName(product.name);
                    setIsVariantMode(true);

                    const editVariants = editingItem.items.map((item) => ({
                        id: item.id,
                        quantity: item.quantity,
                        unit_price: item.unit_price,
                        production_time_days: item.production_time_days || '',
                        logo_printing: item.logo_printing || '',
                    }));

                    setVariants(editVariants);
                }
            } else {
                // Editar item individual
                const product = products.find((p) => p.id == editingItem.product_id);

                if (product) {
                    setSelectedProduct(product);
                    setSelectedProductName(product.name);
                    setIsVariantMode(false);

                    setVariants([
                        {
                            id: editingItem.id,
                            quantity: editingItem.quantity,
                            unit_price: editingItem.unit_price,
                            production_time_days: editingItem.production_time_days || '',
                            logo_printing: editingItem.logo_printing || '',
                        },
                    ]);
                }
            }
        } else {
            // Resetear para nuevo item
            setSelectedProduct(null);
            setSelectedProductName('');
            setIsVariantMode(false);
            setVariants([
                {
                    id: Date.now(),
                    quantity: 1,
                    unit_price: 0,
                    production_time_days: '',
                    logo_printing: '',
                },
            ]);
        }
    }, [editingItem, products]);

    const generateVariantGroup = (productName) => {
        const timestamp = Date.now();
        const productSlug = productName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '_')
            .substring(0, 10);
        return `${productSlug}_${timestamp}`;
    };

    const validateVariants = () => {
        if (!checkForDuplicates || !selectedProduct) {
            setValidationErrors([]);
            return true;
        }

        const newItems =
            isVariantMode && variants.length > 0
                ? variants.map((variant, index) => ({
                      id: `temp_${index}`,
                      product_id: selectedProduct.id,
                      product: selectedProduct,
                      quantity: variant.quantity,
                      unit_price: variant.unit_price,
                      production_time_days: variant.production_time_days || null,
                      logo_printing: variant.logo_printing || null,
                      line_total: variant.quantity * variant.unit_price,
                      variant_group: 'temp_group',
                      is_variant: true,
                  }))
                : [
                      {
                          id: 'temp_single',
                          product_id: selectedProduct.id,
                          product: selectedProduct,
                          quantity: variants[0].quantity,
                          unit_price: variants[0].unit_price,
                          production_time_days: variants[0].production_time_days || null,
                          logo_printing: variants[0].logo_printing || null,
                          line_total: variants[0].quantity * variants[0].unit_price,
                          variant_group: null,
                          is_variant: false,
                      },
                  ];

        const duplicates = checkForDuplicates(newItems, editingItem);

        // Filtrar solo duplicados reales (no incluir avisos informativos cuando es el mismo producto en edición)
        const realDuplicates = duplicates.filter((duplicate) => {
            // Si estamos editando y es el mismo producto, no mostrar aviso
            if (editingItem && !editingItem.isVariantGroup && selectedProduct.id === editingItem.product_id) {
                return false;
            }

            // Si estamos editando grupo de variantes y es el mismo producto, no mostrar aviso
            if (
                editingItem &&
                editingItem.isVariantGroup &&
                editingItem.items &&
                editingItem.items[0] &&
                selectedProduct.id === editingItem.items[0].product_id
            ) {
                return false;
            }

            return true;
        });

        setValidationErrors(realDuplicates);
        return true; // Siempre devolver true porque ahora son solo avisos informativos
    };

    // Validar cada vez que cambien las variantes
    useEffect(() => {
        validateVariants();
    }, [variants, isVariantMode, selectedProduct]);

    const handleProductSelect = (productId) => {
        const product = products.find((p) => p.id == productId);
        if (product) {
            setSelectedProduct(product);
            setSelectedProductName(product.name);

            // Si se está editando y se cambia a un producto diferente,
            // destildar automáticamente el modo variante
            if (
                editingItem &&
                ((editingItem.isVariantGroup && editingItem.items[0]?.product_id != productId) ||
                    (!editingItem.isVariantGroup && editingItem.product_id != productId))
            ) {
                setIsVariantMode(false);
            }

            const newVariant = {
                id: Date.now(),
                quantity: 1,
                unit_price: parseFloat(product.last_price || 0),
                production_time_days: '',
                logo_printing: '',
            };
            setVariants([newVariant]);
        }
    };

    const handleVariantModeChange = (checked) => {
        setIsVariantMode(checked);

        if (!checked) {
            setVariants([variants[0]]);
        }
    };

    const addVariant = () => {
        const newVariant = {
            id: Date.now(),
            quantity: 1,
            unit_price: selectedProduct ? parseFloat(selectedProduct.last_price || 0) : 0,
            production_time_days: '',
            logo_printing: '',
        };
        setVariants([...variants, newVariant]);
    };

    const removeVariant = (variantId) => {
        if (variants.length > 1) {
            setVariants(variants.filter((v) => v.id !== variantId));
        }
    };

    const updateVariant = (variantId, field, value) => {
        setVariants(variants.map((v) => (v.id === variantId ? { ...v, [field]: value } : v)));
    };

    const handleSubmit = () => {
        if (!selectedProduct) return [];

        // Validar antes de proceder (aunque ya no bloquea, es buena práctica)
        validateVariants();

        if (isVariantMode && variants.length > 0) {
            const variantGroup = editingItem?.isVariantGroup ? editingItem.group : generateVariantGroup(selectedProduct.name);

            return variants.map((variant, index) => ({
                id: editingItem?.isVariantGroup ? variant.id : `${Date.now()}_${index}`,
                product_id: selectedProduct.id,
                product: selectedProduct,
                quantity: variant.quantity,
                unit_price: variant.unit_price,
                production_time_days: variant.production_time_days || null,
                logo_printing: variant.logo_printing || null,
                line_total: variant.quantity * variant.unit_price,
                variant_group: variantGroup,
                is_variant: true,
            }));
        } else {
            return [
                {
                    id: editingItem && !editingItem.isVariantGroup ? editingItem.id : Date.now(),
                    product_id: selectedProduct.id,
                    product: selectedProduct,
                    quantity: variants[0].quantity,
                    unit_price: variants[0].unit_price,
                    production_time_days: variants[0].production_time_days || null,
                    logo_printing: variants[0].logo_printing || null,
                    line_total: variants[0].quantity * variants[0].unit_price,
                    variant_group: null,
                    is_variant: false,
                },
            ];
        }
    };

    const isValid = selectedProduct && variants.every((v) => v.quantity > 0 && v.unit_price >= 0) && (!isVariantMode || variants.length >= 2); // Mínimo 2 variantes si está en modo variante

    return {
        selectedProduct,
        selectedProductName,
        variants,
        isVariantMode,
        validationErrors,
        handleProductSelect,
        handleVariantModeChange,
        addVariant,
        removeVariant,
        updateVariant,
        handleSubmit,
        isValid,
    };
}
