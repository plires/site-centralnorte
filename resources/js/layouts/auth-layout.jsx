import { Toaster } from '@/components/ui/sonner';
import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({ children, title, description, ...props }) {
    return (
        <AuthLayoutTemplate title={title} description={description} {...props}>
            <Toaster richColors position="top-right" />
            {children}
        </AuthLayoutTemplate>
    );
}
