import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Clock, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Budget({ budget, businessConfig }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        iva: 0,
        total: parseFloat(budget.total),
    });
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});
    const [imageGalleries, setImageGalleries] = useState({});

    // Obtener configuración de IVA y placeholder
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;
    const placeholderImage = businessConfig?.placeholder_image ?? '/images/product-placeholder.jpg';

    // Función helper para organizar imágenes con la destacada primero
    const organizeImages = (productImages) => {
        if (!productImages || productImages.length === 0) {
            // Retornar imagen placeholder si no hay imágenes (usando configuración)
            return [
                {
                    id: 'placeholder',
                    url: placeholderImage,
                    full_url: placeholderImage,
                    is_featured: true,
                    is_placeholder: true,
                },
            ];
        }

        // Ordenar: imagen destacada primero, luego las demás
        const sortedImages = [...productImages].sort((a, b) => {
            if (a.is_featured && !b.is_featured) return -1;
            if (!a.is_featured && b.is_featured) return 1;
            return 0;
        });

        return sortedImages;
    };

    useEffect(() => {
        // Configurar galerías de imágenes para cada producto
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
                    className={`mb-6 ${budget.is_expired ? 'border-red-200 bg-red-50' : budget.days_until_expiry <= 3 ? 'border-yellow-200 bg-yellow-50' : 'border-green-200 bg-green-50'}`}
                >
                    <statusInfo.icon className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span className="font-medium">{statusInfo.text}</span>
                        <Badge variant={statusInfo.variant}>Válido hasta: {budget.expiry_date_short}</Badge>
                    </AlertDescription>
                </Alert>

                {/* Información del presupuesto */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Información del Presupuesto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Fecha de emisión</p>
                                <p className="text-sm text-gray-900">{budget.issue_date_short}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Válido hasta</p>
                                <p className="text-sm text-gray-900">{budget.expiry_date_short}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items regulares */}
                {budget.grouped_items?.regular?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Productos incluidos</CardTitle>
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
                                                            src={images[currentIndex].full_url || images[currentIndex].url}
                                                            alt={item.product.name}
                                                            className="h-full w-full rounded-lg object-cover"
                                                            onError={(e) => {
                                                                // Fallback si falla la carga de la imagen
                                                                e.target.src = placeholderImage;
                                                            }}
                                                        />
                                                        {images.length > 1 && !images[currentIndex].is_placeholder && (
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
                                                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                                                                    {currentIndex + 1}/{images.length}
                                                                </div>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                                        <img
                                                            src="/images/product-placeholder.jpg"
                                                            alt="Sin imagen"
                                                            className="h-full w-full rounded-lg object-cover opacity-50"
                                                            onError={(e) => {
                                                                // Si el placeholder también falla, mostrar texto
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                        <span className="absolute hidden text-xs">Sin imagen</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Información del producto */}
                                            <div className="flex-1">
                                                <h4 className="font-medium">{item.product.name}</h4>

                                                <div className="mt-2 flex items-center gap-4 text-sm">
                                                    <span>Cantidad: {item.quantity}</span>
                                                    <span>Precio unitario: {formatCurrency(item.unit_price)}</span>
                                                    <span className="font-medium">Total: {formatCurrency(item.line_total)}</span>
                                                </div>

                                                {item.production_time_days && (
                                                    <p className="mt-1 text-sm text-blue-600">
                                                        Tiempo de producción: {item.production_time_days} días
                                                    </p>
                                                )}

                                                {item.logo_printing && (
                                                    <p className="mt-1 text-sm text-green-600">Impresión de logo: {item.logo_printing}</p>
                                                )}
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
                    <div key={group} className="mb-6">
                        {/* Contenedor principal con borde similar al dashboard */}
                        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                            {/* Header del grupo */}
                            <div className="border-b border-gray-200 px-6 py-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Selecciona una opción para: {items[0]?.product?.name || group}
                                </h3>
                            </div>

                            {/* Contenido del grupo */}
                            <div className="p-6">
                                <RadioGroup
                                    value={selectedVariants[group]?.toString()}
                                    onValueChange={(value) => handleVariantSelection(group, parseInt(value))}
                                >
                                    <div className="space-y-4">
                                        {items.map((item) => {
                                            const imageKey = `variant-${group}-${item.id}`;
                                            const images = imageGalleries[imageKey] || [];
                                            const currentIndex = currentImageIndexes[imageKey] || 0;

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`flex gap-4 rounded-lg border p-4 transition-all duration-200 ${
                                                        selectedVariants[group] === item.id
                                                            ? 'border-blue-500 bg-blue-50 shadow-sm'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <RadioGroupItem value={item.id.toString()} id={`variant-${item.id}`} className="mt-2" />

                                                    {/* Imagen del producto */}
                                                    <div className="relative h-24 w-24 flex-shrink-0">
                                                        {images.length > 0 ? (
                                                            <>
                                                                <img
                                                                    src={images[currentIndex].full_url || images[currentIndex].url}
                                                                    alt={item.product.name}
                                                                    className="h-full w-full rounded-lg object-cover"
                                                                    onError={(e) => {
                                                                        // Fallback si falla la carga de la imagen
                                                                        e.target.src = placeholderImage;
                                                                    }}
                                                                />
                                                                {images.length > 1 && !images[currentIndex].is_placeholder && (
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
                                                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
                                                                            {currentIndex + 1}/{images.length}
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                                                                <img
                                                                    src={placeholderImage}
                                                                    alt="Sin imagen"
                                                                    className="h-full w-full rounded-lg object-cover opacity-50"
                                                                    onError={(e) => {
                                                                        // Si el placeholder también falla, mostrar texto
                                                                        e.target.style.display = 'none';
                                                                        e.target.nextSibling.style.display = 'block';
                                                                    }}
                                                                />
                                                                <span className="absolute hidden text-xs">Sin imagen</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Información del producto */}
                                                    <label htmlFor={`variant-${item.id}`} className="flex-1 cursor-pointer">
                                                        <div className="mt-2 flex items-center gap-4 text-sm">
                                                            <span>Cantidad: {item.quantity}</span>
                                                            <span>Precio unitario: {formatCurrency(item.unit_price)}</span>
                                                            <span className="font-medium">Total: {formatCurrency(item.line_total)}</span>
                                                        </div>

                                                        {item.production_time_days && (
                                                            <p className="mt-1 text-sm text-blue-600">
                                                                Tiempo de producción: {item.production_time_days} días
                                                            </p>
                                                        )}

                                                        {item.logo_printing && (
                                                            <p className="mt-1 text-sm text-green-600">Impresión de logo: {item.logo_printing}</p>
                                                        )}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Totales */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Resumen del Presupuesto</CardTitle>
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

                {/* Botón de descarga PDF */}
                <div className="text-center">
                    <Button asChild size="lg" disabled={!allVariantsSelected}>
                        <a href={`/presupuesto/${budget.token}/pdf`} target="_blank" rel="noopener noreferrer">
                            <Download className="mr-2 h-4 w-4" />
                            Descargar PDF
                        </a>
                    </Button>
                    {!allVariantsSelected && <p className="mt-2 text-sm text-gray-600">Selecciona todas las opciones para descargar el PDF</p>}
                </div>
            </div>
        </div>
    );
}
