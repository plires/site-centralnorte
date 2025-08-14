import { useEffect, useState } from 'react';

export function useProductModal(products, existingItems = [], checkForDuplicates = null) {
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

        const duplicates = checkForDuplicates(newItems);
        setValidationErrors(duplicates);
        return duplicates.length === 0;
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
        if (!selectedProduct || !validateVariants()) return [];

        if (isVariantMode && variants.length > 0) {
            const variantGroup = generateVariantGroup(selectedProduct.name);

            return variants.map((variant, index) => ({
                id: `${Date.now()}_${index}`,
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
                    id: Date.now(),
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

    const isValid = selectedProduct && variants.every((v) => v.quantity > 0 && v.unit_price >= 0) && validationErrors.length === 0;

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
