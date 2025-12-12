// resources/js/components/PaymentConditionSelector.jsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { DollarSign, Info, TrendingDown, TrendingUp } from 'lucide-react';

export default function PaymentConditionSelector({ value, onChange, paymentConditions, disabled = false, showInfo = true }) {
    // Convertir null/undefined/'' (string vacío) a string "none" para el Select
    const selectValue = value && value !== '' ? value.toString() : 'none';

    // Encontrar la condición seleccionada (solo si no es "none")
    const selectedCondition = selectValue !== 'none' ? paymentConditions?.find((pc) => pc.id === parseInt(selectValue)) : null;

    const formatPercentage = (percentage) => {
        const num = parseFloat(percentage);
        if (num === 0) return '0%';
        if (num > 0) return `+${num.toFixed(2)}%`;
        return `${num.toFixed(2)}%`;
    };

    const getPercentageColor = (percentage) => {
        const num = parseFloat(percentage);
        if (num === 0) return 'text-gray-600';
        if (num > 0) return 'text-red-600';
        return 'text-green-600';
    };

    const getPercentageIcon = (percentage) => {
        const num = parseFloat(percentage);
        if (num === 0) return null;
        if (num > 0) return <TrendingUp className="inline h-4 w-4" />;
        return <TrendingDown className="inline h-4 w-4" />;
    };

    const handleValueChange = (newValue) => {
        // Convertir "none" de vuelta a null para el formulario
        onChange(newValue === 'none' ? null : parseInt(newValue));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Condición de pago
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment-condition">Condición de Pago</Label>
                        <Select value={selectValue} onValueChange={handleValueChange} disabled={disabled}>
                            <SelectTrigger id="payment-condition">
                                <SelectValue placeholder="Selecciona una condición de pago" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sin condición específica</SelectItem>
                                {paymentConditions?.map((condition) => (
                                    <SelectItem key={condition.id} value={condition.id.toString()}>
                                        <div className="flex items-center justify-between gap-1">
                                            <span>{condition.description}</span>
                                            <span className={`font-mono text-sm ${getPercentageColor(condition.percentage)}`}>
                                                {getPercentageIcon(condition.percentage)} {formatPercentage(condition.percentage)}
                                            </span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Card informativo cuando hay una condición seleccionada */}
                    {showInfo && selectedCondition && (
                        <Card className="border-gray-200 bg-gray-50 py-3">
                            <CardHeader className="px-3">
                                <CardTitle className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                    <Info className="h-4 w-4" />
                                    Ajuste por Condición de Pago
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-3">
                                <CardDescription className="text-sm text-gray-800">
                                    <strong>{selectedCondition.description}:</strong>{' '}
                                    {parseFloat(selectedCondition.percentage) > 0 ? (
                                        <span className="text-red-600">
                                            Se aplicará un recargo del {formatPercentage(selectedCondition.percentage)} sobre el subtotal.
                                        </span>
                                    ) : parseFloat(selectedCondition.percentage) < 0 ? (
                                        <span className="text-green-600">
                                            Se aplicará un descuento del {formatPercentage(selectedCondition.percentage)} sobre el subtotal.
                                        </span>
                                    ) : (
                                        <span className="text-gray-600">Sin ajuste adicional sobre el subtotal.</span>
                                    )}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
