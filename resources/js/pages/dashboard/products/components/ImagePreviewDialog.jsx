import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

export default function ImagePreviewDialog({ selectedImage, onClose }) {
    return (
        <Dialog open={!!selectedImage} onOpenChange={onClose}>
            <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <DialogTitle>Vista previa de la imágen</DialogTitle>
                <img src={selectedImage} alt="Vista previa" className="mx-auto max-h-[80vh] w-full rounded-md object-contain" />
            </DialogContent>
        </Dialog>
    );
}
