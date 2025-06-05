import { usePage } from '@inertiajs/react';

export default function usePermissions() {
    const { props } = usePage();
    const permissions = props.auth?.user?.role?.permissions ?? [];
    return permissions.map((p) => p.name);
}
