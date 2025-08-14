import PageHeader from '@/components/PageHeader';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { AlertTriangle, CalendarDays, DollarSign, Package, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [
    {
        title: 'Presupuestos',
        href: '/dashboard/budgets',
    },
    {
        title: 'Crear Presupuesto',
        href: '#',
    },
];

export default function Create({ clients, products, user, budget = null }) {
    const isEditing = !!budget;

    const { data, setData, post, put, processing, errors } = useForm({
        title: budget?.title || '',
        client_id: budget?.client_id?.toString() || '',
        issue_date: budget?.issue_date || new Date().toISOString().split('T')[0],
        expiry_date: budget?.expiry_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        send_email_to_client: budget?.send_email_to_client || false,
        footer_comments: budget?.footer_comments || '',
        items: budget?.items || [],
    });

    const [totals, setTotals] = useState({
        subtotal: 0,
        iva: 0,
        total: 0,
    });

    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedClientName, setSelectedClientName] = useState('');
    const [selectedProductName, setSelectedProductName] = useState('');
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [inputValues, setInputValues] = useState({});
    const [selectedVariants, setSelectedVariants] = useState({});

    const handlePriceInputChange = (variantId, value) => {
        // Actualizar el valor visual del input
        setInputValues((prev) => ({
            ...prev,
            [`price_${variantId}`]: value,
        }));

        // Parsear y actualizar el valor numérico
        const numericValue = parseCurrencyInput(value);
        updateVariant(variantId, 'unit_price', numericValue);
    };

    const handlePriceInputFocus = (variantId, currentPrice) => {
        // Mostrar valor numérico al hacer foco
        setInputValues((prev) => ({
            ...prev,
            [`price_${variantId}`]: currentPrice.toString(),
        }));
    };

    const handlePriceInputBlur = (variantId, currentPrice) => {
        // Volver al formato de moneda al perder foco
        setInputValues((prev) => ({
            ...prev,
            [`price_${variantId}`]: formatCurrencyInput(currentPrice),
        }));
    };

    const getPriceInputValue = (variantId, currentPrice) => {
        return inputValues[`price_${variantId}`] !== undefined ? inputValues[`price_${variantId}`] : formatCurrencyInput(currentPrice);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    // Estado para variantes en el modal
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

    // Configurar nombres iniciales y variantes seleccionadas
    useEffect(() => {
        if (isEditing && budget) {
            const client = clients.find((c) => c.id == budget.client_id);
            if (client) setSelectedClientName(client.name);
        }

        // Configurar variantes seleccionadas (primera de cada grupo)
        const initialVariants = {};
        const variantGroups = {};

        data.items.forEach((item) => {
            if (item.variant_group) {
                if (!variantGroups[item.variant_group]) {
                    variantGroups[item.variant_group] = [];
                }
                variantGroups[item.variant_group].push(item);
            }
        });

        Object.keys(variantGroups).forEach((group) => {
            if (!selectedVariants[group]) {
                initialVariants[group] = variantGroups[group][0]?.id;
            }
        });

        if (Object.keys(initialVariants).length > 0) {
            setSelectedVariants((prev) => {
                const newState = {
                    ...prev,
                    ...initialVariants,
                };
                setTimeout(() => calculateTotals(newState), 0);
                return newState;
            });
        } else {
            setTimeout(() => calculateTotals(), 0);
        }
    }, [data.items]);

    // Recalcular totales cuando cambian los items
    useEffect(() => {
        let subtotal = 0;

        data.items.forEach((item) => {
            if (item.variant_group) {
                // Para variantes, solo contar la primera del grupo (las demás son opciones)
                const isFirstInGroup = data.items.findIndex((i) => i.variant_group === item.variant_group) === data.items.indexOf(item);

                if (isFirstInGroup) {
                    subtotal += item.quantity * item.unit_price;
                }
            } else {
                subtotal += item.quantity * item.unit_price;
            }
        });

        const iva = subtotal * 0.21;
        const total = subtotal + iva;

        setTotals({ subtotal, iva, total });
    }, [data.items]);

    // Obtener fecha mínima para emisión (hoy)
    const getMinIssueDate = () => {
        return new Date().toISOString().split('T')[0];
    };

    // Obtener fecha mínima para vencimiento (mañana)
    const getMinExpiryDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const formatCurrencyInput = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(value || 0);
    };

    const parseCurrencyInput = (value) => {
        // Remover símbolos de moneda y espacios, mantener solo números y punto/coma decimal
        const cleaned = value.replace(/[^\d.,]/g, '');
        // Reemplazar coma por punto para parseFloat
        const normalized = cleaned.replace(',', '.');
        return parseFloat(normalized) || 0;
    };

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

    const handleClientSelect = (clientId) => {
        const client = clients.find((c) => c.id == clientId);
        setData('client_id', clientId);
        setSelectedClientName(client ? client.name : '');
    };

    const handleProductSelect = (productId) => {
        const product = products.find((p) => p.id == productId);
        if (product) {
            setSelectedProduct(product);
            setSelectedProductName(product.name);

            // Resetear variantes con el precio del producto
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

    const handleVariantModeChange = (checked) => {
        setIsVariantMode(checked);

        if (!checked) {
            // Si se deshabilita el modo variante, mantener solo la primera variante
            setVariants([variants[0]]);
        }
    };

    const handleVariantChange = (group, itemId) => {
        const newSelectedVariants = {
            ...selectedVariants,
            [group]: itemId,
        };

        setSelectedVariants(newSelectedVariants);
        setTimeout(() => calculateTotals(newSelectedVariants), 0);
    };

    const calculateTotals = (currentSelectedVariants = selectedVariants) => {
        let subtotal = 0;

        data.items.forEach((item) => {
            if (item.variant_group) {
                const selectedItemId = currentSelectedVariants[item.variant_group];
                const itemIdStr = String(item.id);
                const selectedIdStr = String(selectedItemId);

                if (itemIdStr === selectedIdStr) {
                    const itemTotal = item.quantity * item.unit_price;
                    subtotal += itemTotal;
                }
            } else {
                const itemTotal = item.quantity * item.unit_price;
                subtotal += itemTotal;
            }
        });

        const iva = subtotal * 0.21;
        const total = subtotal + iva;

        setTotals({ subtotal, iva, total });
    };

    const handleAddItem = () => {
        if (!selectedProduct) return;

        if (isVariantMode && variants.length > 0) {
            // Agregar grupo de variantes
            const variantGroup = generateVariantGroup(selectedProduct.name);

            const newItems = variants.map((variant, index) => ({
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

            setData('items', [...data.items, ...newItems]);

            const newSelectedVariants = { ...selectedVariants };
            newSelectedVariants[variantGroup] = newItems[0].id;
            setSelectedVariants(newSelectedVariants);

            setTimeout(() => calculateTotals(newSelectedVariants), 0);
        } else {
            // Agregar item individual
            const newItem = {
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
            };

            setData('items', [...data.items, newItem]);

            setTimeout(() => calculateTotals(), 0);
        }

        // Reset modal
        resetModal();
    };

    const resetModal = () => {
        setSelectedProduct(null);
        setSelectedProductName('');
        setVariants([
            {
                id: Date.now(),
                quantity: 1,
                unit_price: 0,
                production_time_days: '',
                logo_printing: '',
            },
        ]);
        setIsVariantMode(false);
        setShowProductModal(false);
    };

    const handleRemoveItem = (index) => {
        const item = data.items[index];
        let newItems = [...data.items];

        if (item.variant_group) {
            newItems = newItems.filter((i) => i.variant_group !== item.variant_group);
            setSelectedVariants((prev) => {
                const newState = { ...prev };
                delete newState[item.variant_group];
                setTimeout(() => calculateTotals(newState), 0);
                return newState;
            });
        } else {
            newItems.splice(index, 1);
            setTimeout(() => calculateTotals(), 0);
        }

        setData('items', newItems);
    };

    const handleExit = () => {
        if (data.items.length > 0) {
            setShowExitDialog(true);
            setPendingNavigation(() => () => router.visit(route('dashboard.budgets.index')));
        } else {
            router.visit(route('dashboard.budgets.index'));
        }
    };

    const confirmExit = () => {
        setShowExitDialog(false);
        if (pendingNavigation) {
            pendingNavigation();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('dashboard.budgets.update', budget.id));
        } else {
            post(route('dashboard.budgets.store'));
        }
    };

    // Organizar items para visualización
    const organizeItems = () => {
        const organized = {
            regular: [],
            variantGroups: {},
        };

        data.items.forEach((item) => {
            if (item.variant_group) {
                if (!organized.variantGroups[item.variant_group]) {
                    organized.variantGroups[item.variant_group] = [];
                }
                organized.variantGroups[item.variant_group].push(item);
            } else {
                organized.regular.push(item);
            }
        });

        return organized;
    };

    const organizedItems = organizeItems();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isEditing ? `Editar Presupuesto - ${budget.title}` : 'Crear Presupuesto'} />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" onBack={handleExit} />

                        <form onSubmit={handleSubmit} className="space-y-6 p-6">
                            {/* Información básica del presupuesto */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Información General</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="title">Título del Presupuesto *</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="ej: Presupuesto: Cotización cuadernos, bolígrafos..."
                                                className={errors.title ? 'border-red-500' : ''}
                                            />
                                            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="client_id">Cliente *</Label>
                                            <Select value={data.client_id} onValueChange={handleClientSelect}>
                                                <SelectTrigger className={errors.client_id ? 'border-red-500' : ''}>
                                                    <SelectValue>{selectedClientName || 'Seleccionar cliente'}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {clients.map((client) => (
                                                        <SelectItem key={client.id} value={client.id.toString()}>
                                                            <div>
                                                                <p className="font-medium">{client.name}</p>
                                                                <p className="text-muted-foreground text-sm">{client.email}</p>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.client_id && <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>}
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="send_email"
                                                checked={data.send_email_to_client}
                                                onCheckedChange={(checked) => setData('send_email_to_client', checked)}
                                            />
                                            <Label htmlFor="send_email" className="text-sm">
                                                Enviar automáticamente por email al cliente
                                            </Label>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5" />
                                            Fechas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label htmlFor="issue_date">Fecha de Emisión *</Label>
                                            <Input
                                                id="issue_date"
                                                type="date"
                                                min={getMinIssueDate()}
                                                value={data.issue_date}
                                                onChange={(e) => setData('issue_date', e.target.value)}
                                                className={errors.issue_date ? 'border-red-500' : ''}
                                            />
                                            {errors.issue_date && <p className="mt-1 text-sm text-red-600">{errors.issue_date}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="expiry_date">Fecha de Vencimiento *</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                min={getMinExpiryDate()}
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                                className={errors.expiry_date ? 'border-red-500' : ''}
                                            />
                                            {errors.expiry_date && <p className="mt-1 text-sm text-red-600">{errors.expiry_date}</p>}
                                        </div>

                                        <div>
                                            <Label>Vendedor</Label>
                                            <p className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium">{user.name}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Items del presupuesto */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Package className="h-5 w-5" />
                                        Items del Presupuesto
                                    </CardTitle>
                                    <Button type="button" onClick={() => setShowProductModal(true)} className="flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Agregar Producto
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    {data.items.length === 0 ? (
                                        <p className="text-muted-foreground py-8 text-center">
                                            No hay productos agregados. Haz clic en "Agregar Producto" para comenzar.
                                        </p>
                                    ) : (
                                        <div className="space-y-6">
                                            {/* Items regulares */}
                                            {organizedItems.regular.map((item, index) => (
                                                <div key={item.id} className="rounded-lg border p-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            {item.product.images && item.product.images.length > 0 ? (
                                                                <img
                                                                    src={item.product.images[0].url}
                                                                    alt={item.product.name}
                                                                    className="h-16 w-16 rounded-lg border object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-gray-100">
                                                                    <Package className="h-8 w-8 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 space-y-3">
                                                            <div className="flex items-start justify-between">
                                                                <h4 className="font-semibold">{item.product.name}</h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleRemoveItem(data.items.indexOf(item))}
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                                                <div>
                                                                    <span className="text-muted-foreground">Cantidad:</span>
                                                                    <p className="font-medium">{item.quantity}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="text-muted-foreground">Precio unit.:</span>
                                                                    <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                                                                </div>
                                                                {item.production_time_days && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Producción:</span>
                                                                        <p className="font-medium">{item.production_time_days} días</p>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <span className="text-muted-foreground">Total:</span>
                                                                    <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                                                </div>
                                                            </div>

                                                            {item.logo_printing && (
                                                                <div>
                                                                    <span className="text-muted-foreground text-sm">Logo:</span>
                                                                    <p className="text-sm">{item.logo_printing}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Grupos de variantes */}
                                            {Object.entries(organizedItems.variantGroups).map(([group, items]) => (
                                                <div key={group} className="rounded-lg border bg-blue-50 p-4">
                                                    <div className="mb-4 flex items-start gap-4">
                                                        <div className="flex-shrink-0">
                                                            {items[0].product.images && items[0].product.images.length > 0 ? (
                                                                <img
                                                                    src={items[0].product.images[0].url}
                                                                    alt={items[0].product.name}
                                                                    className="h-16 w-16 rounded-lg border object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-gray-100">
                                                                    <Package className="h-8 w-8 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-1 items-start justify-between">
                                                            <div>
                                                                <h4 className="font-semibold">{items[0].product.name} - Opciones de cantidad</h4>
                                                                <p className="text-sm text-blue-600">Grupo de variantes ({items.length} opciones)</p>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveItem(data.items.indexOf(items[0]))}
                                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="ml-20 space-y-2">
                                                        {items.map((item) => (
                                                            <label
                                                                key={item.id}
                                                                className="flex cursor-pointer items-center space-x-3 rounded border-2 p-3 transition-colors hover:bg-gray-50"
                                                                style={{
                                                                    borderColor:
                                                                        String(selectedVariants[group]) === String(item.id) ? '#3b82f6' : '#e5e7eb',
                                                                }}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`variant_${group}`}
                                                                    value={item.id}
                                                                    checked={String(selectedVariants[group]) === String(item.id)}
                                                                    onChange={() => handleVariantChange(group, item.id)}
                                                                    className="text-blue-600"
                                                                />
                                                                <div className="flex-1">
                                                                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                                                                        <div>
                                                                            <span className="text-muted-foreground">Cantidad:</span>
                                                                            <p className="font-medium">{item.quantity}</p>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground">Precio unit.:</span>
                                                                            <p className="font-medium">{formatCurrency(item.unit_price)}</p>
                                                                        </div>
                                                                        {item.production_time_days && (
                                                                            <div>
                                                                                <span className="text-muted-foreground">Producción:</span>
                                                                                <p className="font-medium">{item.production_time_days} días</p>
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <span className="text-muted-foreground">Total:</span>
                                                                            <p className="font-bold">{formatCurrency(item.line_total)}</p>
                                                                        </div>
                                                                    </div>
                                                                    {item.logo_printing && (
                                                                        <div className="mt-2">
                                                                            <span className="text-muted-foreground text-sm">Logo:</span>
                                                                            <p className="text-sm">{item.logo_printing}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Modal para agregar producto */}
                            {showProductModal && (
                                <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
                                    <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle>Agregar Producto</CardTitle>
                                            <Button type="button" variant="ghost" size="sm" onClick={resetModal}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div>
                                                <Label>Producto *</Label>
                                                <Select value={selectedProduct?.id?.toString() || ''} onValueChange={handleProductSelect}>
                                                    <SelectTrigger>
                                                        <SelectValue>{selectedProductName || 'Seleccionar producto'}</SelectValue>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {products.map((product) => (
                                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                                <div className="flex items-center gap-2">
                                                                    {product.images && product.images.length > 0 ? (
                                                                        <img
                                                                            src={product.images[0].url}
                                                                            alt={product.name}
                                                                            className="h-8 w-8 rounded object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                                                                            <Package className="h-4 w-4 text-gray-400" />
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <p className="font-medium">{product.name}</p>
                                                                        {product.last_price && (
                                                                            <p className="text-muted-foreground text-sm">
                                                                                {formatCurrency(product.last_price)}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-4">
                                                {variants.map((variant, index) => (
                                                    <div key={variant.id} className={`rounded-lg border p-4 ${isVariantMode ? 'bg-white' : ''}`}>
                                                        {isVariantMode && (
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <h5 className="text-sm font-medium">Variante {index + 1}</h5>
                                                                {variants.length > 1 && (
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => removeVariant(variant.id)}
                                                                        className="text-red-600 hover:text-red-700"
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>Cantidad *</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={variant.quantity}
                                                                    onChange={(e) =>
                                                                        updateVariant(variant.id, 'quantity', parseInt(e.target.value) || 1)
                                                                    }
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Precio Unitario *</Label>
                                                                <Input
                                                                    type="text"
                                                                    value={getPriceInputValue(variant.id, variant.unit_price)}
                                                                    onChange={(e) => handlePriceInputChange(variant.id, e.target.value)}
                                                                    onFocus={() => handlePriceInputFocus(variant.id, variant.unit_price)}
                                                                    onBlur={() => handlePriceInputBlur(variant.id, variant.unit_price)}
                                                                    placeholder="$0,00"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                                            <div>
                                                                <Label>Tiempo de Producción (días)</Label>
                                                                <Input
                                                                    type="number"
                                                                    value={variant.production_time_days}
                                                                    onChange={(e) =>
                                                                        updateVariant(variant.id, 'production_time_days', e.target.value)
                                                                    }
                                                                />
                                                            </div>
                                                            <div>
                                                                <Label>Total</Label>
                                                                <div className="rounded-md bg-gray-50 px-3 py-2 font-medium">
                                                                    {formatCurrency(variant.quantity * variant.unit_price)}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <Label>Impresión de Logo</Label>
                                                            <Input
                                                                value={variant.logo_printing}
                                                                onChange={(e) => updateVariant(variant.id, 'logo_printing', e.target.value)}
                                                                placeholder="Descripción de la impresión"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <Checkbox id="is_variant" checked={isVariantMode} onCheckedChange={handleVariantModeChange} />
                                                <Label htmlFor="is_variant" className="text-sm">
                                                    Es un producto con variantes
                                                </Label>
                                            </div>

                                            {isVariantMode && (
                                                <div className="rounded-lg bg-blue-50 p-4">
                                                    <div className="mb-3 flex items-center justify-between">
                                                        <h4 className="font-medium">Variantes del producto</h4>
                                                        <Button type="button" size="sm" onClick={addVariant} className="flex items-center gap-1">
                                                            <Plus className="h-3 w-3" />
                                                            Agregar variante
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-end gap-2 pt-4">
                                                <Button type="button" variant="outline" onClick={resetModal}>
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={handleAddItem}
                                                    disabled={!selectedProduct || variants.some((v) => !v.quantity || !v.unit_price)}
                                                >
                                                    {isVariantMode ? 'Agregar Variantes' : 'Agregar Item'}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                            {/* Totales y comentarios */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <DollarSign className="h-5 w-5" />
                                            Totales
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Subtotal:</span>
                                            <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>IVA (21%):</span>
                                            <span className="font-semibold">{formatCurrency(totals.iva)}</span>
                                        </div>
                                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                            <span>Total:</span>
                                            <span>{formatCurrency(totals.total)}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Comentarios</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Textarea
                                            placeholder="Comentarios adicionales para el pie del presupuesto..."
                                            value={data.footer_comments}
                                            onChange={(e) => setData('footer_comments', e.target.value)}
                                            rows={4}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex justify-end gap-3 border-t pt-6">
                                <Button type="button" variant="outline" onClick={handleExit}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={processing || data.items.length === 0} className="flex items-center gap-2">
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Guardando...' : isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* AlertDialog para confirmar salida */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ¿Descartar cambios?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tienes productos agregados al presupuesto. Si sales ahora, perderás todos los cambios no guardados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit} className="bg-red-600 hover:bg-red-700">
                            Descartar y salir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
