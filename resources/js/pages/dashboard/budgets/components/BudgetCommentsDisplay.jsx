import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BudgetCommentsDisplay({ budget }) {
    if (!budget.footer_comments) return null;

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>Comentarios / Legales</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="whitespace-pre-line text-gray-700">{budget.footer_comments}</p>
            </CardContent>
        </Card>
    );
}
