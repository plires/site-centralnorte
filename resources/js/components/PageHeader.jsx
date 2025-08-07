import ButtonCustom from '@/components/ButtonCustom';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ backRoute, backText = 'Volver' }) {
    return (
        <div className="text-end">
            <ButtonCustom className="mt-6 mr-6" route={backRoute} variant="secondary" size="md">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {backText}
            </ButtonCustom>
        </div>
    );
}
