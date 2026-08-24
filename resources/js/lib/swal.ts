import Swal from 'sweetalert2';
import type { SweetAlertIcon } from 'sweetalert2';

const BUTTON_BASE =
    'inline-flex h-8 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium whitespace-nowrap shadow-xs transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

const DESTRUCTIVE_BUTTON = `${BUTTON_BASE} bg-destructive text-white hover:bg-destructive/90`;
const PRIMARY_BUTTON = `${BUTTON_BASE} bg-primary text-primary-foreground hover:bg-primary/90`;
const SECONDARY_BUTTON = `${BUTTON_BASE} bg-secondary text-secondary-foreground hover:bg-secondary/80`;

// Created lazily (never at module scope) so importing this module has no
// side effects during Inertia's SSR pre-render, which has no `document`.
function themedSwal() {
    return Swal.mixin({
        buttonsStyling: false,
        reverseButtons: true,
    });
}

type ConfirmOptions = {
    title: string;
    text?: string;
    confirmText?: string;
    cancelText?: string;
    icon?: SweetAlertIcon;
    destructive?: boolean;
};

/**
 * Show a themed, dark-mode aware warning confirmation before a risky action.
 * Resolves to `true` only when the user confirms.
 */
export async function confirmWarning({
    title,
    text,
    confirmText = 'Continue',
    cancelText = 'Cancel',
    icon = 'warning',
    destructive = true,
}: ConfirmOptions): Promise<boolean> {
    const result = await themedSwal().fire({
        icon,
        title,
        text,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        focusCancel: destructive,
        customClass: {
            confirmButton: destructive ? DESTRUCTIVE_BUTTON : PRIMARY_BUTTON,
            cancelButton: SECONDARY_BUTTON,
        },
    });

    return result.isConfirmed;
}

type PromptUrlOptions = {
    title: string;
    inputValue?: string;
    confirmText?: string;
};

/**
 * Ask for a URL via a themed input dialog. Resolves to the entered URL, or
 * `null` if the user cancelled or left it empty.
 */
export async function promptUrl({
    title,
    inputValue = '',
    confirmText = 'Add link',
}: PromptUrlOptions): Promise<string | null> {
    const result = await themedSwal().fire({
        title,
        input: 'url',
        inputValue,
        inputPlaceholder: 'https://example.com',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        customClass: {
            confirmButton: PRIMARY_BUTTON,
            cancelButton: SECONDARY_BUTTON,
        },
    });

    if (!result.isConfirmed || !result.value) {
        return null;
    }

    return result.value;
}
