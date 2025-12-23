// resources/js/pages/public/picking/components/PickingBudgetBoxesCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Box } from 'lucide-react';

/**
 * Card con la lista de cajas del presupuesto de picking
 * @param {Array} boxes - Array de cajas
 * @returns {JSX.Element} - Componente Card de cajas
 */
export default function PickingBudgetBoxesCard({ boxes = [] }) {
    const formatCurrency = (value) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(num);
    };

    if (!boxes || boxes.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-blue-600" />
                    Cajas
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[40%]">Dimensiones</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unit.</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {boxes.map((box, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {box.box_dimensions || 'Sin dimensiones'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {box.quantity?.toLocaleString('es-AR') || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(box.box_unit_cost)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(box.subtotal)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
