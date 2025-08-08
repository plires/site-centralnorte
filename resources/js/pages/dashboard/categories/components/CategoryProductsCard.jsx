import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function CategoryProductsCard({ products }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Productos en esta Categoría
                </CardTitle>
                <CardDescription>Listado de productos asignados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="mb-2 flex items-center">
                    <span className="text-sm font-medium text-gray-700">Productos</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Badge key={product.id} variant="outline">
                                {product.name}
                            </Badge>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500">No hay productos asignados a esta categoría.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
