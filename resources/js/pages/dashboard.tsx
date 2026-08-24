import { Head, Link } from '@inertiajs/react';
import { CalendarDays, Mail, Pencil, ShieldCheck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInitials } from '@/hooks/use-initials';
import { dashboard } from '@/routes';
import { edit as editAppearance } from '@/routes/appearance';
import { edit as editProfile } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import type { User } from '@/types';

export default function Dashboard({ user }: { user: User }) {
    const getInitials = useInitials();
    const firstName = user.name.split(' ')[0];

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6">
                <Card className="border-none bg-gradient-to-br from-primary/10 via-primary/5 to-transparent shadow-none">
                    <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <Avatar className="size-14">
                                <AvatarImage
                                    src={user.avatar ?? undefined}
                                    alt={user.name}
                                />
                                <AvatarFallback className="text-lg font-medium">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-xl font-semibold tracking-tight">
                                    Welcome back, {firstName}
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Here&apos;s a quick look at your account.
                                </p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href={editProfile()}>
                                <Pencil />
                                Edit profile
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Email
                            </CardTitle>
                            <Mail className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="space-y-1.5">
                            <p className="truncate text-sm font-medium">
                                {user.email}
                            </p>
                            <Badge
                                variant={
                                    user.email_verified_at
                                        ? 'default'
                                        : 'secondary'
                                }
                            >
                                {user.email_verified_at
                                    ? 'Verified'
                                    : 'Unverified'}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Two-factor authentication
                            </CardTitle>
                            <ShieldCheck className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <Badge
                                variant={
                                    user.two_factor_enabled
                                        ? 'default'
                                        : 'secondary'
                                }
                            >
                                {user.two_factor_enabled
                                    ? 'Enabled'
                                    : 'Disabled'}
                            </Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Member since
                            </CardTitle>
                            <CalendarDays className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm font-medium">
                                {new Date(user.created_at).toLocaleDateString(
                                    undefined,
                                    {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    },
                                )}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">
                            Quick actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href={editSecurity()}>Security settings</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={editAppearance()}>Appearance</Link>
                        </Button>
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
