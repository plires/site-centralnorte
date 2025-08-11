import { Head } from '@inertiajs/react';
import { AlertTriangle, Home } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function BudgetNotFound({ message }) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Head title="Presupuesto no encontrado" />
            
            <div className="max-w-md w-full mx-4">
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <CardTitle className="text-xl">Presupuesto no encontrado</CardTitle>
                        <CardDescription>
                            {message || 'El presupuesto solicitado no existe o ha sido eliminado.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-sm text-gray-600 mb-6">
                            Esto puede suceder si:
                        </p>