import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

export default function ImagePreviewDialog({ selectedImage, onClose, onUpdateVariant, productId, variantOptions = [], usedVariants = [] }) {
    const handleVariantChange = (value) => {
        const newVariant = value === '_none_' ? '' : value;
        onUpdateVariant(productId, selectedImage.id, newVariant);
    };

    const handleClearVariant = () => {
        onUpdateVariant(productId, selectedImage.id, '');
    };

    // La variante actual de esta imagen no debe estar deshabilitada para sí misma
    const currentVariant = selectedImage?.variant || '';

    return (
        <Dialog open={!!selectedImage} onOpenChange={onClose}>
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <DialogTitle>Vista previa de la imagen</DialogTitle>
                <img src={selectedImage?.full_url} alt="Vista previa" className="mx-auto max-h-[80vh] w-full rounded-md object-contain" />

                {/* Variante con select */}
                {variantOptions.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground shrink-0 text-sm font-medium">Variante:</span>
                        <Select value={currentVariant || '_none_'} onValueChange={handleVariantChange}>
                            <SelectTrigger className="h-8 flex-1 text-sm">
                                <SelectValue placeholder="Sin variante" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_none_">Sin variante</SelectItem>
                                {variantOptions.map((option) => {
                                    const isUsed = usedVariants.includes(option) && option !== currentVariant;
                                    return (
                                        <SelectItem key={option} value={option} disabled={isUsed}>
                                            {option}
                                            {isUsed ? ' (ya asignada)' : ''}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        {currentVariant && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-red-500 hover:text-red-600"
                                onClick={handleClearVariant}
                                title="Quitar variante"
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                )}

                {/* Mostrar variante como texto si no hay opciones pero la imagen tiene una */}
                {variantOptions.length === 0 && currentVariant && (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm font-medium">Variante:</span>
                        <span className="text-sm">{currentVariant}</span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
