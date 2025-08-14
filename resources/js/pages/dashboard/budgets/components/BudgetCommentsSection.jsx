import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function BudgetCommentsSection({ data, setData }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Comentarios</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    placeholder="Comentarios adicionales para el pie del presupuesto..."
                    value={data.footer_comments}
                    onChange={(e) => setData('footer_comments', e.target.value)}
                    rows={4}
                />
            </CardContent>
        </Card>
    );
}
