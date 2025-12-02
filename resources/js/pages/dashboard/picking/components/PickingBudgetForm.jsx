// resources/js/pages/dashboard/picking/components/PickingBudgetForm.jsx

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
import PaymentConditionSelector from '@/pages/dashboard/budgets/components/PaymentConditionSelector';
import { router } from '@inertiajs/react';
import { AlertTriangle, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

// Importar componentes de picking
import { usePickingBudgetLogic } from '../hooks/usePickingBudgetLogic';
import PickingBoxesSection from './PickingBoxesSection';
import PickingBudgetTotalsSection from './PickingBudgetTotalsSection';
import PickingClientSection from './PickingClientSection';
import PickingNotesSection from './PickingNotesSection';
import PickingQuantitiesSection from './PickingQuantitiesSection';
import PickingServicesSection from './PickingServicesSection';

/**
 * Componente principal del formulario de presupuesto de picking
 * Integra todos los sub-componentes y maneja la lógica centralizada
 * Reutilizable para Create y Edit
 */
export default function PickingBudgetForm({
    data,
    setData,
    handleSubmit,
    processing,
    errors,
    clients,
    boxes,
    costScales,
    componentIncrements,
    paymentConditions,
    businessConfig,
    isEditing = false,
    originalBudget = null,
}) {
    // Estados locales para UI
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);

    // Estados para servicios - Tipo de armado (obligatorio)
    const [assemblyType, setAssemblyType] = useState('');

    // Estados para servicios - Servicios adicionales (checkboxes)
    const [domeSticking, setDomeSticking] = useState(false);
    const [additionalAssembly, setAdditionalAssembly] = useState(false);
    const [qualityControl, setQualityControl] = useState(false);

    // Estados para servicios - Viruta
    const [shavingsType, setShavingsType] = useState('');

    // Estados para servicios - Bolsitas
    const [bagType, setBagType] = useState('');
    const [bagQuantity, setBagQuantity] = useState('');

    // Estados para servicios - Pluribol
    const [bubbleWrapType, setBubbleWrapType] = useState('');
    const [bubbleWrapQuantity, setBubbleWrapQuantity] = useState('');

    // Estados para servicios - Palletizado y Rotulado
    const [palletizingType, setPalletizingType] = useState('');
    const [labelingType, setLabelingType] = useState('cost_without_labeling');

    // Hook de lógica centralizada
    const { totals, currentScale, currentIncrement, selectedPaymentCondition } = usePickingBudgetLogic(
        data,
        businessConfig,
        costScales,
        componentIncrements,
        data.picking_payment_condition_id,
        paymentConditions
    );

    /**
     * Inicializar estados en modo edición
     * Parsea los servicios existentes y setea los estados correspondientes
     */
    useEffect(() => {
        if (isEditing && originalBudget && originalBudget.services) {
            originalBudget.services.forEach((service) => {
                switch (service.service_type) {
                    case 'assembly':
                        // Determinar el tipo de armado según la descripción
                        if (service.service_description.toLowerCase().includes('no requiera')) {
                            setAssemblyType('cost_without_assembly');
                        } else {
                            setAssemblyType('cost_with_assembly');
                        }
                        break;

                    case 'dome_sticking':
                        setDomeSticking(true);
                        break;

                    case 'additional_assembly':
                        setAdditionalAssembly(true);
                        break;

                    case 'quality_control':
                        setQualityControl(true);
                        break;

                    case 'shavings':
                        // Determinar el tipo de viruta según la descripción
                        if (service.service_description.includes('50g')) {
                            setShavingsType('shavings_50g_unit');
                        } else if (service.service_description.includes('100g')) {
                            setShavingsType('shavings_100g_unit');
                        } else if (service.service_description.includes('200g')) {
                            setShavingsType('shavings_200g_unit');
                        }
                        break;

                    case 'bag':
                        // Determinar el tipo de bolsita según la descripción
                        if (service.service_description.includes('10x15')) {
                            setBagType('bag_10x15_unit');
                        } else if (service.service_description.includes('20x30')) {
                            setBagType('bag_20x30_unit');
                        } else if (service.service_description.includes('35x45')) {
                            setBagType('bag_35x45_unit');
                        }
                        setBagQuantity(service.quantity.toString());
                        break;

                    case 'bubble_wrap':
                        // Determinar el tipo de pluribol según la descripción
                        if (service.service_description.includes('5x10')) {
                            setBubbleWrapType('bubble_wrap_5x10_unit');
                        } else if (service.service_description.includes('10x15')) {
                            setBubbleWrapType('bubble_wrap_10x15_unit');
                        } else if (service.service_description.includes('20x30')) {
                            setBubbleWrapType('bubble_wrap_20x30_unit');
                        }
                        setBubbleWrapQuantity(service.quantity.toString());
                        break;

                    case 'palletizing':
                        // Determinar el tipo de palletizado según la descripción
                        if (service.service_description.toLowerCase().includes('sin pallet')) {
                            setPalletizingType('palletizing_without_pallet');
                        } else {
                            setPalletizingType('palletizing_with_pallet');
                        }
                        break;

                    case 'labeling':
                        // Determinar el tipo de rotulado según la descripción
                        if (service.service_description.toLowerCase().includes('sin rotulado')) {
                            setLabelingType('cost_without_labeling');
                        } else {
                            setLabelingType('cost_with_labeling');
                        }
                        break;

                    default:
                        break;
                }
            });
        }
    }, [isEditing, originalBudget]);

    /**
     * useEffect CRÍTICO: Actualiza automáticamente el array de servicios
     * cuando cambia cualquier estado de servicio
     */
    useEffect(() => {
        if (!currentScale) return;

        const newServices = [];

        // 1. Tipo de armado (OBLIGATORIO)
        if (assemblyType) {
            const description =
                assemblyType === 'cost_without_assembly'
                    ? 'Bolsa o caja que no requiera su armado'
                    : 'Caja para armar o mochila con cierre';

            newServices.push({
                service_type: 'assembly',
                service_description: description,
                unit_cost: currentScale[assemblyType] || 0,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 2. Servicios adicionales (checkboxes)
        if (domeSticking && currentScale.dome_sticking_unit) {
            newServices.push({
                service_type: 'dome_sticking',
                service_description: 'Pegado de domes',
                unit_cost: currentScale.dome_sticking_unit,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        if (additionalAssembly && currentScale.additional_assembly) {
            newServices.push({
                service_type: 'additional_assembly',
                service_description: 'Ensamble adicional',
                unit_cost: currentScale.additional_assembly,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        if (qualityControl && currentScale.quality_control) {
            newServices.push({
                service_type: 'quality_control',
                service_description: 'Control de calidad',
                unit_cost: currentScale.quality_control,
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 3. Viruta (select)
        if (shavingsType && currentScale[shavingsType]) {
            let size = '';
            if (shavingsType.includes('50g')) size = '50g';
            else if (shavingsType.includes('100g')) size = '100g';
            else if (shavingsType.includes('200g')) size = '200g';

            newServices.push({
                service_type: 'shavings',
                service_description: `Viruta ${size}`,
                unit_cost: currentScale[shavingsType],
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 4. Bolsitas (select + quantity)
        if (bagType && currentScale[bagType] && bagQuantity) {
            let size = '';
            if (bagType.includes('10x15')) size = '10x15';
            else if (bagType.includes('20x30')) size = '20x30';
            else if (bagType.includes('35x45')) size = '35x45';

            newServices.push({
                service_type: 'bag',
                service_description: `Bolsita ${size}`,
                unit_cost: currentScale[bagType],
                quantity: parseInt(bagQuantity) || 1,
            });
        }

        // 5. Pluribol (select + quantity)
        if (bubbleWrapType && currentScale[bubbleWrapType] && bubbleWrapQuantity) {
            let size = '';
            if (bubbleWrapType.includes('5x10')) size = '5x10';
            else if (bubbleWrapType.includes('10x15')) size = '10x15';
            else if (bubbleWrapType.includes('20x30')) size = '20x30';

            newServices.push({
                service_type: 'bubble_wrap',
                service_description: `Pluribol ${size}`,
                unit_cost: currentScale[bubbleWrapType],
                quantity: parseInt(bubbleWrapQuantity) || 1,
            });
        }

        // 6. Palletizado (select)
        if (palletizingType && currentScale[palletizingType]) {
            const description =
                palletizingType === 'palletizing_without_pallet' ? 'Palletizado sin pallet' : 'Palletizado con pallet';

            newServices.push({
                service_type: 'palletizing',
                service_description: description,
                unit_cost: currentScale[palletizingType],
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // 7. Rotulado (select)
        if (labelingType && currentScale[labelingType]) {
            const description = labelingType === 'cost_without_labeling' ? 'Sin rotulado' : 'Con rotulado';

            newServices.push({
                service_type: 'labeling',
                service_description: description,
                unit_cost: currentScale[labelingType],
                quantity: parseInt(data.total_kits) || 1,
            });
        }

        // Actualizar el array de servicios en data
        setData('services', newServices);
    }, [
        assemblyType,
        domeSticking,
        additionalAssembly,
        qualityControl,
        shavingsType,
        bagType,
        bagQuantity,
        bubbleWrapType,
        bubbleWrapQuantity,
        palletizingType,
        labelingType,
        currentScale,
        data.total_kits,
    ]);

    /**
     * Formatear moneda
     */
    const formatCurrency = (value) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
        }).format(value);
    };

    /**
     * Manejar intento de salida
     */
    const handleExit = () => {
        // Si hay servicios o cajas agregadas, mostrar confirmación
        if (data.services.length > 0 || data.boxes.length > 0 || data.client_id) {
            setShowExitDialog(true);
            setPendingNavigation(() => () => router.visit(route('dashboard.picking.budgets.index')));
        } else {
            router.visit(route('dashboard.picking.budgets.index'));
        }
    };

    /**
     * Confirmar salida
     */
    const confirmExit = () => {
        setShowExitDialog(false);
        if (pendingNavigation) {
            pendingNavigation();
        }
    };

    /**
     * Envolver handleSubmit para asegurar que data.services está actualizado
     */
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e);
    };

    return (
        <>
            <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                <PageHeader backRoute={route('dashboard.picking.budgets.index')} backText="Volver" onBack={handleExit} />

                <form onSubmit={handleFormSubmit} className="space-y-6 p-6">
                    {/* Información del Cliente */}
                    <PickingClientSection data={data} setData={setData} clients={clients} errors={errors} processing={processing} />

                    {/* Cantidades */}
                    <PickingQuantitiesSection
                        data={data}
                        setData={setData}
                        currentScale={currentScale}
                        currentIncrement={currentIncrement}
                        assemblyType={assemblyType}
                        setAssemblyType={setAssemblyType}
                        errors={errors}
                        processing={processing}
                        formatCurrency={formatCurrency}
                    />

                    {/* Condición de Pago */}
                    <PaymentConditionSelector
                        value={data.picking_payment_condition_id}
                        onChange={(value) => setData('picking_payment_condition_id', value)}
                        paymentConditions={paymentConditions}
                        disabled={processing}
                        showInfo={true}
                    />

                    {/* Servicios */}
                    <PickingServicesSection
                        currentScale={currentScale}
                        assemblyType={assemblyType}
                        domeSticking={domeSticking}
                        setDomeSticking={setDomeSticking}
                        additionalAssembly={additionalAssembly}
                        setAdditionalAssembly={setAdditionalAssembly}
                        qualityControl={qualityControl}
                        setQualityControl={setQualityControl}
                        shavingsType={shavingsType}
                        setShavingsType={setShavingsType}
                        bagType={bagType}
                        setBagType={setBagType}
                        bagQuantity={bagQuantity}
                        setBagQuantity={setBagQuantity}
                        bubbleWrapType={bubbleWrapType}
                        setBubbleWrapType={setBubbleWrapType}
                        bubbleWrapQuantity={bubbleWrapQuantity}
                        setBubbleWrapQuantity={setBubbleWrapQuantity}
                        palletizingType={palletizingType}
                        setPalletizingType={setPalletizingType}
                        labelingType={labelingType}
                        setLabelingType={setLabelingType}
                        formatCurrency={formatCurrency}
                        processing={processing}
                    />

                    {/* Cajas */}
                    <PickingBoxesSection data={data} setData={setData} boxes={boxes} errors={errors} processing={processing} />

                    {/* Notas */}
                    <PickingNotesSection data={data} setData={setData} errors={errors} processing={processing} />

                    {/* Totales */}
                    <PickingBudgetTotalsSection
                        totals={totals}
                        incrementInfo={
                            currentIncrement
                                ? {
                                      description: currentIncrement.description,
                                      percentage: parseFloat(currentIncrement.percentage) || 0,
                                  }
                                : null
                        }
                        paymentCondition={selectedPaymentCondition}
                        totalKits={data.total_kits}
                        ivaRate={businessConfig?.iva_rate ?? 0.21}
                        showIva={businessConfig?.apply_iva ?? true}
                    />

                    {/* Botones de acción */}
                    <div className="flex items-center justify-end space-x-4 border-t pt-6">
                        <Button type="button" variant="outline" onClick={handleExit} disabled={processing}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing || !data.client_id || !assemblyType} className="flex items-center gap-2">
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
                            Has realizado cambios en el presupuesto que no se han guardado. Si sales ahora, perderás todos los cambios
                            realizados.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Continuar editando</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmExit} className="bg-red-600 hover:bg-red-700">
                            Salir sin guardar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
