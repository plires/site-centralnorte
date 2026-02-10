import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Star, StarOff, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ImageItem({ image, product, isFeatured, onImageClick, onDeleteImage, onSetFeaturedImage }) {
    const [imageToDelete, setImageToDelete] = useState(null);

    // Determinar si el producto es externo
    const isExternal = product?.origin_config?.is_external || false;

    return (
        <div
            className={cn(
                'group relative rounded-md border p-1 transition-all duration-200',
                isFeatured ? 'bg-primary/10 scale-[1.02] shadow-md ring-3 ring-green-600' : 'hover:ring-muted hover:ring-1',
            )}
        >
            <img
                src={image.full_url}
                width={300}
                height={300}
                alt={`Imagen del producto ${product.name}`}
                className="h-auto w-full cursor-pointer rounded-md object-cover transition hover:scale-105 hover:shadow-lg"
                onClick={() => onImageClick(image)}
            />

            {/* Botón Eliminar con AlertDialog - Solo para productos NO externos */}
            {!isExternal && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2 cursor-pointer bg-white/80 transition hover:bg-red-500 hover:text-white"
                            onClick={() => setImageToDelete(image.id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar esta imagen?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. La imagen será eliminada permanentemente del producto.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    onDeleteImage(product.id, imageToDelete);
                                    setImageToDelete(null);
                                }}
                            >
                                Eliminar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Indicador de imagen destacada - Siempre visible */}
            {/* Para productos externos: solo muestra el indicador visual */}
            {/* Para productos internos: permite cambiar la imagen destacada */}
            {isExternal ? (
                // Solo indicador visual para productos externos
                isFeatured && (
                    <div className="absolute top-2 left-2 rounded-md bg-green-600 p-2 text-white shadow-lg">
                        <Star className="h-4 w-4 fill-white" />
                    </div>
                )
            ) : (
                // Botón interactivo para productos internos
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        'absolute top-2 left-2 bg-white/80 transition',
                        isFeatured
                            ? 'cursor-default bg-green-600 text-white hover:bg-green-600 hover:text-white'
                            : 'cursor-pointer hover:bg-green-600 hover:text-white',
                    )}
                    onClick={!isFeatured ? () => onSetFeaturedImage(product.id, image.id) : undefined}
                    disabled={isFeatured}
                >
                    {isFeatured ? <Star className="h-4 w-4 fill-white" /> : <StarOff className="h-4 w-4" />}
                </Button>
            )}

            {/* Nombre de variante */}
            {image.variant && (
                <p className="text-muted-foreground mt-1 truncate px-1 text-center text-xs" title={image.variant}>
                    Variante: {image.variant}
                </p>
            )}
        </div>
    );
}
