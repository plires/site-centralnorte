import ButtonCustom from '@/components/ButtonCustom';
import { Button } from '@/components/ui/button';
import { Trash2, X } from 'lucide-react';
import { useState } from 'react';

// Hook simple sin dependencias externas
export function useDeleteConfirmation() {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteData, setDeleteData] = useState(null);

    const confirmDelete = (data) => {
        return new Promise((resolve) => {
            setDeleteData({ ...data, resolve });
            setIsOpen(true);
        });
    };

    const handleConfirm = () => {
        if (deleteData?.resolve) {
            deleteData.resolve(true);
        }
        setIsOpen(false);
        setDeleteData(null);
    };

    const handleCancel = () => {
        if (deleteData?.resolve) {
            deleteData.resolve(false);
        }
        setIsOpen(false);
        setDeleteData(null);
    };

    const DeleteConfirmationDialog = () => (
        <>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay */}
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />

                    {/* Modal */}
                    <div className="relative mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trash2 className="h-5 w-5 text-red-500" />
                                <h3 className="text-lg font-semibold">{deleteData?.title || '¿Confirmar eliminación?'}</h3>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-6 w-6 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mb-6">
                            {deleteData?.itemName && <p className="mb-2 font-medium">"{deleteData.itemName}"</p>}
                            <p className="text-gray-600">
                                {deleteData?.description || 'Esta acción no se puede deshacer. ¿Estás seguro de que quieres continuar?'}
                            </p>
                        </div>

                        <div className="flex justify-end gap-3">
                            <ButtonCustom onClick={handleCancel} variant="secondary" size="md">
                                Cancelar
                            </ButtonCustom>

                            <ButtonCustom className="flex items-center gap-2" onClick={handleConfirm} variant="destructive" size="md">
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                            </ButtonCustom>
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    return { confirmDelete, DeleteConfirmationDialog };
}
