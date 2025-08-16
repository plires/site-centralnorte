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
    user,
    businessConfig = null,
    isEditing = false,
    originalBudget = null,
}) {
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    const { totals, selectedVariants, handleVariantChange, calculateTotals } = useBudgetLogic(data.items, businessConfig);

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

    return (
        <>
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" onBack={handleExit} />

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    {/* Información básica del presupuesto */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <BudgetBasicInfo data={data} setData={setData} errors={errors} clients={clients} isEditing={isEditing} />

                        <BudgetDateSection data={data} setData={setData} errors={errors} user={user} isEditing={isEditing} />
                    </div>

                    {/* Items del presupuesto */}
                    <BudgetItemsSection
                        data={data}
                        setData={setData}
                        products={products}
                        selectedVariants={selectedVariants}
                        onVariantChange={handleVariantChange}
                        onItemsChange={calculateTotals}
                    />

                    {/* Totales y comentarios */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <BudgetCommentsSection data={data} setData={setData} />
                        <BudgetTotalsSection totals={totals} ivaRate={businessConfig?.iva_rate ?? 0.21} showIva={businessConfig?.apply_iva ?? true} />
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3 border-t pt-6">
                        <Button type="button" variant="outline" onClick={handleExit}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || data.items.length === 0} className="flex items-center gap-2">
                            <Save className="h-4 w-4" />
                            {processing ? 'Guardando...' : isEditing ? 'Actualizar Presupuesto' : 'Crear Presupuesto'}
                        </Button>
                    </div>
                </form>
            </div>

            {/* AlertDialog para confirmar salida */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            ¿Descartar cambios?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tienes productos agregados al presupuesto. Si sales ahora, perderás todos los cambios no guardados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit} className="bg-red-600 hover:bg-red-700">
                            Descartar y salir
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
