import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Clock, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Budget({ budget }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: budget.subtotal,
        total: budget.total,
    });
    const [imageGalleries, setImageGalleries] = useState({});
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});

    // Inicializar galerías de imágenes para cada producto
    useEffect(() => {
        const galleries = {};
        const indexes = {};

        // Procesar items regulares
        budget.grouped_items.regular.forEach((item) => {
            if (item.product.images && item.product.images.length > 0) {
                galleries[`regular_${item.id}`] = item.product.images;
                indexes[`regular_${item.id}`] = item.product.images.findIndex((img) => img.is_featured) || 0;
            }
        });

        // Procesar items con variantes
        Object.entries(budget.grouped_items.variants).forEach(([group, items]) => {
            items.forEach((item) => {
                if (item.product.images && item.product.images.length > 0) {
                    galleries[`variant_${item.id}`] = item.product.images;
                    indexes[`variant_${item.id}`] = item.product.images.findIndex((img) => img.is_featured) || 0;
                }
            });
        });

        setImageGalleries(galleries);
        setCurrentImageIndexes(indexes);
    }, [budget]);

    // Recalcular totales cuando cambien las selecciones de variantes
    useEffect(() => {
        calculateTotals();
    }, [selectedVariants]);

    const calculateTotals = () => {
        let subtotal = 0;

        // Sumar items regulares
        budget.grouped_items.regular.forEach((item) => {
            subtotal += item.line_total;
        });

        // Sumar items de variantes seleccionadas
        Object.entries(budget.grouped_items.variants).forEach(([group, items]) => {
            const selectedItemId = selectedVariants[group];
            if (selectedItemId) {
                const selectedItem = items.find((item) => item.id == selectedItemId);
                if (selectedItem) {
                    subtotal += selectedItem.line_total;
                }
            } else {
                // Si no hay selección, usar el primer item por defecto
                subtotal += items[0]?.line_total || 0;
            }
        });

        setCalculatedTotals({
            subtotal: subtotal,
            total: subtotal, // Aquí puedes agregar lógica para impuestos
        });
    };

    const handleVariantSelection = (group, itemId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [group]: itemId,
        }));
    };

    const handleDownloadPDF = () => {
        const params = new URLSearchParams();
        Object.entries(selectedVariants).forEach(([group, itemId]) => {
            params.append(`selected_variants[${group}]`, itemId);
        });

        const url = `${route('public.budget.pdf', budget.token)}?${params.toString()}`;
        window.open(url, '_blank');
    };

    const formatDate = (date) =>
        new Date(date).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

    const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

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
                variant: 'destructive',
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
                <Alert className={`mb-6 ${budget.is_expired ? 'border-red-200 bg-red-50' : ''}`}>
                    <statusInfo.icon className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <span>{statusInfo.text}</span>
                        <span className="text-sm">Válido hasta: {formatDate(budget.expiry_date)}</span>
                    </AlertDescription>
                </Alert>

                {/* Productos regulares */}
                {budget.grouped_items.regular.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Productos incluidos</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {budget.grouped_items.regular.map((item) => (
                                    <ProductCard
                                        key={item.id}
                                        item={item}
                                        gallery={imageGalleries[`regular_${item.id}`]}
                                        currentIndex={currentImageIndexes[`regular_${item.id}`] || 0}
                                        onNextImage={() => nextImage(`regular_${item.id}`)}
                                        onPrevImage={() => prevImage(`regular_${item.id}`)}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Productos con variantes */}
                {Object.keys(budget.grouped_items.variants).length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Productos con opciones</CardTitle>
                            <CardDescription>Selecciona la opción que prefieras para cada producto</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-8">
                                {Object.entries(budget.grouped_items.variants).map(([group, items]) => (
                                    <VariantGroup
                                        key={group}
                                        group={group}
                                        items={items}
                                        selectedItemId={selectedVariants[group] || items[0]?.id}
                                        onSelect={handleVariantSelection}
                                        imageGalleries={imageGalleries}
                                        currentImageIndexes={currentImageIndexes}
                                        onNextImage={nextImage}
                                        onPrevImage={prevImage}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Totales */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Resumen del presupuesto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-lg">
                                <span>Subtotal:</span>
                                <span>{formatCurrency(calculatedTotals.subtotal)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-xl font-bold text-green-600">
                                <span>Total:</span>
                                <span>{formatCurrency(calculatedTotals.total)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Comentarios adicionales */}
                {budget.footer_comments && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Condiciones y comentarios</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <pre className="font-sans text-sm whitespace-pre-wrap text-gray-700">{budget.footer_comments}</pre>
                        </CardContent>
                    </Card>
                )}

                {/* Botón de descarga */}
                <div className="text-center">
                    <Button onClick={handleDownloadPDF} disabled={budget.is_expired || !allVariantsSelected} size="lg" className="px-8">
                        <Download className="mr-2 h-5 w-5" />
                        Descargar PDF
                    </Button>

                    {!allVariantsSelected && !budget.is_expired && (
                        <p className="mt-2 text-sm text-gray-500">Selecciona todas las opciones antes de descargar</p>
                    )}

                    {budget.is_expired && <p className="mt-2 text-sm text-red-500">Este presupuesto ha vencido</p>}
                </div>
            </div>
        </div>
    );
}

// Componente para mostrar cada producto
function ProductCard({ item, gallery, currentIndex, onNextImage, onPrevImage }) {
    const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="rounded-lg border bg-gray-50 p-4">
            <div className="grid gap-4 md:grid-cols-3">
                {/* Imagen del producto */}
                <div className="relative">
                    {gallery && gallery.length > 0 ? (
                        <div className="relative">
                            <img src={gallery[currentIndex]?.url} alt={gallery[currentIndex]?.alt} className="h-48 w-full rounded-md object-cover" />

                            {gallery.length > 1 && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 left-2 -translate-y-1/2 transform bg-white/80 hover:bg-white"
                                        onClick={onPrevImage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="absolute top-1/2 right-2 -translate-y-1/2 transform bg-white/80 hover:bg-white"
                                        onClick={onNextImage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>

                                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 transform rounded bg-black/50 px-2 py-1 text-xs text-white">
                                        {currentIndex + 1} / {gallery.length}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-48 w-full items-center justify-center rounded-md bg-gray-200">
                            <span className="text-gray-500">Sin imagen</span>
                        </div>
                    )}
                </div>

                {/* Información del producto */}
                <div className="md:col-span-2">
                    <div className="mb-2 flex items-start justify-between">
                        <div>
                            <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                            <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                            <p className="text-sm text-gray-500">{item.product.category}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                            <p className="text-sm text-gray-500">
                                {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        {item.production_time_days && (
                            <div>
                                <span className="text-gray-600">Tiempo de producción:</span>
                                <span className="ml-1 text-gray-900">{item.production_time_days} días</span>
                            </div>
                        )}
                        {item.logo_printing && (
                            <div>
                                <span className="text-gray-600">Logo:</span>
                                <span className="ml-1 text-gray-900">{item.logo_printing}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente para grupos de variantes
function VariantGroup({ group, items, selectedItemId, onSelect, imageGalleries, currentImageIndexes, onNextImage, onPrevImage }) {
    const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="mb-4 font-medium text-gray-900">{items[0]?.product.name} - Opciones disponibles</h4>

            <div className="space-y-3">
                {items.map((item) => {
                    const isSelected = selectedItemId == item.id;
                    const galleryKey = `variant_${item.id}`;
                    const gallery = imageGalleries[galleryKey];
                    const currentIndex = currentImageIndexes[galleryKey] || 0;

                    return (
                        <div
                            key={item.id}
                            className={`cursor-pointer rounded-lg border p-4 transition-all ${
                                isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => onSelect(group, item.id)}
                        >
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name={`variant_${group}`}
                                    checked={isSelected}
                                    onChange={() => onSelect(group, item.id)}
                                    className="text-blue-600"
                                />

                                {/* Imagen pequeña */}
                                {gallery && gallery.length > 0 && (
                                    <div className="relative">
                                        <img
                                            src={gallery[currentIndex]?.url}
                                            alt={gallery[currentIndex]?.alt}
                                            className="h-16 w-16 rounded object-cover"
                                        />
                                        {gallery.length > 1 && isSelected && (
                                            <div className="absolute -top-1 -right-1">
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 bg-white p-0 shadow-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onPrevImage(galleryKey);
                                                        }}
                                                    >
                                                        <ChevronLeft className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 bg-white p-0 shadow-sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onNextImage(galleryKey);
                                                        }}
                                                    >
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex-grow">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">Cantidad: {item.quantity} unidades</p>
                                            <p className="text-sm text-gray-600">Precio unitario: {formatCurrency(item.unit_price)}</p>
                                            {item.production_time_days && (
                                                <p className="text-sm text-gray-600">Tiempo: {item.production_time_days} días</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold">{formatCurrency(item.line_total)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
