import { Head } from '@inertiajs/react';
import { FileCheck2, FileText, ShieldCheck, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboard } from '@/routes';

type Stats = {
    total_users: number;
    total_admins: number;
    total_pages: number;
    published_pages: number;
    registration_enabled: boolean;
};

export default function Dashboard({ stats }: { stats: Stats }) {
    const cards = [
        {
            title: 'Total users',
            value: stats.total_users,
            icon: Users,
        },
        {
            title: 'Admins',
            value: stats.total_admins,
            icon: ShieldCheck,
        },
        {
            title: 'Total pages',
            value: stats.total_pages,
            icon: FileText,
        },
        {
            title: 'Published pages',
            value: stats.published_pages,
            icon: FileCheck2,
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl">
                <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {cards.map((card) => (
                        <Card key={card.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <card.icon className="size-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {card.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Registration</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            New account registration is currently{' '}
                            <span
                                className={
                                    stats.registration_enabled
                                        ? 'font-medium text-foreground'
                                        : 'font-medium text-destructive'
                                }
                            >
                                {stats.registration_enabled
                                    ? 'enabled'
                                    : 'disabled'}
                            </span>
                            . You can change this under System Settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
