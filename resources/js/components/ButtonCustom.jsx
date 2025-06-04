import { Link } from '@inertiajs/react'; // Para Inertia.js

const ButtonCustom = ({
    as = 'button', // 'button' | 'a' | 'Link'
    href = null, // Para enlaces externos
    route = null, // Para rutas de Inertia
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    ...props
}) => {
    const baseClasses =
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow] duration-200 ease-in-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-offset-0 cursor-pointer";

    const variants = {
        primary: 'bg-black text-white shadow-sm hover:bg-gray-700 focus-visible:ring-blue-500/50',
        secondary: 'border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 focus-visible:ring-gray-500/50',
        destructive: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500/50',
        success: 'bg-green-600 text-white shadow-sm hover:bg-green-700 focus-visible:ring-green-500/50',
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900 focus-visible:ring-gray-500/50',
        ghost: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-500/50',
        link: 'text-blue-600 underline-offset-4 hover:underline hover:text-blue-700 focus-visible:ring-blue-500/50',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs has-[>svg]:px-2',
        md: 'h-9 px-6 text-sm has-[>svg]:px-3',
        lg: 'h-11 px-8 text-base has-[>svg]:px-4',
        xl: 'h-12 px-10 text-lg has-[>svg]:px-5',
        icon: 'h-9 w-9 p-0',
        'icon-sm': 'h-8 w-8 p-0',
        'icon-lg': 'h-11 w-11 p-0',
    };

    // const baseClasses =
    //     'inline-flex items-center justify-center rounded-lg border transition-colors duration-200 focus:ring-2 focus:ring-offset-1 focus:outline-none font-medium disabled:opacity-50 disabled:cursor-not-allowed';

    // const variants = {
    //     primary: 'border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 focus:ring-blue-500',
    //     secondary: 'border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100 focus:ring-gray-500',
    //     danger: 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 focus:ring-red-500',
    //     success: 'border-green-200 bg-green-50 text-green-700 hover:border-green-300 hover:bg-green-100 focus:ring-green-500',
    // };

    // const sizes = {
    //     sm: 'px-3 py-1.5 text-xs',
    //     md: 'px-4 py-2 text-sm',
    //     lg: 'px-6 py-3 text-base',
    // };

    const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

    // Determinar qué componente renderizar basado en las props
    if (route) {
        // Para rutas internas con Inertia
        return (
            <Link href={route} className={buttonClasses} {...props}>
                {children}
            </Link>
        );
    }

    if (href) {
        // Para enlaces externos
        return (
            <a href={href} className={buttonClasses} {...props}>
                {children}
            </a>
        );
    }

    if (as === 'a') {
        // Para cuando quieres forzar un <a> tag
        return (
            <a className={buttonClasses} {...props}>
                {children}
            </a>
        );
    }

    // Por defecto, renderizar como button
    return (
        <button className={buttonClasses} {...props}>
            {children}
        </button>
    );
};

export default ButtonCustom;
