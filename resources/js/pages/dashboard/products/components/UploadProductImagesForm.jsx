import ButtonCustom from '@/components/ButtonCustom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Info } from 'lucide-react';

export default function UploadProductImagesForm({ setData, handleSubmit, processing, errors, preview, handleImageChange, fileInputRef }) {
    return (
        <form method="POST" encType="multipart/form-data" onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
                <Label>Seleccionar imágenes</Label>
                <Input
                    ref={fileInputRef}
                    onChange={(e) => {
                        setData('image', e.target.files[0]);
                        handleImageChange(e.target.files[0]);
                    }}
                    type="file"
                    name="image"
                    accept="image/*"
                />

                {/* Texto informativo con ícono */}
                <div className="text-muted-foreground mt-1 flex items-center text-xs">
                    <Info className="mr-1 h-3.5 w-3.5 text-blue-500" />
                    <span>Solo imágenes (JPG, PNG, GIF) y menores a 5MB.</span>
                </div>

                {/* Error de validación */}
                {errors.image && <span className="mt-1 block text-xs text-red-500">{errors.image}</span>}
            </div>

            {/* 🖼️ Preview */}
            {preview && (
                <div className="h-24 w-24 overflow-hidden rounded border border-gray-300">
                    <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                </div>
            )}

            <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                <Edit className="mr-2 h-4 w-4" />
                {processing ? 'Cargando imagánes' : 'Cargar imagánes'}
            </ButtonCustom>
        </form>
    );
}
