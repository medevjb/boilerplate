import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';

type Props = {
    htmlFor: string;
    label: string;
    description?: string;
    error?: string;
    children: ReactNode;
};

export function FieldCard({
    htmlFor,
    label,
    description,
    error,
    children,
}: Props) {
    return (
        <div className="rounded-xl border p-5">
            <Label htmlFor={htmlFor}>{label}</Label>
            <div className="mt-3">{children}</div>
            {description && (
                <p className="mt-2.5 text-xs text-muted-foreground">
                    {description}
                </p>
            )}
            <InputError message={error} className="mt-2.5" />
        </div>
    );
}
