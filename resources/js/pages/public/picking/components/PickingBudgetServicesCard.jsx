// resources/js/pages/public/picking/components/PickingBudgetServicesCard.jsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package } from 'lucide-react';

/**
 * Card con la lista de servicios del presupuesto de picking
 * @param {Array} services - Array de servicios
 * @returns {JSX.Element} - Componente Card de servicios
 */
export default function PickingBudgetServicesCard({ services = [] }) {
    const formatCurrency = (value) => {
        const num = parseFloat(value) || 0;
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(num);
    };

    if (!services || services.length === 0) {
        return null;
    }

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Servicios Incluidos
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50%]">Servicio</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead className="text-right">Precio Unit.</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {services.map((service, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {service.service_description || 'Servicio sin descripción'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {service.quantity?.toLocaleString('es-AR') || 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {formatCurrency(service.unit_cost)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(service.subtotal)}
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
