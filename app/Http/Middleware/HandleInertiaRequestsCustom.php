<?php

namespace App\Http\Middleware;

use Inertia\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class HandleInertiaRequestsCustom extends Middleware
{
    /**
     * Devuelve la vista layout Blade raíz dependiendo de la ruta (publica o dashboard con login).
     */
    public function rootView(Request $request): string
    {
        $routeName = Route::currentRouteName();

        // Rutas públicas que deben usar el layout del dashboard (Tailwind)
        $publicRoutesUsingDashboardLayout = [
            'public.budget.show',
            'public.budget.pdf',
        ];

        if ($routeName && in_array($routeName, $publicRoutesUsingDashboardLayout)) {
            return 'dashboard'; // resources/views/dashboard.blade.php
        }

        if ($routeName && str_starts_with($routeName, 'public.')) {
            return 'public'; // resources/views/public.blade.php
        }

        return 'dashboard'; // resources/views/dashboard.blade.php
    }
}
