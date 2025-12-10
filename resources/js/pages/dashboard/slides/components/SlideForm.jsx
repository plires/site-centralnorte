import ButtonCustom from '@/components/ButtonCustom';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Info, Monitor, Save, Smartphone, X } from 'lucide-react';
import { useRef, useState } from 'react';

export default function SlideForm({
    data,
    setData,
    handleSubmit,
    processing,
    errors,
    progress,
    isEditing = false,
    slide = null,
    canActivate,
    activeCount,
    maxActive,
}) {
    // Estados para preview de imágenes
    const [desktopPreview, setDesktopPreview] = useState(slide?.image_desktop_url || null);
    const [mobilePreview, setMobilePreview] = useState(slide?.image_mobile_url || null);

    // Refs para inputs de archivo
    const desktopInputRef = useRef(null);
    const mobileInputRef = useRef(null);

    // Manejar cambio de imagen desktop
    const handleDesktopImageChange = (file) => {
        if (file) {
            setData('image_desktop', file);
            const reader = new FileReader();
            reader.onload = (e) => setDesktopPreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Manejar cambio de imagen mobile
    const handleMobileImageChange = (file) => {
        if (file) {
            setData('image_mobile', file);
            const reader = new FileReader();
            reader.onload = (e) => setMobilePreview(e.target.result);
            reader.readAsDataURL(file);
        }
    };

    // Limpiar imagen desktop
    const clearDesktopImage = () => {
        setData('image_desktop', null);
        setDesktopPreview(slide?.image_desktop_url || null);
        if (desktopInputRef.current) {
            desktopInputRef.current.value = '';
        }
    };

    // Limpiar imagen mobile
    const clearMobileImage = () => {
        setData('image_mobile', null);
        setMobilePreview(slide?.image_mobile_url || null);
        if (mobileInputRef.current) {
            mobileInputRef.current.value = '';
        }
    };

    return (
        <div className="py-12">
            <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                    <PageHeader backRoute={route('dashboard.slides.index')} backText="Volver" />

                    <form onSubmit={handleSubmit} encType="multipart/form-data" className="p-6">
                        {/* Alerta sobre slides activos */}
                        {!canActivate && !data.is_active && (
                            <div className="mb-6 rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
                                <strong>Nota:</strong> Ya hay {maxActive} slides activos. Este slide se creará como inactivo.
                            </div>
                        )}

                        <div className="space-y-6">
                            {/* Información básica */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Información del Slide</CardTitle>
                                    <CardDescription>Configura el título y enlace del slide</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Título */}
                                    <div>
                                        <Label htmlFor="title">
                                            Título <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => setData('title', e.target.value)}
                                            maxLength={80}
                                            placeholder="Ej: Bienvenidos a nuestra tienda"
                                            className="mt-1"
                                        />
                                        <div className="mt-1 flex justify-between text-xs text-gray-500">
                                            <span>{errors.title && <span className="text-red-500">{errors.title}</span>}</span>
                                            <span>{data.title.length}/80 caracteres</span>
                                        </div>
                                    </div>

                                    {/* Enlace */}
                                    <div>
                                        <Label htmlFor="link">Enlace (opcional)</Label>
                                        <Input
                                            id="link"
                                            value={data.link}
                                            onChange={(e) => setData('link', e.target.value)}
                                            placeholder="Ej: /productos o https://ejemplo.com"
                                            className="mt-1"
                                        />
                                        {errors.link && <span className="text-xs text-red-500">{errors.link}</span>}
                                    </div>

                                    {/* Estado activo */}
                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label htmlFor="is_active">Slide Activo</Label>
                                            <p className="text-sm text-gray-500">
                                                {activeCount}/{maxActive} slides activos actualmente
                                            </p>
                                        </div>
                                        <Switch
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                            disabled={!canActivate && !data.is_active}
                                        />
                                    </div>
                                    {errors.is_active && <span className="text-xs text-red-500">{errors.is_active}</span>}
                                </CardContent>
                            </Card>

                            {/* Imágenes */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Imagen Desktop */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Monitor className="h-5 w-5" />
                                            Imagen Desktop
                                            {!isEditing && <span className="text-red-500">*</span>}
                                        </CardTitle>
                                        <CardDescription>Tamaño recomendado: 1920 x 1080 px</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Preview */}
                                        {desktopPreview && (
                                            <div className="relative">
                                                <img
                                                    src={desktopPreview}
                                                    alt="Preview Desktop"
                                                    className="h-auto w-full rounded-lg border object-cover"
                                                />
                                                {data.image_desktop && (
                                                    <button
                                                        type="button"
                                                        onClick={clearDesktopImage}
                                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Input */}
                                        <div>
                                            <Input
                                                ref={desktopInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={(e) => handleDesktopImageChange(e.target.files[0])}
                                            />
                                            <div className="mt-1 flex items-center text-xs text-gray-500">
                                                <Info className="mr-1 h-3.5 w-3.5 text-blue-500" />
                                                JPEG, PNG, JPG o WebP. Máx 10MB.
                                            </div>
                                        </div>

                                        {errors.image_desktop && <span className="text-xs text-red-500">{errors.image_desktop}</span>}
                                    </CardContent>
                                </Card>

                                {/* Imagen Mobile */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Smartphone className="h-5 w-5" />
                                            Imagen Mobile
                                            {!isEditing && <span className="text-red-500">*</span>}
                                        </CardTitle>
                                        <CardDescription>Tamaño recomendado: 580 x 630 px</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Preview */}
                                        {mobilePreview && (
                                            <div className="relative mx-auto max-w-xs">
                                                <img
                                                    src={mobilePreview}
                                                    alt="Preview Mobile"
                                                    className="h-auto w-full rounded-lg border object-cover"
                                                />
                                                {data.image_mobile && (
                                                    <button
                                                        type="button"
                                                        onClick={clearMobileImage}
                                                        className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Input */}
                                        <div>
                                            <Input
                                                ref={mobileInputRef}
                                                type="file"
                                                accept="image/jpeg,image/png,image/jpg,image/webp"
                                                onChange={(e) => handleMobileImageChange(e.target.files[0])}
                                            />
                                            <div className="mt-1 flex items-center text-xs text-gray-500">
                                                <Info className="mr-1 h-3.5 w-3.5 text-blue-500" />
                                                JPEG, PNG, JPG o WebP. Máx 10MB.
                                            </div>
                                        </div>

                                        {errors.image_mobile && <span className="text-xs text-red-500">{errors.image_mobile}</span>}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Progress de subida */}
                            {progress && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Subiendo imágenes...</span>
                                        <span>{progress.percentage}%</span>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                        <div
                                            className="h-full bg-blue-600 transition-all duration-300"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Botón submit */}
                            <div className="flex justify-end gap-3 pt-4">
                                <ButtonCustom route={route('dashboard.slides.index')} variant="outline" size="md">
                                    Cancelar
                                </ButtonCustom>
                                <ButtonCustom type="submit" variant="primary" size="md" disabled={processing}>
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Slide'}
                                </ButtonCustom>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
