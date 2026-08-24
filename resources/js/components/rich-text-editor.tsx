import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    Quote,
    Redo2,
    Strikethrough,
    Undo2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { promptUrl } from '@/lib/swal';
import { cn } from '@/lib/utils';

type Props = {
    name: string;
    defaultValue?: string | null;
    placeholder?: string;
};

function ToolbarButton({
    active,
    ...props
}: React.ComponentProps<typeof Button> & { active?: boolean }) {
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
                'size-7',
                active && 'bg-accent text-accent-foreground',
            )}
            {...props}
        />
    );
}

export function RichTextEditor({
    name,
    defaultValue = '',
    placeholder = 'Write the page content…',
}: Props) {
    const [html, setHtml] = useState(defaultValue ?? '');

    const editor = useEditor({
        // Tiptap warns/errors under SSR unless this is explicitly false.
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            Placeholder.configure({ placeholder }),
        ],
        content: defaultValue ?? '',
        editorProps: {
            attributes: {
                class: cn(
                    'min-h-[220px] px-3 py-2.5 text-sm focus:outline-none',
                    '[&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-lg [&_h2]:font-semibold',
                    '[&_h3]:mt-3 [&_h3]:mb-1 [&_h3]:text-base [&_h3]:font-semibold',
                    '[&_p]:my-1.5',
                    '[&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-5',
                    '[&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-5',
                    '[&_blockquote]:my-1.5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground',
                    '[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2',
                    '[&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
                ),
            },
        },
        onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    });

    useEffect(() => {
        return () => editor?.destroy();
    }, [editor]);

    if (!editor) {
        return (
            <div className="min-h-[260px] rounded-md border border-input bg-transparent" />
        );
    }

    const setLink = async () => {
        const previousUrl = editor.getAttributes('link').href as
            string | undefined;
        const url = await promptUrl({
            title: 'Add link',
            inputValue: previousUrl ?? '',
        });

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();

            return;
        }

        editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href: url })
            .run();
    };

    return (
        <div className="rounded-md border border-input shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50">
            <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5">
                <ToolbarButton
                    active={editor.isActive('bold')}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('italic')}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('strike')}
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                >
                    <Strikethrough />
                </ToolbarButton>

                <div className="mx-1 h-5 w-px bg-border" />

                <ToolbarButton
                    active={editor.isActive('heading', { level: 2 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                >
                    <Heading2 />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('heading', { level: 3 })}
                    onClick={() =>
                        editor.chain().focus().toggleHeading({ level: 3 }).run()
                    }
                >
                    <Heading3 />
                </ToolbarButton>

                <div className="mx-1 h-5 w-px bg-border" />

                <ToolbarButton
                    active={editor.isActive('bulletList')}
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                >
                    <List />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('orderedList')}
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                >
                    <ListOrdered />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('blockquote')}
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                >
                    <Quote />
                </ToolbarButton>
                <ToolbarButton
                    active={editor.isActive('link')}
                    onClick={setLink}
                >
                    <Link2 />
                </ToolbarButton>

                <div className="mx-1 h-5 w-px bg-border" />

                <ToolbarButton
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                >
                    <Undo2 />
                </ToolbarButton>
                <ToolbarButton
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                >
                    <Redo2 />
                </ToolbarButton>
            </div>

            <EditorContent editor={editor} />
            <input type="hidden" name={name} value={html} readOnly />
        </div>
    );
}
