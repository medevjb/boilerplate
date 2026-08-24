import { Form, Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Heading from '@/components/heading';
import { ImageUpload } from '@/components/image-upload';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import { confirmWarning } from '@/lib/swal';
import { dashboard } from '@/routes';
import { index } from '@/routes/admin/users';
import type { UserRole } from '@/types';

type ManagedUser = {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role: UserRole;
    is_admin: boolean;
    created_at: string;
};

function UserRow({ user, isSelf }: { user: ManagedUser; isSelf: boolean }) {
    const getInitials = useInitials();
    const [role, setRole] = useState<UserRole>(user.role);

    return (
        <tr className="border-t last:border-b-0">
            <td className="px-4 py-3">
                <Dialog>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            className="rounded-full transition-opacity hover:opacity-80"
                        >
                            <Avatar className="size-9">
                                <AvatarImage
                                    src={user.avatar ?? undefined}
                                    alt={user.name}
                                />
                                <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                    {getInitials(user.name)}
                                </AvatarFallback>
                            </Avatar>
                        </button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogTitle>Update avatar</DialogTitle>
                        <DialogDescription>
                            Upload a new avatar for {user.name}, or remove the
                            current one.
                        </DialogDescription>

                        <Form
                            {...UserController.updateAvatar.form(user.id)}
                            options={{ preserveScroll: true }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    <ImageUpload
                                        name="avatar"
                                        label="Avatar"
                                        defaultPreviewUrl={user.avatar}
                                        maxSizeMb={2}
                                        error={errors.avatar}
                                    />

                                    <DialogFooter className="mt-4 gap-2">
                                        <DialogClose asChild>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            Save
                                        </Button>
                                    </DialogFooter>
                                </>
                            )}
                        </Form>
                    </DialogContent>
                </Dialog>
            </td>
            <td className="px-4 py-3 font-medium">{user.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <Badge variant={user.is_admin ? 'default' : 'outline'}>
                        {user.role}
                    </Badge>
                    <Form
                        {...UserController.updateRole.form(user.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ submit }) => (
                            <Select
                                name="role"
                                value={role}
                                disabled={isSelf}
                                onValueChange={async (next: UserRole) => {
                                    const isDemotingAdmin =
                                        user.role === 'admin' &&
                                        next === 'user';

                                    if (isDemotingAdmin) {
                                        const confirmed = await confirmWarning({
                                            title: 'Remove admin access?',
                                            text: `${user.name} will lose access to the admin panel immediately.`,
                                            confirmText: 'Remove access',
                                        });

                                        if (!confirmed) {
                                            return;
                                        }
                                    }

                                    setRole(next);
                                    submit();
                                }}
                            >
                                <SelectTrigger size="sm" className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>
                        )}
                    </Form>
                </div>
            </td>
        </tr>
    );
}

export default function UsersIndex({ users }: { users: ManagedUser[] }) {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-6">
                <Heading
                    title="Users"
                    description="Manage user accounts and admin access"
                />

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3" />
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Email</th>
                                <th className="px-4 py-3 font-medium">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    isSelf={user.id === auth.user?.id}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Users', href: index() },
    ],
};
