import AppLogoIcon from '@/components/app-logo-icon';
import { usePage } from '@inertiajs/react';

export default function AppLogo() {
    const { name } = usePage().props;
    return (
        <>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                <div className="flex h-6 w-6 items-center justify-center rounded-md">
                    <AppLogoIcon color="#ffffff" className="size-6 fill-current text-[var(--foreground)] dark:text-white" />
                </div>
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-none font-semibold">{name}</span>
            </div>
        </>
    );
}
