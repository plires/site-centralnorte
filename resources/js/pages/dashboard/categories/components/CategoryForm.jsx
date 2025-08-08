import ButtonCustom from '@/components/ButtonCustom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ChartBarStacked, Save } from 'lucide-react';

export default function CategoryForm({ data, setData, handleSubmit, processing, errors, isEditing = false }) {
    return (
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="mb-6 flex items-center justify-between">
                            <h3 className="text-lg font-medium">{isEditing ? 'Editar Categoría' : 'Crear Categoría'}</h3>
                            <ButtonCustom route={route('dashboard.categories.index')} variant="secondary" size="md">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Volver
                            </ButtonCustom>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ChartBarStacked className="mr-2 h-5 w-5" />
                                    Información de esta Categoría
                                </CardTitle>
                                <CardDescription>
                                    {isEditing
                                        ? 'Modifica el nombre o la descripción de esta categoría'
                                        : 'Completa los campos para crear una nueva categoría'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                            className={`h-32 resize-y ${errors.description ? 'border-red-500' : ''}`}
                                        />
                                        {errors.description && <span className="text-xs text-red-500">{errors.description}</span>}
                                    </div>

                                    {/* Botones */}
                                    <div className="flex items-center justify-end space-x-4 pt-6">
                                        <ButtonCustom route={route('dashboard.categories.index')} variant="secondary" size="md">
                                            Cancelar
                                        </ButtonCustom>
                                        <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                                            <Save className="mr-2 h-4 w-4" />
                                            {processing
                                                ? isEditing
                                                    ? 'Actualizando...'
                                                    : 'Creando...'
                                                : isEditing
                                                  ? 'Actualizar Categoría'
                                                  : 'Crear Categoría'}
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
