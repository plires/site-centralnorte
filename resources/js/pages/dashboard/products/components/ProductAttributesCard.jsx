import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

export default function ProductAttributesCard({ attributes }) {
    if (!attributes || attributes.length === 0) {
        return (
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Tag className="mr-2 h-5 w-5" />
                        Atributos del Producto
                    </CardTitle>
                    <CardDescription>Características y especificaciones</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-400 italic">Este producto no tiene atributos definidos</p>
                </CardContent>
            </Card>
        );
    }

    // Agrupar atributos por nombre
    const groupedAttributes = attributes.reduce((acc, attr) => {
        if (!acc[attr.attribute_name]) {
            acc[attr.attribute_name] = [];
        }
        acc[attr.attribute_name].push(attr.value);
        return acc;
    }, {});

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Tag className="mr-2 h-5 w-5" />
                    Atributos del Producto
                </CardTitle>
                <CardDescription>Características y especificaciones ({attributes.length})</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(groupedAttributes).map(([attributeName, values]) => (
                        <div key={attributeName} className="space-y-2">
                            <div className="text-sm font-medium text-gray-700">{attributeName}</div>
                            <div className="flex flex-wrap gap-2">
                                {values.map((value, index) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                        {value}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
