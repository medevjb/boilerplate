import { Form, Head, Link } from '@inertiajs/react';
import PageController from '@/actions/App/Http/Controllers/Admin/PageController';
import { FieldCard } from '@/components/field-card';
import Heading from '@/components/heading';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { edit, index } from '@/routes/admin/pages';

type Page = {
    id: number;
    title: string;
    slug: string;
    content: string | null;
    meta_description: string | null;
    is_published: boolean;
};

export default function PageEdit({ page }: { page: Page }) {
    return (
        <>
            <Head title={`Edit ${page.title}`} />
            <div className="flex flex-1 flex-col gap-6">
                <Heading
                    title="Edit page"
                    description="Update this dynamic content page"
                />

                <Form
                    {...PageController.update.form(page.id)}
                    className="max-w-2xl space-y-5"
                >
                    {({ processing, errors }) => (
                        <>
                            <FieldCard
                                htmlFor="title"
                                label="Title"
                                error={errors.title}
                            >
                                <Input
                                    id="title"
                                    name="title"
                                    required
                                    autoFocus
                                    defaultValue={page.title}
                                />
                            </FieldCard>

                            <FieldCard
                                htmlFor="slug"
                                label="Slug"
                                description="Changing this will change the page's URL."
                                error={errors.slug}
                            >
                                <div className="flex items-center gap-1">
                                    <span className="text-sm text-muted-foreground">
                                        /
                                    </span>
                                    <Input
                                        id="slug"
                                        name="slug"
                                        required
                                        defaultValue={page.slug}
                                    />
                                </div>
                            </FieldCard>

                            <FieldCard
                                htmlFor="content"
                                label="Content"
                                error={errors.content}
                            >
                                <RichTextEditor
                                    name="content"
                                    defaultValue={page.content}
                                />
                            </FieldCard>

                            <FieldCard
                                htmlFor="meta_description"
                                label="Meta description"
                                description="Shown in search engine results."
                                error={errors.meta_description}
                            >
                                <Input
                                    id="meta_description"
                                    name="meta_description"
                                    defaultValue={page.meta_description ?? ''}
                                />
                            </FieldCard>

                            <div className="flex items-start justify-between gap-6 rounded-xl border p-5">
                                <div>
                                    <Label htmlFor="is_published">
                                        Published
                                    </Label>
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Visible to visitors while enabled.
                                    </p>
                                </div>
                                <input
                                    type="hidden"
                                    name="is_published"
                                    value="0"
                                />
                                <Checkbox
                                    id="is_published"
                                    name="is_published"
                                    defaultChecked={page.is_published}
                                    className="mt-0.5"
                                />
                            </div>

                            <div className="flex items-center gap-3 border-t pt-6">
                                <Button disabled={processing}>
                                    Save changes
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link href={index()}>Cancel</Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

PageEdit.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pages', href: index() },
        { title: 'Edit page', href: edit(0) },
    ],
};
