// resources/js/pages/dashboard/picking/components/PickingServicesSection.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Package, Palette, Tag } from 'lucide-react';

/**
 * Componente para manejar todos los servicios de un presupuesto de picking
 * Incluye: servicios adicionales, viruta, bolsitas, pluribol, palletizado, rotulado
 */
export default function PickingServicesSection({
    currentScale,
    assemblyType,
    domeSticking,
    setDomeSticking,
    additionalAssembly,
    setAdditionalAssembly,
    qualityControl,
    setQualityControl,
    shavingsType,
    setShavingsType,
    bagType,
    setBagType,
    bagQuantity,
    setBagQuantity,
    bubbleWrapType,
    setBubbleWrapType,
    bubbleWrapQuantity,
    setBubbleWrapQuantity,
    palletizingType,
    setPalletizingType,
    labelingType,
    setLabelingType,
    formatCurrency,
    processing,
}) {
    // Verificar si hay escala disponible
    if (!currentScale) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Servicios</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-4 text-amber-900">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <p className="text-sm">Primero debes seleccionar la cantidad de kits para ver los servicios disponibles y sus costos.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Servicios</h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Card: Servicios Adicionales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Palette className="h-4 w-4" />
                            Servicios Adicionales
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Pegado de Domes */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="dome_sticking"
                                checked={domeSticking}
                                onCheckedChange={setDomeSticking}
                                disabled={processing || !currentScale.dome_sticking_unit}
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor="dome_sticking"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Pegado de Domes
                                </Label>
                                {currentScale.dome_sticking_unit && (
                                    <p className="mt-1 text-xs text-gray-600">{formatCurrency(currentScale.dome_sticking_unit)} por unidad</p>
                                )}
                                {!currentScale.dome_sticking_unit && <p className="mt-1 text-xs text-gray-400">No disponible</p>}
                            </div>
                        </div>

                        {/* Ensamble Adicional */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="additional_assembly"
                                checked={additionalAssembly}
                                onCheckedChange={setAdditionalAssembly}
                                disabled={processing || !currentScale.additional_assembly}
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor="additional_assembly"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Ensamble Adicional
                                </Label>
                                {currentScale.additional_assembly && (
                                    <p className="mt-1 text-xs text-gray-600">{formatCurrency(currentScale.additional_assembly)} por kit</p>
                                )}
                                {!currentScale.additional_assembly && <p className="mt-1 text-xs text-gray-400">No disponible</p>}
                            </div>
                        </div>

                        {/* Control de Calidad */}
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="quality_control"
                                checked={qualityControl}
                                onCheckedChange={setQualityControl}
                                disabled={processing || !currentScale.quality_control}
                            />
                            <div className="flex-1">
                                <Label
                                    htmlFor="quality_control"
                                    className="text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Control de Calidad
                                </Label>
                                {currentScale.quality_control && (
                                    <p className="mt-1 text-xs text-gray-600">{formatCurrency(currentScale.quality_control)} por kit</p>
                                )}
                                {!currentScale.quality_control && <p className="mt-1 text-xs text-gray-400">No disponible</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Viruta */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Viruta</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="shavings_type">Tamaño de viruta</Label>
                            <Select value={shavingsType} onValueChange={setShavingsType} disabled={processing}>
                                <SelectTrigger id="shavings_type">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={undefined}>Sin viruta</SelectItem>
                                    {currentScale.shavings_50g_unit && (
                                        <SelectItem value="shavings_50g_unit">
                                            50g - {formatCurrency(currentScale.shavings_50g_unit)} por unidad
                                        </SelectItem>
                                    )}
                                    {currentScale.shavings_100g_unit && (
                                        <SelectItem value="shavings_100g_unit">
                                            100g - {formatCurrency(currentScale.shavings_100g_unit)} por unidad
                                        </SelectItem>
                                    )}
                                    {currentScale.shavings_200g_unit && (
                                        <SelectItem value="shavings_200g_unit">
                                            200g - {formatCurrency(currentScale.shavings_200g_unit)} por unidad
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {shavingsType && <p className="mt-2 text-xs text-gray-600">Se aplicará a cada kit automáticamente</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Bolsitas */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Bolsitas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="bag_type">Tamaño de bolsita</Label>
                            <Select value={bagType} onValueChange={setBagType} disabled={processing}>
                                <SelectTrigger id="bag_type">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={undefined}>Sin bolsita</SelectItem>
                                    {currentScale.bag_10x15_unit && (
                                        <SelectItem value="bag_10x15_unit">
                                            10x15 - {formatCurrency(currentScale.bag_10x15_unit)} por unidad
                                        </SelectItem>
                                    )}
                                    {currentScale.bag_20x30_unit && (
                                        <SelectItem value="bag_20x30_unit">
                                            20x30 - {formatCurrency(currentScale.bag_20x30_unit)} por unidad
                                        </SelectItem>
                                    )}
                                    {currentScale.bag_35x45_unit && (
                                        <SelectItem value="bag_35x45_unit">
                                            35x45 - {formatCurrency(currentScale.bag_35x45_unit)} por unidad
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {bagType && (
                            <div>
                                <Label htmlFor="bag_quantity">Cantidad de bolsitas</Label>
                                <Input
                                    id="bag_quantity"
                                    type="number"
                                    min="1"
                                    value={bagQuantity}
                                    onChange={(e) => setBagQuantity(e.target.value)}
                                    placeholder="Cantidad"
                                    disabled={processing}
                                />
                                <p className="mt-1 text-xs text-gray-600">Total por kit: {parseInt(bagQuantity) || 0} bolsitas</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card: Pluribol (Bubble Wrap) */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pluribol</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="bubble_wrap_type">Tamaño de pluribol</Label>
                            <Select value={bubbleWrapType} onValueChange={setBubbleWrapType} disabled={processing}>
                                <SelectTrigger id="bubble_wrap_type">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={undefined}>Sin pluribol</SelectItem>
                                    {currentScale.bubble_wrap_5x10_unit && (
                                        <SelectItem value="bubble_wrap_5x10_unit">
                                            5x10 - {formatCurrency(currentScale.bubble_wrap_5x10_unit)} por unidad
                                        </SelectItem>
                                    )}
                                    {currentScale.bubble_wrap_10x15_unit && (
                                        <SelectItem value="bubble_wrap_10x15_unit">
                                            10x15 - {formatCurrency(currentScale.bubble_wrap_10x15_unit)} por unidad
                                        </SelectItem>
                                    )}
                                    {currentScale.bubble_wrap_20x30_unit && (
                                        <SelectItem value="bubble_wrap_20x30_unit">
                                            20x30 - {formatCurrency(currentScale.bubble_wrap_20x30_unit)} por unidad
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {bubbleWrapType && (
                            <div>
                                <Label htmlFor="bubble_wrap_quantity">Cantidad de pluribol</Label>
                                <Input
                                    id="bubble_wrap_quantity"
                                    type="number"
                                    min="1"
                                    value={bubbleWrapQuantity}
                                    onChange={(e) => setBubbleWrapQuantity(e.target.value)}
                                    placeholder="Cantidad"
                                    disabled={processing}
                                />
                                <p className="mt-1 text-xs text-gray-600">Total por kit: {parseInt(bubbleWrapQuantity) || 0} unidades</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Card: Palletizado */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Package className="h-4 w-4" />
                            Palletizado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="palletizing_type">Tipo de palletizado</Label>
                            <Select value={palletizingType} onValueChange={setPalletizingType} disabled={processing}>
                                <SelectTrigger id="palletizing_type">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={undefined}>Sin palletizado</SelectItem>
                                    {currentScale.palletizing_without_pallet && (
                                        <SelectItem value="palletizing_without_pallet">
                                            Sin pallet - {formatCurrency(currentScale.palletizing_without_pallet)} por kit
                                        </SelectItem>
                                    )}
                                    {currentScale.palletizing_with_pallet && (
                                        <SelectItem value="palletizing_with_pallet">
                                            Con pallet - {formatCurrency(currentScale.palletizing_with_pallet)} por kit
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {palletizingType && <p className="mt-2 text-xs text-gray-600">Se aplicará a todos los kits</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Card: Rotulado */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Tag className="h-4 w-4" />
                            Rotulado
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="labeling_type">Tipo de rotulado</Label>
                            <Select value={labelingType} onValueChange={setLabelingType} disabled={processing}>
                                <SelectTrigger id="labeling_type">
                                    <SelectValue placeholder="Seleccionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {currentScale.cost_without_labeling && (
                                        <SelectItem value="cost_without_labeling">
                                            Sin rotulado - {formatCurrency(currentScale.cost_without_labeling)} por kit
                                        </SelectItem>
                                    )}
                                    {currentScale.cost_with_labeling && (
                                        <SelectItem value="cost_with_labeling">
                                            Con rotulado - {formatCurrency(currentScale.cost_with_labeling)} por kit
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                            {labelingType && <p className="mt-2 text-xs text-gray-600">Se aplicará a todos los kits</p>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Mensaje informativo sobre el tipo de armado */}
            {!assemblyType && (
                <div className="rounded-lg bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
                        <div className="flex-1 text-sm text-amber-900">
                            <p className="font-medium">Producto madre requerido</p>
                            <p className="mt-1">
                                Debes seleccionar el tipo de producto madre del kit en la sección de "Cantidades" antes de continuar. Este es un campo
                                obligatorio.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
