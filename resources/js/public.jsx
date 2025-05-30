import 'aos/dist/aos.css'; // AOS
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap
import 'modern-normalize/modern-normalize.css'; // Normalize moderno
import '../css/public.css';

import AOS from 'aos';

// Iniciá AOS
AOS.init();

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Central Norte';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.jsx`, import.meta.glob('./pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
});
