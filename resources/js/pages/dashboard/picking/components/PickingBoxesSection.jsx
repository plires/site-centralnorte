// resources/js/pages/dashboard/picking/components/PickingBoxesSection.jsx

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Box, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Componente para manejar las cajas de un presupuesto de picking
 * Permite agregar, editar y eliminar cajas con validación de duplicados
 */
export default function PickingBoxesSection({ data, setData, boxes, errors, processing }) {
    /**
     * Agregar una nueva caja vacía al array
     */
    const addBox = () => {
        const newBox = {
            box_id: '',
            box_dimensions: '',
            box_unit_cost: '',
            quantity: '1',
        };
        setData('boxes', [...data.boxes, newBox]);
    };

    /**
     * Eliminar una caja del array por índice
     */
    const removeBox = (index) => {
        const updatedBoxes = data.boxes.filter((_, i) => i !== index);
        setData('boxes', updatedBoxes);
    };

    /**
     * Actualizar un campo específico de una caja
     * Si se actualiza box_id, autocompleta dimensions y cost
     */
    const updateBox = (index, field, value) => {
        const updatedBoxes = [...data.boxes];

        // Si se está actualizando el box_id
        if (field === 'box_id') {
            // Validar que no esté duplicado
            const isDuplicate = data.boxes.some((box, i) => i !== index && box.box_id === value);

            if (isDuplicate) {
                toast.error('Esta caja ya está agregada al presupuesto');
                return;
            }

            // Buscar la caja seleccionada en el array de boxes disponibles
            const selectedBox = boxes.find((b) => b.id.toString() === value);

            if (selectedBox) {
                // Autocompletar dimensions y cost
                updatedBoxes[index] = {
                    ...updatedBoxes[index],
                    box_id: value,
                    box_dimensions: selectedBox.dimensions,
                    box_unit_cost: selectedBox.cost,
                };
            } else {
                // Solo actualizar el box_id
                updatedBoxes[index][field] = value;
            }
        } else {
            // Para otros campos, actualizar normalmente
            updatedBoxes[index][field] = value;
        }

        setData('boxes', updatedBoxes);
    };

    /**
     * Calcular el subtotal de una caja
     */
    const calculateBoxSubtotal = (box) => {
        const unitCost = parseFloat(box.box_unit_cost) || 0;
        const quantity = parseInt(box.quantity) || 0;
        return unitCost * quantity;
    };

    /**
     * Formatear moneda
     */
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value);
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5" />
                        Cajas (Opcional)
                    </CardTitle>
                    <Button type="button" onClick={addBox} size="sm" variant="outline" disabled={processing}>
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Caja
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Mensaje de error general */}
                {errors.boxes && typeof errors.boxes === 'string' && (
                    <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{errors.boxes}</div>
                )}

                {/* Lista de cajas agregadas */}
                {data.boxes.length === 0 ? (
                    <div className="py-8 text-center text-gray-500">
                        <Box className="mx-auto mb-3 h-12 w-12 opacity-30" />
                        <p>No hay cajas agregadas.</p>
                        <p className="mt-1 text-sm">Las cajas son opcionales. Haz clic en "Agregar Caja" si deseas incluir alguna.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data.boxes.map((box, index) => {
                            const subtotal = calculateBoxSubtotal(box);
                            
                            return (
                                <div key={index} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    {/* Header de la caja */}
                                    <div className="mb-2 flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-700">Caja #{index + 1}</span>
                                        <Button
                                            type="button"
                                            onClick={() => removeBox(index)}
                                            size="sm"
                                            variant="ghost"
                                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                            disabled={processing}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Grid de campos */}
                                    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                                        {/* Select de Caja */}
                                        <div>
                                            <Label htmlFor={`box_${index}_select`}>
                                                Seleccionar Caja <span className="text-red-500">*</span>
                                            </Label>
                                            <Select
                                                value={box.box_id.toString()}
                                                onValueChange={(value) => updateBox(index, 'box_id', value)}
                                                disabled={processing}
                                            >
                                                <SelectTrigger id={`box_${index}_select`}>
                                                    <SelectValue placeholder="Elegir caja..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {boxes.map((b) => {
                                                        // Deshabilitar cajas ya seleccionadas en otras posiciones
                                                        const isAlreadySelected = data.boxes.some(
                                                            (selectedBox, i) => i !== index && selectedBox.box_id === b.id.toString()
                                                        );

                                                        return (
                                                            <SelectItem key={b.id} value={b.id.toString()} disabled={isAlreadySelected}>
                                                                {b.dimensions} - {formatCurrency(b.cost)}
                                                                {isAlreadySelected && ' (Ya agregada)'}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            {errors[`boxes.${index}.box_id`] && (
                                                <p className="mt-1 text-xs text-red-600">{errors[`boxes.${index}.box_id`]}</p>
                                            )}
                                        </div>

                                        {/* Dimensiones (auto) */}
                                        <div>
                                            <Label htmlFor={`box_${index}_dimensions`}>Dimensiones</Label>
                                            <Input
                                                id={`box_${index}_dimensions`}
                                                value={box.box_dimensions}
                                                disabled
                                                placeholder="Auto"
                                                className="bg-gray-100"
                                            />
                                        </div>

                                        {/* Costo Unitario (auto) */}
                                        <div>
                                            <Label htmlFor={`box_${index}_cost`}>Costo Unitario</Label>
                                            <Input
                                                id={`box_${index}_cost`}
                                                value={box.box_unit_cost ? formatCurrency(box.box_unit_cost) : ''}
                                                disabled
                                                placeholder="Auto"
                                                className="bg-gray-100"
                                            />
                                        </div>

                                        {/* Cantidad */}
                                        <div>
                                            <Label htmlFor={`box_${index}_quantity`}>
                                                Cantidad <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id={`box_${index}_quantity`}
                                                type="number"
                                                min="1"
                                                value={box.quantity}
                                                onChange={(e) => updateBox(index, 'quantity', e.target.value)}
                                                placeholder="Ej: 10"
                                                disabled={processing}
                                            />
                                            {errors[`boxes.${index}.quantity`] && (
                                                <p className="mt-1 text-xs text-red-600">{errors[`boxes.${index}.quantity`]}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Subtotal de esta caja */}
                                    {box.box_id && box.quantity && (
                                        <div className="mt-2 flex justify-end border-t border-gray-200 pt-2">
                                            <div className="text-right">
                                                <p className="text-xs text-gray-600">Subtotal de esta caja</p>
                                                <p className="text-sm font-semibold text-gray-900">{formatCurrency(subtotal)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Resumen de totales de cajas */}
                {data.boxes.length > 0 && (
                    <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-900">Total de Cajas</p>
                                <p className="text-xs text-blue-700">
                                    {data.boxes.length} {data.boxes.length === 1 ? 'caja agregada' : 'cajas agregadas'}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-blue-900">
                                    {formatCurrency(
                                        data.boxes.reduce((sum, box) => sum + calculateBoxSubtotal(box), 0)
                                    )}
                                </p>
                                <p className="text-xs text-blue-700">Subtotal de cajas</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Información adicional */}
                <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                    <p className="font-medium">Notas sobre cajas:</p>
                    <ul className="mt-1 list-inside list-disc space-y-1">
                        <li>Las cajas son opcionales en el presupuesto de picking</li>
                        <li>No puedes agregar la misma caja más de una vez</li>
                        <li>Las dimensiones y costos se cargan automáticamente al seleccionar una caja</li>
                        <li>Solo debes ingresar la cantidad necesaria</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
