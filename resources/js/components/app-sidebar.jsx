import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { footerNavItems, mainNavItems } from '@/config/menuSidebar';
import usePermissions from '@/hooks/use-permissions';
import { Link } from '@inertiajs/react';

import AppLogo from './app-logo';
const sideBarNav = mainNavItems();
const navFooter = footerNavItems();

export function AppSidebar() {
    const permissions = usePermissions();

    const filteredItems = sideBarNav.filter((item) => {
        // Si no requiere permiso, se incluye
        if (!item.permission) return true;
        // Si tiene permiso, se incluye solo si el usuario lo tiene
        return permissions.includes(item.permission);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard/products/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={filteredItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={navFooter} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
