import { Form, Head, Link } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import PageController from '@/actions/App/Http/Controllers/Admin/PageController';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { confirmWarning } from '@/lib/swal';
import { dashboard } from '@/routes';
import { create, edit, index } from '@/routes/admin/pages';

type Page = {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    updated_at: string;
};

function PageRow({ page }: { page: Page }) {
    const [isPublished, setIsPublished] = useState(page.is_published);

    return (
        <tr className="border-t last:border-b-0">
            <td className="px-4 py-3 font-medium">{page.title}</td>
            <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
            <td className="px-4 py-3">
                <Form
                    {...PageController.togglePublish.form(page.id)}
                    options={{ preserveScroll: true }}
                >
                    {({ submit }) => (
                        <label className="flex w-fit items-center gap-2">
                            <Switch
                                checked={isPublished}
                                onCheckedChange={async (checked) => {
                                    const confirmed = await confirmWarning({
                                        title: checked
                                            ? 'Publish this page?'
                                            : 'Unpublish this page?',
                                        text: checked
                                            ? `"${page.title}" will become visible to visitors.`
                                            : `"${page.title}" will no longer be visible to visitors.`,
                                        confirmText: checked
                                            ? 'Publish'
                                            : 'Unpublish',
                                        icon: 'question',
                                        destructive: !checked,
                                    });

                                    if (!confirmed) {
                                        return;
                                    }

                                    setIsPublished(checked);
                                    submit();
                                }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {isPublished ? 'Published' : 'Draft'}
                            </span>
                        </label>
                    )}
                </Form>
            </td>
            <td className="px-4 py-3 text-muted-foreground">
                {new Date(page.updated_at).toLocaleDateString()}
            </td>
            <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={edit(page.id)} prefetch>
                            <Pencil />
                        </Link>
                    </Button>
                    <Form
                        {...PageController.destroy.form(page.id)}
                        options={{ preserveScroll: true }}
                    >
                        {({ processing, submit }) => (
                            <Button
                                variant="ghost"
                                size="icon"
                                type="button"
                                disabled={processing}
                                className="text-destructive hover:text-destructive"
                                onClick={async () => {
                                    const confirmed = await confirmWarning({
                                        title: 'Delete this page?',
                                        text: `"${page.title}" will be permanently removed. This cannot be undone.`,
                                        confirmText: 'Delete',
                                    });

                                    if (confirmed) {
                                        submit();
                                    }
                                }}
                            >
                                <Trash2 />
                            </Button>
                        )}
                    </Form>
                </div>
            </td>
        </tr>
    );
}

export default function PagesIndex({ pages }: { pages: Page[] }) {
    return (
        <>
            <Head title="Pages" />
            <div className="flex flex-1 flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Heading
                        title="Pages"
                        description="Manage dynamic content pages shown on the site"
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus />
                            New page
                        </Link>
                    </Button>
                </div>

                <div className="overflow-hidden rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Title</th>
                                <th className="px-4 py-3 font-medium">Slug</th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Updated
                                </th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {pages.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-8 text-center text-muted-foreground"
                                    >
                                        No pages yet. Create your first page.
                                    </td>
                                </tr>
                            )}
                            {pages.map((page) => (
                                <PageRow key={page.id} page={page} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

PagesIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pages', href: index() },
    ],
};
