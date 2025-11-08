import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ListChecks, Plus, Trash2 } from 'lucide-react';

export default function ProductAttributesSection({ attributes, onChange, errors = {} }) {
    const addAttribute = () => {
        onChange([
            ...attributes,
            {
                id: `temp_${Date.now()}`,
                attribute_name: '',
                value: '',
            },
        ]);
    };

    const removeAttribute = (index) => {
        onChange(attributes.filter((_, i) => i !== index));
    };

    const updateAttribute = (index, field, value) => {
        const updated = [...attributes];
        updated[index] = { ...updated[index], [field]: value };
        onChange(updated);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ListChecks className="mr-2 h-5 w-5" />
                    Atributos del Producto
                </CardTitle>
                <CardDescription>Define características específicas como Marca, Técnica de aplicación, Material, etc.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {attributes.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-gray-300 p-6 text-center">
                            <ListChecks className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No hay atributos definidos. Haz clic en "Agregar Atributo" para comenzar.</p>
                        </div>
                    ) : (
                        attributes.map((attr, index) => (
                            <div key={attr.id || index} className="rounded-lg border border-gray-200 p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {/* Nombre del atributo */}
                                    <div className="space-y-2">
                                        <Label htmlFor={`attribute_name_${index}`}>Nombre del Atributo</Label>
                                        <Input
                                            id={`attribute_name_${index}`}
                                            value={attr.attribute_name}
                                            onChange={(e) => updateAttribute(index, 'attribute_name', e.target.value)}
                                            placeholder="Ej: Marca, Material, Color"
                                            className={errors[`attributes.${index}.attribute_name`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`attributes.${index}.attribute_name`] && (
                                            <span className="text-xs text-red-500">{errors[`attributes.${index}.attribute_name`]}</span>
                                        )}
                                    </div>

                                    {/* Valor */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor={`attribute_value_${index}`}>Valor</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeAttribute(index)}
                                                className="h-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Input
                                            id={`attribute_value_${index}`}
                                            value={attr.value}
                                            onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                                            placeholder="Ej: Nike, Algodón, Rojo"
                                            className={errors[`attributes.${index}.value`] ? 'border-red-500' : ''}
                                        />
                                        {errors[`attributes.${index}.value`] && (
                                            <span className="text-xs text-red-500">{errors[`attributes.${index}.value`]}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Botón agregar */}
                    <Button type="button" variant="outline" onClick={addAttribute} className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Agregar Atributo
                    </Button>

                    {errors.attributes && <span className="text-xs text-red-500">{errors.attributes}</span>}
                </div>
            </CardContent>
        </Card>
    );
}
