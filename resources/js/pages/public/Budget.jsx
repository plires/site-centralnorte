import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Clock, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import BudgetNotFound from './BudgetNotFound';

export default function Budget({ budget, businessConfig }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        iva: 0,
        total: parseFloat(budget.total),
    });
    const [imageGalleries, setImageGalleries] = useState({});
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});

    // Verificación adicional de seguridad en el frontend
    if (!budget.is_active) {
        return (
            <BudgetNotFound message="Este presupuesto ha sido desactivado temporalmente y no está disponible para visualización." reason="inactive" />
        );
    }

    // Función para generar URL del PDF con variantes seleccionadas
    const generatePdfUrl = () => {
        const baseUrl = `/presupuesto/${budget.token}/pdf`;

        // Si hay variantes seleccionadas, agregar como parámetros de consulta
        if (Object.keys(selectedVariants).length > 0) {
            const params = new URLSearchParams();

            // Formato: grupo:itemId
            Object.entries(selectedVariants).forEach(([group, itemId]) => {
                params.append('variants[]', `${group}:${itemId}`);
            });

            return `${baseUrl}?${params.toString()}`;
        }

        return baseUrl;
    };

    // Obtener configuración de IVA
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    // Organizar imágenes de productos
    const organizeImages = (images) => {
        if (!images || images.length === 0) return [];

        // Separar imagen destacada y otras imágenes
        const featured = images.find((img) => img.is_featured);
        const others = images.filter((img) => !img.is_featured);

        // Retornar con imagen destacada primero (si existe)
        return featured ? [featured, ...others] : others;
    };

    // Configurar galerías de imágenes e índices iniciales
    useEffect(() => {
        const galleries = {};
        const initialIndexes = {};

        // Procesar items regulares
        budget.grouped_items?.regular?.forEach((item) => {
            const key = `regular-${item.id}`;
            galleries[key] = organizeImages(item.product?.images);
            initialIndexes[key] = 0; // Siempre empezar por la primera (que será la destacada)
        });

        // Procesar grupos de variantes
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            items.forEach((item) => {
                const key = `variant-${group}-${item.id}`;
                galleries[key] = organizeImages(item.product?.images);
                initialIndexes[key] = 0; // Siempre empezar por la primera (que será la destacada)
            });
        });

        setImageGalleries(galleries);
        setCurrentImageIndexes(initialIndexes);

        // Inicializar variantes seleccionadas basado en is_selected de la base de datos (igual que dashboard)
        const initialVariants = {};
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            if (items.length > 0) {
                // Buscar el item que tiene is_selected = true
                const selectedItem = items.find((item) => item.is_selected === true);
                if (selectedItem) {
                    initialVariants[group] = selectedItem.id;
                    console.log(`Public Budget: Grupo ${group} - item seleccionado desde BD: ${selectedItem.id}`);
                } else {
                    // Fallback: si ninguno está marcado, seleccionar el primero
                    initialVariants[group] = items[0].id;
                    console.log(`Public Budget: Grupo ${group} - usando fallback: ${items[0].id}`);
                }
            }
        });
        setSelectedVariants(initialVariants);
    }, [budget]);

    // Recalcular totales cuando cambian las variantes (REUTILIZADA la lógica del dashboard)
    useEffect(() => {
        let newSubtotal = 0;

        // Sumar items regulares
        budget.grouped_items?.regular?.forEach((item) => {
            newSubtotal += parseFloat(item.line_total);
        });

        // Sumar variantes seleccionadas
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            const selectedItemId = selectedVariants[group];
            const selectedItem = items.find((item) => item.id === selectedItemId);
            if (selectedItem) {
                newSubtotal += parseFloat(selectedItem.line_total);
            }
        });

        // Calcular IVA y total (IGUAL que en dashboard/Show.jsx)
        const ivaAmount = applyIva ? newSubtotal * ivaRate : 0;
        const totalWithIva = newSubtotal + ivaAmount;

        setCalculatedTotals({
            subtotal: newSubtotal,
            iva: ivaAmount,
            total: totalWithIva,
        });
    }, [selectedVariants, budget.grouped_items, ivaRate, applyIva]);

    const handleVariantSelection = (group, itemId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [group]: itemId,
        }));
    };

    const formatCurrency = (amount) => {
        return `$${parseFloat(amount).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getStatusInfo = () => {
        if (budget.is_expired) {
            return {
                variant: 'destructive',
                icon: AlertTriangle,
                text: 'Presupuesto vencido',
            };
        }

        if (budget.days_until_expiry <= 3) {
            return {
                variant: 'secondary',
                icon: Clock,
                text: `Vence en ${budget.days_until_expiry} día${budget.days_until_expiry !== 1 ? 's' : ''}`,
            };
        }

        return {
            variant: 'default',
            icon: CheckCircle,
            text: 'Presupuesto vigente',
        };
    };

    const nextImage = (key) => {
        setCurrentImageIndexes((prev) => ({
            ...prev,
            [key]: (prev[key] + 1) % imageGalleries[key].length,
        }));
    };

    const prevImage = (key) => {
        setCurrentImageIndexes((prev) => ({
            ...prev,
            [key]: prev[key] === 0 ? imageGalleries[key].length - 1 : prev[key] - 1,
        }));
    };

    const statusInfo = getStatusInfo();
    const allVariantsSelected = budget.variant_groups.length === 0 || budget.variant_groups.every((group) => selectedVariants[group]);

    // TODO: refactorizar esta vista para dividir en componentes (no mezclar con dashboard)
    // TODO: hacer responsiva esta vista.

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title={`Presupuesto - ${budget.title}`} />

            {/* Header */}
            <div className="border-b bg-white">
                <div className="mx-auto max-w-4xl px-4 py-6">
                    <div className="text-center">
                        <h1 className="mb-2 text-2xl font-bold text-gray-900">{budget.title}</h1>
                        <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                            <span>Cliente: {budget.client.name}</span>
                            <span>•</span>
                            <span>Vendedor: {budget.user.name}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-4xl px-4 py-8">
                {/* Estado del presupuesto */}
                <Alert
                    className={`mb-6 ${budget.is_expired ? 'border-red-200 bg-red-50 text-red-800' : budget.days_until_expiry <= 3 ? 'border-orange-200 bg-orange-50 text-orange-800' : 'border-green-200 bg-green-50 text-green-800'}`}
                >
                    <statusInfo.icon className="h-5 w-5" />
                    <AlertDescription className="ml-2">{statusInfo.text}</AlertDescription>
                </Alert>
                {/* Información básica */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Información del Presupuesto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <strong>Fecha de emisión:</strong> {budget.issue_date_formatted}
                            </div>
                            <div>
                                <strong>Fecha de vencimiento:</strong> {budget.expiry_date_formatted}
                            </div>
                            <div>
                                <strong>Cliente:</strong> {budget.client.name}
                                {budget.client.company && ` (${budget.client.company})`}
                            </div>
                            <div>
                                <strong>Vendedor:</strong> {budget.user.name}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Items regulares */}
                {budget.grouped_items?.regular && budget.grouped_items.regular.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Productos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {budget.grouped_items.regular.map((item) => {
                                    const imageKey = `regular-${item.id}`;
                                    const images = imageGalleries[imageKey] || [];
                                    const currentIndex = currentImageIndexes[imageKey] || 0;

                                    return (
                                        <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                                            {/* Imagen del producto */}
                                            <div className="relative h-24 w-24 flex-shrink-0">
                                                {images.length > 0 ? (
                                                    <>
                                                        <img
                                                            src={images[currentIndex].full_url}
                                                            alt={item.product.name}
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                        {images.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={() => prevImage(imageKey)}
                                                                    className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                                                >
                                                                    <ChevronLeft className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => nextImage(imageKey)}
                                                                    className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                                                >
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200 text-gray-500">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del producto */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.product.name}</h3>
                                                <p className="text-sm text-gray-600">Categoría: {item.product.category?.name}</p>
                                                <div className="mt-2 text-sm">
                                                    <p>Cantidad: {item.quantity}</p>
                                                    <p>Precio unitario: {formatCurrency(item.unit_price)}</p>
                                                    {item.production_time_days && <p>Tiempo de producción: {item.production_time_days} días</p>}
                                                    {item.logo_printing && <p>Impresión: {item.logo_printing}</p>}
                                                </div>
                                            </div>

                                            {/* Total de la línea */}
                                            <div className="text-right">
                                                <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
                {/* Grupos de variantes */}
                {Object.entries(budget.grouped_items?.variants || {}).map(([group, items]) => (
                    <Card key={group} className="mb-6">
                        <CardHeader>
                            <CardTitle>Selecciona una opción - {group}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {items.map((item) => {
                                    const imageKey = `variant-${group}-${item.id}`;
                                    const images = imageGalleries[imageKey] || [];
                                    const currentIndex = currentImageIndexes[imageKey] || 0;
                                    const isSelected = selectedVariants[group] === item.id;

                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex cursor-pointer gap-4 rounded-lg border p-4 transition-all ${
                                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                            onClick={() => handleVariantSelection(group, item.id)}
                                        >
                                            {/* Imagen del producto */}
                                            <div className="relative h-24 w-24 flex-shrink-0">
                                                {images.length > 0 ? (
                                                    <>
                                                        <img
                                                            src={images[currentIndex].full_url}
                                                            alt={item.product.name}
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                        {images.length > 1 && (
                                                            <>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        prevImage(imageKey);
                                                                    }}
                                                                    className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                                                >
                                                                    <ChevronLeft className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        nextImage(imageKey);
                                                                    }}
                                                                    className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70"
                                                                >
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200 text-gray-500">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del producto */}
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{item.product.name}</h3>
                                                <p className="text-sm text-gray-600">Categoría: {item.product.category?.name}</p>
                                                <div className="mt-2 text-sm">
                                                    <p>Cantidad: {item.quantity}</p>
                                                    <p>Precio unitario: {formatCurrency(item.unit_price)}</p>
                                                    {item.production_time_days && <p>Tiempo de producción: {item.production_time_days} días</p>}
                                                    {item.logo_printing && <p>Impresión: {item.logo_printing}</p>}
                                                </div>
                                            </div>

                                            {/* Indicador de selección y total */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className={`h-4 w-4 rounded-full border-2 ${
                                                            isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                                        }`}
                                                    >
                                                        {isSelected && <CheckCircle className="h-4 w-4 text-white" />}
                                                    </div>
                                                </div>
                                                <p className="mt-2 text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {/* Totales */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Resumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(calculatedTotals.subtotal)}</span>
                            </div>
                            {applyIva && (
                                <div className="flex justify-between">
                                    <span>IVA ({(ivaRate * 100).toFixed(0)}%):</span>
                                    <span>{formatCurrency(calculatedTotals.iva)}</span>
                                </div>
                            )}
                            <div className="border-t pt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span>{formatCurrency(calculatedTotals.total)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                {/* Comentarios del pie */}
                {budget.footer_comments && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Comentarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-700">{budget.footer_comments}</p>
                        </CardContent>
                    </Card>
                )}
                {/* Botón de descarga para usar la URL generada dinámicamente: */}
                <div className="text-center">
                    <Button
                        onClick={() => {
                            const pdfUrl = generatePdfUrl();
                            window.open(pdfUrl, '_blank');
                        }}
                        disabled={!allVariantsSelected}
                        className="inline-flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Descargar PDF
                    </Button>
                </div>
            </div>
        </div>
    );
}
