import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';
import { Loader2, RefreshCw } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';

function SyncProductButton({
    sku,
    isExternal,
    className = '',
    infoText = 'Este producto proviene de una API externa. Podés sincronizarlo individualmente para traer los últimos cambios. Usar solo si es imperativo.',
    postUrl,
}) {
    const [loading, setLoading] = useState(false);

    if (!isExternal) return null;

    const handleSync = () => {
        const url = postUrl ?? route('dashboard.products.sync.one', sku);

        router.post(
            url,
            {},
            {
                preserveScroll: true,
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
                onSuccess: () => toast.success('Sincronizado'),
                onError: () => toast.error('Hubo un error, intente más tarde'),
            },
        );
    };

    return (
        <div className={`pt-6 text-end ${className}`}>
            <p className="text-muted-foreground mb-2 text-left text-sm">{infoText}</p>

            <Button variant="destructive" size="sm" disabled={loading} onClick={handleSync}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                {loading ? 'Sincronizando...' : 'Sincronizar producto'}
            </Button>
        </div>
    );
}

SyncProductButton.propTypes = {
    sku: PropTypes.string.isRequired,
    isExternal: PropTypes.bool.isRequired,
    className: PropTypes.string,
    infoText: PropTypes.string,
    postUrl: PropTypes.string, // si preferís pasar la URL ya resuelta
};

export default SyncProductButton;
