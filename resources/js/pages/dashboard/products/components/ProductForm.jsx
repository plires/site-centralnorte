import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Package, Save } from 'lucide-react';

export default function ProductForm({ data, setData, handleSubmit, processing, errors, categories, isEditing = false }) {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{isEditing ? 'Editar Producto' : 'Crear Producto'}</h3>
                            <ButtonCustom route={route('dashboard.products.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="mr-2 h-5 w-5" />
                                    Información del Producto
                                </CardTitle>
                                <CardDescription>
                                    {isEditing ? 'Modifica los datos del producto' : 'Completa los campos para crear un nuevo producto'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* SKU */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">SKU</Label>
                                        <Input
                                            id="sku"
                                            value={data.sku}
                                            onChange={(e) => setData('sku', e.target.value || '')}
                                            className={errors.sku ? 'border-red-500' : ''}
                                        />
                                        {errors.sku && <span className="text-xs text-red-500">{errors.sku}</span>}
                                    </div>

                                    {/* Nombre */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre</Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value || '')}
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label htmlFor="description">Descipción</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value || '')}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                                    </div>

                                    {/* Proveedor */}
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Proveedor</Label>
                                        <Input
                                            id="proveedor"
                                            value={data.proveedor}
                                            onChange={(e) => setData('proveedor', e.target.value || '')}
                                            className={errors.proveedor ? 'border-red-500' : ''}
                                        />
                                        {errors.proveedor && <span className="text-xs text-red-500">{errors.proveedor}</span>}
                                    </div>

                                    {/* Categoría */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category_id">Categoría</Label>
                                        <select
                                            id="category_id"
                                            value={data.category_id}
                                            onChange={(e) => setData('category_id', e.target.value || '')}
                                            className={`w-full rounded border px-3 py-2 text-sm ${errors.category_id ? 'border-red-500' : ''}`}
                                        >
                                            <option value="">Seleccionar categoría</option>
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.category_id && <span className="text-xs text-red-500">{errors.category_id}</span>}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex items-center justify-end space-x-4 pt-6">
                                        <ButtonCustom route={route('dashboard.products.index')} variant="secondary" size="md">
                                            Cancelar
                                        </ButtonCustom>
                                        <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? isEditing
                                                    ? 'Actualizando...'
                                                    : 'Creando...'
                                                : isEditing
                                                  ? 'Actualizar Producto'
                                                  : 'Crear Producto'}
                                        </ButtonCustom>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
