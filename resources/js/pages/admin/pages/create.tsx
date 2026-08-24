import { Form, Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import PageController from '@/actions/App/Http/Controllers/Admin/PageController';
import { FieldCard } from '@/components/field-card';
import Heading from '@/components/heading';
import { RichTextEditor } from '@/components/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';
import { create, index } from '@/routes/admin/pages';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export default function PageCreate() {
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [slugEdited, setSlugEdited] = useState(false);

    return (
        <>
            <Head title="New page" />
            <div className="flex flex-1 flex-col gap-6">
                <Heading
                    title="New page"
                    description="Create a new dynamic content page"
                />

                <Form
                    {...PageController.store.form()}
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
                                    placeholder="About us"
                                    value={title}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setTitle(value);

                                        if (!slugEdited) {
                                            setSlug(slugify(value));
                                        }
                                    }}
                                />
                            </FieldCard>

                            <FieldCard
                                htmlFor="slug"
                                label="Slug"
                                description="Auto-generated from the title — edit it to customize."
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
                                        placeholder="about-us"
                                        value={slug}
                                        onChange={(e) => {
                                            setSlugEdited(true);
                                            setSlug(e.target.value);
                                        }}
                                    />
                                </div>
                            </FieldCard>

                            <FieldCard
                                htmlFor="content"
                                label="Content"
                                error={errors.content}
                            >
                                <RichTextEditor name="content" />
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
                                    placeholder="Shown in search results"
                                />
                            </FieldCard>

                            <div className="flex items-start justify-between gap-6 rounded-xl border p-5">
                                <div>
                                    <Label htmlFor="is_published">
                                        Published
                                    </Label>
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Visible to visitors as soon as it's
                                        created.
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
                                    defaultChecked
                                    className="mt-0.5"
                                />
                            </div>

                            <div className="flex items-center gap-3 border-t pt-6">
                                <Button disabled={processing}>
                                    Create page
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

PageCreate.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Pages', href: index() },
        { title: 'New page', href: create() },
    ],
};
