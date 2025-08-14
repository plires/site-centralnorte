import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function VariantForm({ variant, index, isVariantMode, canRemove, onUpdate, onRemove }) {
    const [inputValues, setInputValues] = useState({});

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(amount);
    };

    const formatCurrencyInput = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 2,
        }).format(value || 0);
    };

    const parseCurrencyInput = (value) => {
        const cleaned = value.replace(/[^\d.,]/g, '');
        const normalized = cleaned.replace(',', '.');
        return parseFloat(normalized) || 0;
    };

    const handlePriceInputChange = (value) => {
        setInputValues((prev) => ({
            ...prev,
            [`price_${variant.id}`]: value,
        }));

        const numericValue = parseCurrencyInput(value);
        onUpdate(variant.id, 'unit_price', numericValue);
    };

    const handlePriceInputFocus = () => {
        setInputValues((prev) => ({
            ...prev,
            [`price_${variant.id}`]: variant.unit_price.toString(),
        }));
    };

    const handlePriceInputBlur = () => {
        setInputValues((prev) => ({
            ...prev,
            [`price_${variant.id}`]: formatCurrencyInput(variant.unit_price),
        }));
    };

    const getPriceInputValue = () => {
        return inputValues[`price_${variant.id}`] !== undefined ? inputValues[`price_${variant.id}`] : formatCurrencyInput(variant.unit_price);
    };

    return (
        <div className={`rounded-lg border p-4 ${isVariantMode ? 'bg-white' : ''}`}>
            {isVariantMode && (
                <div className="mb-3 flex items-center justify-between">
                    <h5 className="text-sm font-medium">Variante {index + 1}</h5>
                    {canRemove && (
                        <Button type="button" variant="ghost" size="sm" onClick={onRemove} className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Cantidad *</Label>
                    <Input
                        type="number"
                        min="1"
                        value={variant.quantity}
                        onChange={(e) => onUpdate(variant.id, 'quantity', parseInt(e.target.value) || 1)}
                    />
                </div>
                <div>
                    <Label>Precio Unitario *</Label>
                    <Input
                        type="text"
                        value={getPriceInputValue()}
                        onChange={(e) => handlePriceInputChange(e.target.value)}
                        onFocus={handlePriceInputFocus}
                        onBlur={handlePriceInputBlur}
                        placeholder="$0,00"
                    />
                </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                    <Label>Tiempo de Producción (días)</Label>
                    <Input
                        type="number"
                        value={variant.production_time_days}
                        onChange={(e) => onUpdate(variant.id, 'production_time_days', e.target.value)}
                    />
                </div>
                <div>
                    <Label>Total</Label>
                    <div className="rounded-md bg-gray-50 px-3 py-2 font-medium">{formatCurrency(variant.quantity * variant.unit_price)}</div>
                </div>
            </div>

            <div className="mt-4">
                <Label>Impresión de Logo</Label>
                <Input
                    value={variant.logo_printing}
                    onChange={(e) => onUpdate(variant.id, 'logo_printing', e.target.value)}
                    placeholder="Descripción de la impresión"
                />
            </div>
        </div>
    );
}
