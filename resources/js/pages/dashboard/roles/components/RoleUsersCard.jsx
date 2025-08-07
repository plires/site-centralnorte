import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User2 } from 'lucide-react';

export default function RoleUsersCard({ users }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <User2 className="mr-2 h-5 w-5" />
                    Usuarios con este rol
                </CardTitle>
                <CardDescription>Listado de usuarios asignados</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
                {users.length > 0 ? (
                    users.map((user) => (
                        <div key={user.id} className="text-sm text-gray-900">
                            {user.name} <span className="text-gray-500">({user.email})</span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-500">No hay usuarios asignados a este rol.</p>
                )}
            </CardContent>
        </Card>
    );
}
