// resources/js/Components/nav-main.jsx (ajusta la ruta según tu estructura)
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

export function NavMain({ items = [] }) {
    const page = usePage();
    const currentUrl = page.url;

    const isActive = (url) => {
        if (!url) return false;
        return currentUrl.startsWith(url);
    };

    const hasActiveChild = (item) => Array.isArray(item.items) && item.items.some((child) => isActive(child.url));

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = Array.isArray(item.items) && item.items.length > 0;

                    // 👉 Item con subitems (ej: "Configuración Costos Picking")
                    if (hasChildren) {
                        const openByDefault = hasActiveChild(item);

                        return (
                            <Collapsible key={item.title} asChild defaultOpen={openByDefault} className="group/collapsible">
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton isActive={openByDefault} className="whitespace-nowrap">
                                            {Icon && <Icon />}
                                            <span>{item.title}</span>

                                            <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            {item.items.map((subItem) => {
                                                const SubIcon = subItem.icon;

                                                return (
                                                    <SidebarMenuSubItem key={subItem.title}>
                                                        <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                                            <Link href={subItem.url} prefetch>
                                                                {SubIcon && <SubIcon />}
                                                                <span>{subItem.title}</span>
                                                            </Link>
                                                        </SidebarMenuSubButton>
                                                    </SidebarMenuSubItem>
                                                );
                                            })}
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        );
                    }

                    // 👉 Item normal sin subitems
                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton asChild isActive={isActive(item.url)}>
                                <Link href={item.url} prefetch>
                                    {Icon && <Icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
