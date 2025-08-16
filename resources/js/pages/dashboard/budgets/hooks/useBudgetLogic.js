import { useBudgetTotals } from './useBudgetTotals';

export function useBudgetLogic(items, businessConfig = null) {
    // Usar configuración del backend si está disponible, sino valores por defecto
    const ivaRate = businessConfig?.iva_rate ?? 0.21;
    const applyIva = businessConfig?.apply_iva ?? true;

    return useBudgetTotals(items, ivaRate, applyIva);
}
