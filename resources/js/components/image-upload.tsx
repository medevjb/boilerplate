import { ImageOff, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Props = {
    name: string;
    label: string;
    description?: string;
    defaultPreviewUrl?: string | null;
    accept?: Record<string, string[]>;
    maxSizeMb?: number;
    shape?: 'square' | 'wide';
    error?: string;
};

export function ImageUpload({
    name,
    label,
    description,
    defaultPreviewUrl = null,
    accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.svg'] },
    maxSizeMb = 2,
    shape = 'square',
    error,
}: Props) {
    const [preview, setPreview] = useState<string | null>(defaultPreviewUrl);
    const [removed, setRemoved] = useState(false);
    const objectUrlRef = useRef<string | null>(null);

    useEffect(
        () => () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        },
        [],
    );

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        if (!file) {
            return;
        }

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
        }

        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;
        setPreview(url);
        setRemoved(false);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize: maxSizeMb * 1024 * 1024,
        multiple: false,
    });

    const handleRemove = (event: React.MouseEvent) => {
        event.stopPropagation();

        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setPreview(null);
        setRemoved(true);
    };

    return (
        <div className="rounded-xl border p-5">
            <Label>{label}</Label>

            <div
                {...getRootProps()}
                className={cn(
                    'mt-3 flex cursor-pointer items-center gap-4 rounded-lg border border-dashed p-4 transition-colors',
                    isDragActive
                        ? 'border-primary bg-accent'
                        : 'border-input hover:bg-accent/50',
                )}
            >
                <input {...getInputProps({ name })} />

                <div
                    className={cn(
                        'flex shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted',
                        shape === 'square' ? 'size-16' : 'h-16 w-28',
                    )}
                >
                    {preview ? (
                        <img
                            src={preview}
                            alt=""
                            className="size-full object-contain"
                        />
                    ) : (
                        <ImageOff className="size-5 text-muted-foreground" />
                    )}
                </div>

                <div className="min-w-0 flex-1 text-sm">
                    <p className="flex items-center gap-1.5 font-medium">
                        <Upload className="size-3.5 text-muted-foreground" />
                        {isDragActive
                            ? 'Drop to upload'
                            : preview
                              ? 'Click or drag to replace'
                              : 'Click or drag to upload'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Up to {maxSizeMb}MB
                    </p>
                </div>

                {preview && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                    >
                        <X className="size-4" />
                    </Button>
                )}
            </div>

            {removed && (
                <input type="hidden" name={`remove_${name}`} value="1" />
            )}

            {description && (
                <p className="mt-2.5 text-xs text-muted-foreground">
                    {description}
                </p>
            )}
            <InputError message={error} className="mt-2.5" />
        </div>
    );
}
