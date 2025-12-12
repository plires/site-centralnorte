// resources/js/pages/dashboard/budgets/components/BudgetForm.jsx
import PageHeader from '@/components/PageHeader';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { AlertTriangle, Save } from 'lucide-react';
import { useState } from 'react';

import PaymentConditionSelector from '@/components/PaymentConditionSelector';
import { useBudgetLogic } from '../hooks/useBudgetLogic';
import BudgetBasicInfo from './BudgetBasicInfo';
import BudgetCommentsSection from './BudgetCommentsSection';
import BudgetDateSection from './BudgetDateSection';
import BudgetItemsSection from './BudgetItemsSection';
import BudgetTotalsSection from './BudgetTotalsSection';

export default function BudgetForm({
    data,
    setData,
    handleSubmit,
    processing,
    errors,
    clients,
    products,
    paymentConditions,
    user,
    businessConfig = null,
    isEditing = false,
    originalBudget = null,
}) {
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    console.log(data);

    // Pasar paymentConditionId y paymentConditions al hook
    const { totals, selectedVariants, selectedPaymentCondition, handleVariantChange, calculateTotals, getItemsWithUpdatedSelection } = useBudgetLogic(
        data.items,
        businessConfig,
        data.picking_payment_condition_id,
        paymentConditions,
    );

    const handleExit = () => {
        if (data.items.length > 0) {
            setShowExitDialog(true);
            setPendingNavigation(() => () => router.visit(route('dashboard.budgets.index')));
        } else {
            router.visit(route('dashboard.budgets.index'));
        }
    };

    const confirmExit = () => {
        setShowExitDialog(false);
        if (pendingNavigation) {
            pendingNavigation();
        }
    };

    // Función para manejar cambios en variantes
    const handleVariantChangeAndUpdate = (group, itemId) => {
        handleVariantChange(group, itemId);
    };

    // Función para manejar cambios en los items
    const handleItemsChange = () => {
        calculateTotals();
    };

    // Envolver handleSubmit - versión simplificada
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        // Obtener items con la selección actualizada
        const itemsWithSelection = getItemsWithUpdatedSelection();

        // Actualizar los items en el formulario de forma síncrona
        data.items = itemsWithSelection;

        // Llamar al handleSubmit original
        handleSubmit(e);
    };

    return (
        <>
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" onBack={handleExit} />

                <form onSubmit={handleFormSubmit} className="space-y-6 p-6">
                    {/* Información básica del presupuesto */}
                    <BudgetBasicInfo data={data} setData={setData} errors={errors} clients={clients} user={user} isEditing={isEditing} />

                    {/* Fechas del presupuesto */}
                    <BudgetDateSection data={data} setData={setData} errors={errors} user={user} isEditing={isEditing} />

                    {/* Selector de Condición de Pago */}
                    <PaymentConditionSelector
                        value={data.picking_payment_condition_id}
                        onChange={(value) => setData('picking_payment_condition_id', value)}
                        paymentConditions={paymentConditions}
                        disabled={processing}
                        showInfo={true}
                    />

                    {/* Items del presupuesto */}
                    <BudgetItemsSection
                        data={data}
                        setData={setData}
                        products={products}
                        selectedVariants={selectedVariants}
                        onVariantChange={handleVariantChangeAndUpdate}
                        onItemsChange={handleItemsChange}
                    />

                    {/* Totales - ahora incluye paymentConditionAmount */}
                    <BudgetTotalsSection
                        totals={totals}
                        ivaRate={businessConfig?.iva_rate ?? 0.21}
                        showIva={businessConfig?.apply_iva ?? true}
                        paymentCondition={selectedPaymentCondition}
                    />

                    {/* Comentarios */}
                    <BudgetCommentsSection data={data} setData={setData} errors={errors} />

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-4 border-t pt-6">
                        <Button type="button" variant="outline" onClick={handleExit} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || data.items.length === 0} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Guardando...' : isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Diálogo de confirmación de salida */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ¿Salir sin guardar?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tienes productos agregados que se perderán si sales sin guardar. ¿Estás seguro de que quieres continuar?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit}>Salir sin guardar</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
