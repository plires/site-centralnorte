import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { product, name } = usePage().props;
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <img src={product.placeholder_image} alt="Placeholder" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{name}</span>
            </div>
        </>
    );
}
