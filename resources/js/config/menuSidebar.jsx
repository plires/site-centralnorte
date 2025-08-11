import {
    BookOpen,
    BookText,
    CalendarDays,
    ChartBarStacked,
    ChartColumnStacked,
    Contact,
    Folder,
    LayoutGrid,
    NotebookText,
    ShoppingBasket,
    SlidersHorizontal,
    Users,
} from 'lucide-react';

// Definiciones de items de sidebar dashboard
export const mainNavItems = () => [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Gestionar Usuarios',
        url: '/dashboard/users',
        icon: Users,
        permission: 'gestionar_usuarios',
    },
    {
        title: 'Gestionar Roles',
        url: '/dashboard/roles',
        icon: ChartColumnStacked,
        permission: 'gestionar_roles',
    },
    {
        title: 'Gestionar Productos',
        url: '/dashboard/products',
        icon: ShoppingBasket,
        permission: 'gestionar_productos',
    },
    {
        title: 'Gestionar Categorías',
        url: '/dashboard/categories',
        icon: ChartBarStacked,
        permission: 'gestionar_categorias',
    },
    {
        title: 'Gestionar Clientes',
        url: '/dashboard/clients',
        icon: Contact,
        permission: 'gestionar_clientes',
    },
    {
        title: 'Presupuestos de Merch',
        url: '/dashboard/budgets',
        icon: NotebookText,
        permission: 'gestionar_presupuestos_merch',
    },
    {
        title: 'Presupuestos de Picking',
        url: '/dashboard/presupuestos/picking',
        icon: BookText,
        permission: 'gestionar_presupuestos_pick',
    },
    {
        title: 'Gestionar Slides',
        url: '/dashboard/slides',
        icon: SlidersHorizontal,
        permission: 'gestionar_slides',
    },
    {
        title: 'Gestionar Blog',
        url: '/dashboard/blog',
        icon: CalendarDays,
        permission: 'gestionar_blog',
    },
];

export const footerNavItems = () => [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];
