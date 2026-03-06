import ButtonCustom from '@/components/ButtonCustom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { useState } from 'react';

/**
 * Hook para el diálogo de eliminación de usuarios con reasignación de registros.
 *
 * Cuando el usuario a eliminar tiene presupuestos merch, picking o clientes asignados,
 * el diálogo exige seleccionar un vendedor de reemplazo antes de confirmar.
 *
 * Uso:
 *   const { confirmDelete, UserDeleteDialog } = useUserDeleteDialog();
 *   const result = await confirmDelete({ userName, merchCount, pickingCount, clientsCount, availableSellers });
 *   if (result.confirmed) { ...router.delete(..., { data: { reassign_to: result.reassignTo } }) }
 */
export function useUserDeleteDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [dialogData, setDialogData] = useState(null);

    // El estado del select vive en el hook para evitar problemas de remontado del componente
    const [selectedSeller, setSelectedSeller] = useState('');

    const confirmDelete = (data) => {
        return new Promise((resolve) => {
            setDialogData({ ...data, resolve });
            setSelectedSeller('');
            setIsOpen(true);
        });
    };

    const handleConfirm = () => {
        if (dialogData?.resolve) {
            dialogData.resolve({ confirmed: true, reassignTo: selectedSeller || null });
        }
        setIsOpen(false);
        setDialogData(null);
        setSelectedSeller('');
    };

    const handleCancel = () => {
        if (dialogData?.resolve) {
            dialogData.resolve({ confirmed: false, reassignTo: null });
        }
        setIsOpen(false);
        setDialogData(null);
        setSelectedSeller('');
    };

    const UserDeleteDialog = () => {
        const merchCount   = dialogData?.merchCount ?? 0;
        const pickingCount = dialogData?.pickingCount ?? 0;
        const clientsCount = dialogData?.clientsCount ?? 0;
        const sellers      = dialogData?.availableSellers ?? [];

        const needsReassignment = merchCount > 0 || pickingCount > 0 || clientsCount > 0;
        const noSellersAvailable = needsReassignment && sellers.length === 0;
        const canConfirm = !needsReassignment || (!noSellersAvailable && selectedSeller !== '');

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Overlay */}
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />

                {/* Modal */}
                <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-red-500" />
                            <h3 className="text-lg font-semibold">Eliminar usuario</h3>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleCancel} className="h-6 w-6 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Body */}
                    <div className="mb-6 space-y-4">
                        {dialogData?.userName && (
                            <p className="font-medium">"{dialogData.userName}"</p>
                        )}

                        {needsReassignment ? (
                            <>
                                {/* Aviso de registros asignados */}
                                <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <div>
                                        <p className="mb-1 font-medium">Este vendedor tiene registros asignados:</p>
                                        <ul className="space-y-0.5">
                                            {merchCount > 0 && (
                                                <li>
                                                    · {merchCount} presupuesto{merchCount !== 1 ? 's' : ''} de mercadería
                                                </li>
                                            )}
                                            {pickingCount > 0 && (
                                                <li>
                                                    · {pickingCount} presupuesto{pickingCount !== 1 ? 's' : ''} de picking
                                                </li>
                                            )}
                                            {clientsCount > 0 && (
                                                <li>
                                                    · {clientsCount} cliente{clientsCount !== 1 ? 's' : ''}
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                {noSellersAvailable ? (
                                    /* Sin vendedores disponibles para reasignar */
                                    <p className="text-sm text-red-600">
                                        No hay otros vendedores activos disponibles para reasignar los registros.
                                        Creá otro vendedor antes de eliminar este usuario.
                                    </p>
                                ) : (
                                    /* Select de vendedor */
                                    <div className="space-y-1.5">
                                        <Label>Reasignar registros a:</Label>
                                        <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Seleccionar vendedor..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {sellers.map((seller) => (
                                                    <SelectItem key={seller.id} value={String(seller.id)}>
                                                        {seller.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">
                                            Los presupuestos y clientes listados serán reasignados al vendedor seleccionado.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-600">Esta acción no se puede deshacer.</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <ButtonCustom onClick={handleCancel} variant="secondary" size="md">
                            Cancelar
                        </ButtonCustom>
                        <ButtonCustom
                            className="flex items-center gap-2"
                            onClick={handleConfirm}
                            variant="destructive"
                            size="md"
                            disabled={!canConfirm}
                        >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                        </ButtonCustom>
                    </div>
                </div>
            </div>
        );
    };

    return { confirmDelete, UserDeleteDialog };
}
