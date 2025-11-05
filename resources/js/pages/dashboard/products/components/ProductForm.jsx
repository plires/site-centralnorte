import ButtonCustom from '@/components/ButtonCustom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Check, ChevronDown, Package, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ProductForm({ data, setData, handleSubmit, processing, errors, categories, isEditing = false }) {
    const [open, setOpen] = useState(false);

    // Inicializar category_ids si no existe
    useEffect(() => {
        if (!data.category_ids) {
            setData('category_ids', []);
        }
    }, []);

    const toggleCategory = (categoryId) => {
        const currentIds = data.category_ids || [];

        if (currentIds.includes(categoryId)) {
            // Remover categoría
            setData(
                'category_ids',
                currentIds.filter((id) => id !== categoryId),
            );
        } else {
            // Agregar categoría
            setData('category_ids', [...currentIds, categoryId]);
        }
    };

    const selectedCategories = categories.filter((cat) => (data.category_ids || []).includes(cat.id));
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

                                    {/* Multi-select de Categorías */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category_ids">
                                            Categorías <span className="text-red-500">*</span>
                                        </Label>

                                        <Popover open={open} onOpenChange={setOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={open}
                                                    className={`w-full justify-between ${errors.category_ids || errors['category_ids.0'] ? 'border-red-500' : ''}`}
                                                >
                                                    {selectedCategories.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {selectedCategories.map((cat) => (
                                                                <Badge key={cat.id} variant="secondary" className="mr-1">
                                                                    {cat.name}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground">Seleccionar categorías...</span>
                                                    )}
                                                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-full p-0">
                                                <Command>
                                                    <CommandInput placeholder="Buscar categoría..." />
                                                    <CommandEmpty>No se encontraron categorías.</CommandEmpty>
                                                    <CommandGroup className="max-h-64 overflow-auto">
                                                        {categories.map((category) => {
                                                            const isSelected = (data.category_ids || []).includes(category.id);

                                                            return (
                                                                <CommandItem key={category.id} onSelect={() => toggleCategory(category.id)}>
                                                                    <div className="flex w-full items-center gap-2">
                                                                        <Checkbox
                                                                            checked={isSelected}
                                                                            onCheckedChange={() => toggleCategory(category.id)}
                                                                        />
                                                                        <span className="flex-1">{category.name}</span>
                                                                        {isSelected && <Check className="h-4 w-4 text-green-600" />}
                                                                    </div>
                                                                </CommandItem>
                                                            );
                                                        })}
                                                    </CommandGroup>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>

                                        {(errors.category_ids || errors['category_ids.0']) && (
                                            <span className="text-xs text-red-500">{errors.category_ids || errors['category_ids.0']}</span>
                                        )}

                                        <p className="text-muted-foreground mt-1 text-xs">
                                            Puedes seleccionar múltiples categorías para este producto
                                        </p>
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
