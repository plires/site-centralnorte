import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Package, Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import ClientSelector from './ClientSelector';
import ProductSelector from './ProductSelector';

export default function BudgetForm({ data, setData, handleSubmit, processing, errors, isEditing = false, budget = null }) {
    const [totals, setTotals] = useState({ subtotal: 0, total: 0 });

    // Calcular totales cuando cambien los items
    useEffect(() => {
        const subtotal = data.items.reduce((sum, item) => {
            const quantity = parseFloat(item.quantity) || 0;
            const unitPrice = parseFloat(item.unit_price) || 0;
            return sum + quantity * unitPrice;
        }, 0);

        setTotals({
            subtotal: subtotal,
            total: subtotal, // Aquí puedes agregar lógica para impuestos
        });
    }, [data.items]);

    // Agregar nuevo item
    const addItem = () => {
        setData('items', [
            ...data.items,
            {
                product_id: '',
                quantity: 1,
                unit_price: 0,
                production_time_days: '',
                logo_printing: '',
                is_variant: false,
                variant_group: '',
                product: null,
            },
        ]);
    };

    // Eliminar item
    const removeItem = (index) => {
        const newItems = data.items.filter((_, i) => i !== index);
        setData('items', newItems);
    };

    // Actualizar item específico
    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setData('items', newItems);
    };

    // Duplicar item para crear variante
    const duplicateAsVariant = (index) => {
        const originalItem = data.items[index];
        const variantGroup = originalItem.variant_group || `variant_${Date.now()}`;

        // Actualizar el item original para marcarlo como variante si no lo está
        if (!originalItem.is_variant) {
            updateItem(index, 'is_variant', true);
            updateItem(index, 'variant_group', variantGroup);
        }

        // Crear el item duplicado
        const newItem = {
            ...originalItem,
            is_variant: true,
            variant_group: variantGroup,
            quantity: originalItem.quantity,
            unit_price: originalItem.unit_price,
        };

        setData('items', [...data.items, newItem]);
    };

    const formatCurrency = (amount) => `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    return (
        <div className="py-12">
            <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{isEditing ? 'Editar Presupuesto' : 'Crear Presupuesto'}</h3>
                            <ButtonCustom route={route('dashboard.budgets.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Información básica */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5" />
                                        Información Básica
                                    </CardTitle>
                                    <CardDescription>Datos generales del presupuesto</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {/* Título */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="title">Título del presupuesto</Label>
                                            <Input
                                                id="title"
                                                value={data.title}
                                                onChange={(e) => setData('title', e.target.value)}
                                                placeholder="ej: Presupuesto: Cotización cuadernos, bolígrafos y botellas"
                                                className={errors.title ? 'border-red-500' : ''}
                                            />
                                            {errors.title && <span className="text-xs text-red-500">{errors.title}</span>}
                                        </div>

                                        {/* Cliente */}
                                        <div className="md:col-span-2">
                                            <Label htmlFor="client_id">Cliente</Label>
                                            <ClientSelector
                                                value={data.client_id}
                                                onChange={(value) => setData('client_id', value)}
                                                error={errors.client_id}
                                            />
                                            {errors.client_id && <span className="text-xs text-red-500">{errors.client_id}</span>}
                                        </div>

                                        {/* Fechas */}
                                        <div>
                                            <Label htmlFor="issue_date">Fecha de emisión</Label>
                                            <Input
                                                id="issue_date"
                                                type="date"
                                                value={data.issue_date}
                                                onChange={(e) => setData('issue_date', e.target.value)}
                                                className={errors.issue_date ? 'border-red-500' : ''}
                                            />
                                            {errors.issue_date && <span className="text-xs text-red-500">{errors.issue_date}</span>}
                                        </div>

                                        <div>
                                            <Label htmlFor="expiry_date">Fecha de vencimiento</Label>
                                            <Input
                                                id="expiry_date"
                                                type="date"
                                                value={data.expiry_date}
                                                onChange={(e) => setData('expiry_date', e.target.value)}
                                                className={errors.expiry_date ? 'border-red-500' : ''}
                                            />
                                            {errors.expiry_date && <span className="text-xs text-red-500">{errors.expiry_date}</span>}
                                        </div>
                                    </div>

                                    {/* Estado (solo en edición) */}
                                    {isEditing && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="is_active"
                                                checked={data.is_active}
                                                onCheckedChange={(checked) => setData('is_active', checked)}
                                            />
                                            <Label htmlFor="is_active">Presupuesto activo</Label>
                                        </div>
                                    )}

                                    {/* Envío automático (solo en creación) */}
                                    {!isEditing && (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="send_email_to_client"
                                                checked={data.send_email_to_client}
                                                onCheckedChange={(checked) => setData('send_email_to_client', checked)}
                                            />
                                            <Label htmlFor="send_email_to_client">Enviar email automáticamente al cliente</Label>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Productos */}
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center">
                                                <Package className="mr-2 h-5 w-5" />
                                                Productos
                                            </CardTitle>
                                            <CardDescription>Agrega los productos al presupuesto</CardDescription>
                                        </div>
                                        <ButtonCustom type="button" onClick={addItem} variant="outline" size="sm">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Agregar Producto
                                        </ButtonCustom>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {data.items.length === 0 ? (
                                        <div className="py-8 text-center text-gray-500">
                                            <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                            <p>No hay productos agregados</p>
                                            <p className="text-sm">Haz clic en "Agregar Producto" para empezar</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {data.items.map((item, index) => (
                                                <ProductItem
                                                    key={index}
                                                    item={item}
                                                    index={index}
                                                    onUpdate={updateItem}
                                                    onRemove={removeItem}
                                                    onDuplicate={duplicateAsVariant}
                                                    errors={errors}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Totales */}
                                    {data.items.length > 0 && (
                                        <div className="mt-6 border-t pt-4">
                                            <div className="flex justify-end">
                                                <div className="w-64 space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Subtotal:</span>
                                                        <span>{formatCurrency(totals.subtotal)}</span>
                                                    </div>
                                                    <Separator />
                                                    <div className="flex justify-between text-lg font-bold">
                                                        <span>Total:</span>
                                                        <span className="text-green-600">{formatCurrency(totals.total)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Comentarios del pie */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Comentarios adicionales</CardTitle>
                                    <CardDescription>Texto que aparecerá al final del presupuesto</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={data.footer_comments}
                                        onChange={(e) => setData('footer_comments', e.target.value)}
                                        placeholder="Comentarios, condiciones, términos..."
                                        rows={6}
                                        className={errors.footer_comments ? 'border-red-500' : ''}
                                    />
                                    {errors.footer_comments && <span className="text-xs text-red-500">{errors.footer_comments}</span>}
                                </CardContent>
                            </Card>

                            {/* Botones de acción */}
                            <div className="flex items-center justify-end space-x-4 pt-6">
                                <ButtonCustom route={route('dashboard.budgets.index')} variant="secondary" size="md">
                                    Cancelar
                                </ButtonCustom>
                                <ButtonCustom type="submit" disabled={processing || data.items.length === 0} variant="primary" size="md">
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing
                                        ? isEditing
                                            ? 'Actualizando...'
                                            : 'Creando...'
                                        : isEditing
                                          ? 'Actualizar Presupuesto'
                                          : 'Crear Presupuesto'}
                                </ButtonCustom>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Componente para cada item de producto
function ProductItem({ item, index, onUpdate, onRemove, onDuplicate, errors }) {
    return (
        <div className={`rounded-lg border p-4 ${item.is_variant ? 'border-blue-200 bg-blue-50' : 'bg-gray-50'}`}>
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Producto #{index + 1}</span>
                    {item.is_variant && <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">Variante: {item.variant_group}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <ButtonCustom
                        type="button"
                        onClick={() => onDuplicate(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Crear variante"
                    >
                        <Plus className="h-4 w-4" />
                    </ButtonCustom>
                    <ButtonCustom
                        type="button"
                        onClick={() => onRemove(index)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </ButtonCustom>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Selector de producto */}
                <div className="md:col-span-2 lg:col-span-3">
                    <Label>Producto</Label>
                    <ProductSelector
                        value={item.product_id}
                        onChange={(productId, productData) => {
                            onUpdate(index, 'product_id', productId);
                            onUpdate(index, 'product', productData);
                            // Auto-llenar el precio si está disponible
                            if (productData && productData.last_price) {
                                onUpdate(index, 'unit_price', productData.last_price);
                            }
                        }}
                        selectedProduct={item.product}
                        error={errors[`items.${index}.product_id`]}
                    />
                </div>

                {/* Cantidad */}
                <div>
                    <Label>Cantidad</Label>
                    <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 0)}
                        className={errors[`items.${index}.quantity`] ? 'border-red-500' : ''}
                    />
                </div>

                {/* Precio unitario */}
                <div>
                    <Label>Precio unitario</Label>
                    <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => onUpdate(index, 'unit_price', parseFloat(e.target.value) || 0)}
                        className={errors[`items.${index}.unit_price`] ? 'border-red-500' : ''}
                    />
                </div>

                {/* Total de línea */}
                <div>
                    <Label>Total línea</Label>
                    <Input
                        value={`$${((item.quantity || 0) * (item.unit_price || 0)).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
                        disabled
                        className="bg-gray-100"
                    />
                </div>

                {/* Tiempo de producción */}
                <div>
                    <Label>Tiempo de producción (días)</Label>
                    <Input
                        type="number"
                        min="0"
                        value={item.production_time_days}
                        onChange={(e) => onUpdate(index, 'production_time_days', e.target.value)}
                        placeholder="ej: 15"
                    />
                </div>

                {/* Impresión de logo */}
                <div className="md:col-span-2">
                    <Label>Impresión de logo</Label>
                    <Input
                        value={item.logo_printing}
                        onChange={(e) => onUpdate(index, 'logo_printing', e.target.value)}
                        placeholder="ej: Estampado frontal 1 color"
                    />
                </div>
            </div>
        </div>
    );
}
