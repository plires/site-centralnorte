import PageHeader from '@/components/PageHeader';
import ButtonCustom from '@/components/ButtonCustom';
import { useInertiaResponse } from '@/hooks/use-inertia-response';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { Edit, Copy, Mail, ExternalLink, Download, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';

const breadcrumbs = [
    { title: 'Presupuestos', href: '/dashboard/budgets' },
    { title: 'Detalles del Presupuesto', href: '#' },
];

export default function Show({ budget }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const { handleResponse } = useInertiaResponse();

    // Calcular estado del presupuesto
    const isExpired = new Date(budget.expiry_date) < new Date();
    const daysUntilExpiry = Math.ceil((new Date(budget.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));

    const handleSendEmail = () => {
        router.post(route('dashboard.budgets.send-email', budget.id), {}, handleResponse());
    };

    const getStatusBadge = () => {
        if (!budget.is_active) {
            return <Badge variant="secondary">Inactivo</Badge>;
        }
        
        if (isExpired) {
            return <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Vencido
            </Badge>;
        }
        
        if (daysUntilExpiry <= 3) {
            return <Badge variant="outline" className="flex items-center gap-1 border-orange-500 text-orange-600">
                <Clock className="h-3 w-3" />
                Por vencer ({daysUntilExpiry} días)
            </Badge>;
        }
        
        return <Badge variant="outline" className="flex items-center gap-1 border-green-500 text-green-600">
            <CheckCircle className="h-3 w-3" />
            Activo
        </Badge>;
    };

    const formatDate = (date) => new Date(date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const formatCurrency = (amount) => 
        `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    // Agrupar items por grupo de variantes
    const groupedItems = budget.items.reduce((groups, item) => {
        if (item.is_variant && item.variant_group) {
            if (!groups.variants[item.variant_group]) {
                groups.variants[item.variant_group] = [];
            }
            groups.variants[item.variant_group].push(item);
        } else {
            groups.regular.push(item);
        }
        return groups;
    }, { regular: [], variants: {} });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Presupuesto - ${budget.title}`} />

            <div className="py-12">
                <div className="mx-auto max-w-6xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        {/* Header con botón volver */}
                        <PageHeader backRoute={route('dashboard.budgets.index')} backText="Volver" />

                        <div className="p-6">
                            {/* Información principal */}
                            <div className="grid gap-6 md:grid-cols-2">
                                {/* Información del presupuesto */}
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle>Información del Presupuesto</CardTitle>
                                            {getStatusBadge()}
                                        </div>
                                        <CardDescription>Datos generales</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Título</span>
                                            <p className="text-lg text-gray-900">{budget.title}</p>
                                        </div>
                                        
                                        <Separator />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Fecha de emisión</span>
                                                <p className="text-sm text-gray-900">{formatDate(budget.issue_date)}</p>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Fecha de vencimiento</span>
                                                <p className="text-sm text-gray-900">{formatDate(budget.expiry_date)}</p>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Total</span>
                                            <p className="text-2xl font-bold text-green-600">{formatCurrency(budget.total)}</p>
                                        </div>

                                        <Separator />

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">ID</span>
                                                <Badge variant="secondary" className="mt-1 block font-mono">#{budget.id}</Badge>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-700">Items</span>
                                                <p className="text-sm text-gray-900">{budget.items.length} productos</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Información del cliente y vendedor */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Cliente y Vendedor</CardTitle>
                                        <CardDescription>Información de contacto</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Cliente</span>
                                            <p className="text-lg text-gray-900">{budget.client.name}</p>
                                            {budget.client.company && (
                                                <p className="text-sm text-gray-500">{budget.client.company}</p>
                                            )}
                                        </div>

                                        <Separator />

                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Vendedor</span>
                                            <p className="text-lg text-gray-900">{budget.user.name}</p>
                                        </div>

                                        <Separator />

                                        <div>
                                            <span className="text-sm font-medium text-gray-700">Estado del envío</span>
                                            {budget.email_sent ? (
                                                <div className="flex items-center gap-2 text-green-600">
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-sm">Enviado el {formatDate(budget.email_sent_at)}</span>
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No enviado</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Acciones */}
                            <div className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Acciones</CardTitle>
                                        <CardDescription>Operaciones disponibles</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-3">
                                            <ButtonCustom 
                                                route={route('dashboard.budgets.edit', budget.id)} 
                                                variant="primary" 
                                                size="md"
                                            >
                                                <Edit className="mr-2 h-4 w-4" />
                                                Editar
                                            </ButtonCustom>
                                            
                                            <ButtonCustom 
                                                route={route('dashboard.budgets.duplicate', budget.id)} 
                                                variant="secondary" 
                                                size="md"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Duplicar
                                            </ButtonCustom>
                                            
                                            <ButtonCustom 
                                                onClick={handleSendEmail}
                                                variant="secondary" 
                                                size="md"
                                            >
                                                <Mail className="mr-2 h-4 w-4" />
                                                Enviar Email
                                            </ButtonCustom>
                                            
                                            <ButtonCustom 
                                                onClick={() => window.open(route('public.budget.show', budget.token), '_blank')}
                                                variant="outline" 
                                                size="md"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Vista Pública
                                            </ButtonCustom>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Productos del presupuesto */}
                            <div className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Productos incluidos</CardTitle>
                                        <CardDescription>
                                            {budget.items.length} producto{budget.items.length !== 1 ? 's' : ''} en total
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-6">
                                            {/* Items regulares */}
                                            {groupedItems.regular.length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-4">Productos</h4>
                                                    <div className="space-y-4">
                                                        {groupedItems.regular.map((item) => (
                                                            <ProductItemCard key={item.id} item={item} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Items con variantes */}
                                            {Object.keys(groupedItems.variants).length > 0 && (
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-4">Productos con variantes</h4>
                                                    {Object.entries(groupedItems.variants).map(([group, items]) => (
                                                        <div key={group} className="mb-6">
                                                            <h5 className="text-sm font-medium text-gray-700 mb-3">
                                                                Grupo: {group}
                                                            </h5>
                                                            <div className="space-y-2 pl-4 border-l-2 border-blue-200">
                                                                {items.map((item) => (
                                                                    <ProductItemCard key={item.id} item={item} isVariant />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Comentarios del pie */}
                            {budget.footer_comments && (
                                <div className="mt-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Comentarios adicionales</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                                                {budget.footer_comments}
                                            </pre>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

// Componente para mostrar cada producto
function ProductItemCard({ item, isVariant = false }) {
    const formatCurrency = (amount) => 
        `$${Number(amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

    return (
        <div className={`border rounded-lg p-4 ${isVariant ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
            <div className="flex items-start gap-4">
                {/* Imagen del producto */}
                {item.product.featured_image && (
                    <div className="flex-shrink-0">
                        <img
                            src={item.product.featured_image.full_url}
                            alt={item.product.name}
                            className="w-16 h-16 object-cover rounded-md"
                        />
                    </div>
                )}
                
                {/* Información del producto */}
                <div className="flex-grow">
                    <div className="flex items-start justify-between">
                        <div>
                            <h5 className="font-medium text-gray-900">{item.product.name}</h5>
                            <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                            <p className="text-sm text-gray-500">{item.product.category?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(item.line_total)}</p>
                            <p className="text-sm text-gray-500">
                                {item.quantity} × {formatCurrency(item.unit_price)}
                            </p>
                        </div>
                    </div>
                    
                    {/* Detalles adicionales */}
                    <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        {item.production_time_days && (
                            <div>
                                <span className="text-gray-600">Logo:</span>
                                <span className="ml-1 text-gray-900">{item.logo_printing}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}">Tiempo de producción:</span>
                                <span className="ml-1 text-gray-900">{item.production_time_days} días</span>
                            </div>
                        )}
                        {item.logo_printing && (
                            <div>
                                <span className="text-gray-600