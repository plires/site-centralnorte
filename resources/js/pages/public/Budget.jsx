import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, Clock, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Budget({ budget }) {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [calculatedTotals, setCalculatedTotals] = useState({
        subtotal: parseFloat(budget.subtotal),
        total: parseFloat(budget.total),
    });
    const [currentImageIndexes, setCurrentImageIndexes] = useState({});
    const [imageGalleries, setImageGalleries] = useState({});

    useEffect(() => {
        // Configurar galerías de imágenes para cada producto
        const galleries = {};
        const initialIndexes = {};

        // Procesar items regulares
        budget.grouped_items?.regular?.forEach((item) => {
            const key = `regular-${item.id}`;
            galleries[key] = item.product?.images || [];
            initialIndexes[key] = 0;
        });

        // Procesar grupos de variantes
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            items.forEach((item) => {
                const key = `variant-${group}-${item.id}`;
                galleries[key] = item.product?.images || [];
                initialIndexes[key] = 0;
            });
        });

        setImageGalleries(galleries);
        setCurrentImageIndexes(initialIndexes);

        // Configurar variantes por defecto (primera opción de cada grupo)
        const defaultVariants = {};
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            if (items.length > 0) {
                defaultVariants[group] = items[0].id;
            }
        });
        setSelectedVariants(defaultVariants);
    }, [budget]);

    // Recalcular totales cuando cambian las variantes
    useEffect(() => {
        let subtotal = 0;

        // Sumar items regulares
        budget.grouped_items?.regular?.forEach((item) => {
            subtotal += parseFloat(item.line_total);
        });

        // Sumar variantes seleccionadas
        Object.entries(budget.grouped_items?.variants || {}).forEach(([group, items]) => {
            const selectedItemId = selectedVariants[group];
            const selectedItem = items.find((item) => item.id === selectedItemId);
            if (selectedItem) {
                subtotal += parseFloat(selectedItem.line_total);
            }
        });

        setCalculatedTotals({
            subtotal: subtotal,
            total: subtotal, // Aquí puedes agregar lógica para impuestos
        });
    }, [selectedVariants, budget]);

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
                                <p className="text-sm font-medium text-gray-500">Fecha de vencimiento</p>
                                <p className="text-sm text-gray-900">{budget.expiry_date_short}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Cliente</p>
                                <p className="text-sm text-gray-900">
                                    {budget.client.name}
                                    {budget.client.company && ` - ${budget.client.company}`}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Vendedor</p>
                                <p className="text-sm text-gray-900">{budget.user.name}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Items regulares */}
                {budget.grouped_items?.regular?.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Productos Incluidos</CardTitle>
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
                                                            src={images[currentIndex]?.url}
                                                            alt={item.product?.name}
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                        {images.length > 1 && (
                                                            <div className="absolute inset-0 flex items-center justify-between">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                                                                    onClick={() => prevImage(imageKey)}
                                                                >
                                                                    <ChevronLeft className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                                                                    onClick={() => nextImage(imageKey)}
                                                                >
                                                                    <ChevronRight className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200 text-gray-400">
                                                        Sin imagen
                                                    </div>
                                                )}
                                            </div>

                                            {/* Detalles del producto */}
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                                <p className="text-sm text-gray-500">{item.product?.category?.name}</p>

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
                    <Card key={group} className="mb-6">
                        <CardHeader>
                            <CardTitle>Selecciona una opción para: {group}</CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                            <div key={item.id} className="flex gap-4 rounded-lg border p-4">
                                                <RadioGroupItem value={item.id.toString()} id={`variant-${item.id}`} className="mt-2" />

                                                {/* Imagen del producto */}
                                                <div className="relative h-24 w-24 flex-shrink-0">
                                                    {images.length > 0 ? (
                                                        <>
                                                            <img
                                                                src={images[currentIndex]?.url}
                                                                alt={item.product?.name}
                                                                className="h-full w-full rounded-md object-cover"
                                                            />
                                                            {images.length > 1 && (
                                                                <div className="absolute inset-0 flex items-center justify-between">
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                                                                        onClick={() => prevImage(imageKey)}
                                                                    >
                                                                        <ChevronLeft className="h-3 w-3" />
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        className="h-6 w-6 rounded-full bg-black/50 p-0 text-white hover:bg-black/70"
                                                                        onClick={() => nextImage(imageKey)}
                                                                    >
                                                                        <ChevronRight className="h-3 w-3" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center rounded-md bg-gray-200 text-gray-400">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Detalles del producto */}
                                                <label htmlFor={`variant-${item.id}`} className="flex-1 cursor-pointer">
                                                    <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                                    <p className="text-sm text-gray-500">{item.product?.category?.name}</p>

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
                        </CardContent>
                    </Card>
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
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total:</span>
                                <span>{formatCurrency(calculatedTotals.total)}</span>
                            </div>
                        </div>

                        {budget.footer_comments && (
                            <div className="mt-4 rounded-md bg-gray-50 p-3">
                                <p className="text-sm font-medium text-gray-700">Comentarios adicionales:</p>
                                <p className="mt-1 text-sm text-gray-600">{budget.footer_comments}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Botón de descarga */}
                <div className="text-center">
                    <Button onClick={handleDownloadPDF} className="w-full md:w-auto" disabled={!allVariantsSelected}>
                        <Download className="mr-2 h-4 w-4" />
                        Descargar PDF
                    </Button>
                    {!allVariantsSelected && <p className="mt-2 text-sm text-gray-500">Selecciona todas las opciones para descargar el PDF</p>}
                </div>
            </div>
        </div>
    );
}
