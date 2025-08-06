import ButtonCustom from '@/components/ButtonCustom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import { useForm } from '@inertiajs/react';
import { Edit } from 'lucide-react';
import { useState } from 'react';

export default function UploadProductImagesForm({ productId }) {
    const [files, setFiles] = useState(null);
    const { data, setData, post, processing, reset } = useForm({
        images: null,
    });

    useInertiaResponse({ resetOnSuccess: true }); // ✅ Esto refresca los datos sin reload

    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        setFiles(selectedFiles);
        setData('images', selectedFiles);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!files || files.length === 0) return;

        post(route('dashboard.products.images.store', { product: productId }), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setFiles(null);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
                <Label>Seleccionar imágenes</Label>
                <Input type="file" name="images[]" enctype="multipart/form-data" multiple onChange={handleFileChange} />
            </div>

            <ButtonCustom type="submit" disabled={processing} variant="primary" size="md">
                <Edit className="mr-2 h-4 w-4" />
                Cargar Imágenes
            </ButtonCustom>
        </form>
    );
}
