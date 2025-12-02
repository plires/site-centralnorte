// resources/js/pages/dashboard/picking/components/PickingQuantitiesSection.jsx

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Info } from 'lucide-react';

/**
 * Componente para manejar las cantidades y tipo de producto madre del kit
 */
export default function PickingQuantitiesSection({
    data,
    setData,
    currentScale,
    currentIncrement,
    assemblyType,
    setAssemblyType,
    errors,
    processing,
    formatCurrency,
}) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Cantidades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Total de Kits */}
                    <div>
                        <Label htmlFor="total_kits">
                            Total de Kits <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="total_kits"
                            type="number"
                            min="1"
                            value={data.total_kits}
                            onChange={(e) => setData('total_kits', e.target.value)}
                            placeholder="Ej: 100"
                            disabled={processing}
                        />
                        {errors.total_kits && <p className="mt-1 text-sm text-red-600">{errors.total_kits}</p>}
                    </div>

                    {/* Componentes por Kit */}
                    <div>
                        <Label htmlFor="total_components_per_kit">
                            Componentes por Kit <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="total_components_per_kit"
                            type="number"
                            min="1"
                            value={data.total_components_per_kit}
                            onChange={(e) => setData('total_components_per_kit', e.target.value)}
                            placeholder="Ej: 5"
                            disabled={processing}
                        />
                        {errors.total_components_per_kit && <p className="mt-1 text-sm text-red-600">{errors.total_components_per_kit}</p>}
                    </div>

                    {/* Producto madre del kit */}
                    <div>
                        <Label htmlFor="assembly_type">
                            Producto madre del kit <span className="text-red-500">*</span>
                        </Label>
                        <Select value={assemblyType} onValueChange={setAssemblyType} disabled={processing}>
                            <SelectTrigger id="assembly_type">
                                <SelectValue placeholder="Seleccionar tipo de armado" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="cost_without_assembly">Bolsa o caja que no requiera su armado</SelectItem>
                                <SelectItem value="cost_with_assembly">Caja para armar o mochila con cierre</SelectItem>
                            </SelectContent>
                        </Select>
                        {currentScale && assemblyType && (
                            <p className="mt-2 text-sm text-gray-600">
                                Costo: <span className="font-medium">{formatCurrency(currentScale[assemblyType])}</span> por kit
                            </p>
                        )}
                        {errors.services && <p className="mt-1 text-sm text-red-600">{errors.services}</p>}
                    </div>
                </div>

                {/* Información de la escala actual */}
                {currentScale && (
                    <Alert className="bg-blue-50 border-blue-200">
                        <Info className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-sm text-blue-900">
                            <strong>Escala de costos aplicada:</strong> {currentScale.quantity_from} -{' '}
                            {currentScale.quantity_to || 'más'} kits
                            {currentScale.production_time && (
                                <>
                                    {' • '}
                                    <strong>Tiempo de producción:</strong> {currentScale.production_time}
                                </>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Información del incremento actual */}
                {currentIncrement && (
                    <Alert className="bg-amber-50 border-amber-200">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-sm text-amber-900">
                            <strong>Incremento por componentes:</strong> {currentIncrement.description} (+
                            {(currentIncrement.percentage * 100).toFixed(0)}%)
                        </AlertDescription>
                    </Alert>
                )}

                {/* Advertencia si no hay escala */}
                {data.total_kits && !currentScale && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            No se encontró una escala de costos para {data.total_kits} kits. Por favor, verifica la cantidad o contacta al
                            administrador.
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
