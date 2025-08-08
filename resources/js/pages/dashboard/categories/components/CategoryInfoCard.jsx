import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChartBarStacked, FileText, Tag } from 'lucide-react';

export default function CategoryInfoCard({ category }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <ChartBarStacked className="mr-2 h-5 w-5" />
                    Información de la Categoría
                </CardTitle>
                <CardDescription>Productos de esta Categoría</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="mb-2 flex items-center">
                        <Tag className="mr-2 h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Nombre de la categoría</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{category.name}</p>
                </div>

                <Separator />

                <div>
                    <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Descripción</span>
                    </div>
                    <p className="line-clamp-6 text-sm text-gray-900">{category.description || 'Sin descripción'}</p>
                </div>
            </CardContent>
        </Card>
    );
}
