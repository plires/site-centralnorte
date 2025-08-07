import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FileText, Hash, Package, ShoppingCart, Tag } from 'lucide-react';

export default function ProductInfoCard({ product }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Información del Producto
                </CardTitle>
                <CardDescription>Datos generales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">SKU</span>
                    </div>
                    <p className="text-lg text-gray-900">{product.sku}</p>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Nombre</span>
                    </div>
                    <p className="text-lg text-gray-900">{product.name}</p>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Descripción</span>
                    </div>
                    <p className="text-sm text-gray-900">{product.description || 'Sin descripción'}</p>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Proveedor</span>
                    </div>
                    <p className="text-sm text-gray-900">{product.proveedor || 'No especificado'}</p>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Categoría</span>
                    </div>
                    <Badge variant="outline" className="text-sm">
                        {product.category?.name || 'Sin categoría'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
