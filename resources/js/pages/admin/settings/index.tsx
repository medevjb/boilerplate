import { Form, Head } from '@inertiajs/react';
import {
    Bell,
    Bot,
    BookOpen,
    Building2,
    CircleDollarSign,
    HardDrive,
    Settings2,
    ShieldCheck,
    Wrench,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import SettingController from '@/actions/App/Http/Controllers/Admin/SettingController';
import { FieldCard } from '@/components/field-card';
import Heading from '@/components/heading';
import { ImageUpload } from '@/components/image-upload';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { confirmWarning } from '@/lib/swal';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { edit } from '@/routes/admin/settings';

type Setting = {
    site_name: string;
    site_description: string | null;
    support_email: string | null;
    logo_url: string | null;
    favicon_url: string | null;
    default_language: string;
    timezone: string;
    date_format: string;
    items_per_page: number;
    company_name: string | null;
    company_email: string | null;
    company_phone: string | null;
    company_address: string | null;
    default_story_page_count: number;
    min_story_page_count: number;
    default_preview_page_count: number;
    default_age_min: number;
    default_age_max: number;
    default_illustration_style: string;
    min_pet_photos: number;
    max_pet_photos: number;
    story_ai_model: string;
    story_ai_fallback_model: string | null;
    image_ai_model: string;
    image_generation_concurrency: number;
    ai_max_retries: number;
    max_photo_size_mb: number;
    allowed_photo_mime_types: string;
    default_currency: string;
    free_page_revisions: number;
    notify_on_preview_ready: boolean;
    notify_on_payment_confirmed: boolean;
    notify_on_full_book_ready: boolean;
    notify_on_pdf_ready: boolean;
    registration_enabled: boolean;
    require_email_verification: boolean;
    maintenance_mode: boolean;
    maintenance_message: string | null;
};

type GroupId =
    | 'general'
    | 'company'
    | 'book'
    | 'ai'
    | 'storage'
    | 'billing'
    | 'notifications'
    | 'security'
    | 'maintenance';

const GROUPS: {
    id: GroupId;
    label: string;
    icon: LucideIcon;
    title: string;
    description: string;
}[] = [
    {
        id: 'general',
        label: 'General',
        icon: Settings2,
        title: 'General settings',
        description: 'Site identity and display preferences',
    },
    {
        id: 'company',
        label: 'Company',
        icon: Building2,
        title: 'Company details',
        description: 'Shown on customer emails, receipts and PDF footers',
    },
    {
        id: 'book',
        label: 'Book Defaults',
        icon: BookOpen,
        title: 'Book defaults',
        description: 'Default configuration for new storybooks',
    },
    {
        id: 'ai',
        label: 'AI & Generation',
        icon: Bot,
        title: 'AI & generation',
        description: 'Models and concurrency used to generate books',
    },
    {
        id: 'storage',
        label: 'Storage & Uploads',
        icon: HardDrive,
        title: 'Storage & uploads',
        description: 'Rules for pet reference photo uploads',
    },
    {
        id: 'billing',
        label: 'Billing',
        icon: CircleDollarSign,
        title: 'Billing',
        description: 'Currency and revision allowances',
    },
    {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell,
        title: 'Notifications',
        description: 'Customer emails sent during book generation',
    },
    {
        id: 'security',
        label: 'Security',
        icon: ShieldCheck,
        title: 'Security',
        description: 'Access controls for new and existing accounts',
    },
    {
        id: 'maintenance',
        label: 'Maintenance',
        icon: Wrench,
        title: 'Maintenance',
        description: 'Take the application offline for everyone but admins',
    },
];

const FIELD_GROUPS: Record<GroupId, string[]> = {
    general: [
        'site_name',
        'site_description',
        'support_email',
        'logo',
        'favicon',
        'default_language',
        'timezone',
        'date_format',
        'items_per_page',
    ],
    company: [
        'company_name',
        'company_email',
        'company_phone',
        'company_address',
    ],
    book: [
        'default_story_page_count',
        'min_story_page_count',
        'default_preview_page_count',
        'default_age_min',
        'default_age_max',
        'default_illustration_style',
        'min_pet_photos',
        'max_pet_photos',
    ],
    ai: [
        'story_ai_model',
        'story_ai_fallback_model',
        'image_ai_model',
        'image_generation_concurrency',
        'ai_max_retries',
    ],
    storage: ['max_photo_size_mb', 'allowed_photo_mime_types'],
    billing: ['default_currency', 'free_page_revisions'],
    notifications: [
        'notify_on_preview_ready',
        'notify_on_payment_confirmed',
        'notify_on_full_book_ready',
        'notify_on_pdf_ready',
    ],
    security: ['registration_enabled', 'require_email_verification'],
    maintenance: ['maintenance_mode', 'maintenance_message'],
};

function groupForField(field: string): GroupId | undefined {
    return (Object.keys(FIELD_GROUPS) as GroupId[]).find((group) =>
        FIELD_GROUPS[group].includes(field),
    );
}

const DATE_FORMATS = [
    { value: 'M j, Y', example: 'Dec 23, 2025' },
    { value: 'F j, Y', example: 'December 23, 2025' },
    { value: 'Y-m-d', example: '2025-12-23' },
    { value: 'd/m/Y', example: '23/12/2025' },
    { value: 'm/d/Y', example: '12/23/2025' },
];

function ToggleCard({
    id,
    label,
    description,
    defaultChecked,
    onCheckedChange,
}: {
    id: string;
    label: string;
    description?: string;
    defaultChecked: boolean;
    onCheckedChange?: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-6 rounded-xl border p-5">
            <div>
                <Label htmlFor={id}>{label}</Label>
                {description && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            {/* Unchecked checkboxes submit nothing, so this fallback
                ensures the field is always present for validation and
                persistence; the checkbox's own value overrides it when checked. */}
            <input type="hidden" name={id} value="0" />
            <Checkbox
                id={id}
                name={id}
                defaultChecked={defaultChecked}
                onCheckedChange={
                    onCheckedChange
                        ? (checked) => onCheckedChange(checked === true)
                        : undefined
                }
                className="mt-0.5"
            />
        </div>
    );
}

export default function SettingsIndex({ setting }: { setting: Setting }) {
    const [activeGroup, setActiveGroup] = useState<GroupId>('general');
    const [maintenanceMode, setMaintenanceMode] = useState(
        setting.maintenance_mode,
    );
    const active = GROUPS.find((group) => group.id === activeGroup)!;

    return (
        <>
            <Head title="System Settings" />
            <div className="flex flex-1 flex-col gap-8">
                <Heading
                    title="System settings"
                    description="Manage your application settings and preferences"
                />

                <Form
                    {...SettingController.update.form()}
                    options={{ preserveScroll: true }}
                    onError={(formErrors) => {
                        const firstField = Object.keys(formErrors)[0];
                        const groupId = firstField
                            ? groupForField(firstField)
                            : undefined;
                        const groupLabel = GROUPS.find(
                            (group) => group.id === groupId,
                        )?.label;

                        toast.error(
                            groupLabel
                                ? `Please fix the highlighted field under "${groupLabel}".`
                                : 'Please fix the highlighted fields before saving.',
                        );
                    }}
                    className="flex flex-col gap-8 lg:flex-row lg:items-start"
                >
                    {({ processing, errors, submit }) => (
                        <>
                            <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-60 lg:self-start">
                                <p className="mb-3 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    Settings groups
                                </p>
                                <nav className="flex flex-row gap-1.5 overflow-x-auto rounded-xl border bg-card p-2 shadow-sm lg:flex-col lg:overflow-visible">
                                    {GROUPS.map((group) => (
                                        <button
                                            key={group.id}
                                            type="button"
                                            onClick={() =>
                                                setActiveGroup(group.id)
                                            }
                                            className={cn(
                                                'flex items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-sm whitespace-nowrap transition-colors',
                                                activeGroup === group.id
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'hover:bg-accent hover:text-accent-foreground',
                                            )}
                                        >
                                            <group.icon className="size-4 shrink-0" />
                                            {group.label}
                                        </button>
                                    ))}
                                </nav>
                            </aside>

                            <div className="min-w-0 flex-1">
                                <div className="mb-6 flex items-center gap-3">
                                    <active.icon className="size-5 text-muted-foreground" />
                                    <div>
                                        <h3 className="font-medium">
                                            {active.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {active.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="max-w-2xl space-y-5">
                                    <div
                                        hidden={activeGroup !== 'general'}
                                        className="space-y-5"
                                    >
                                        <FieldCard
                                            htmlFor="site_name"
                                            label="Site name"
                                            error={errors.site_name}
                                        >
                                            <Input
                                                id="site_name"
                                                name="site_name"
                                                defaultValue={setting.site_name}
                                            />
                                        </FieldCard>

                                        <ImageUpload
                                            name="logo"
                                            label="Site logo"
                                            description="Shown in the sidebar and on auth pages. PNG, JPG, WEBP or SVG."
                                            defaultPreviewUrl={setting.logo_url}
                                            shape="wide"
                                            maxSizeMb={2}
                                            error={errors.logo}
                                        />

                                        <ImageUpload
                                            name="favicon"
                                            label="Favicon"
                                            description="Shown in the browser tab. PNG, ICO or SVG."
                                            defaultPreviewUrl={
                                                setting.favicon_url
                                            }
                                            accept={{
                                                'image/*': [
                                                    '.png',
                                                    '.jpg',
                                                    '.jpeg',
                                                    '.svg',
                                                    '.ico',
                                                ],
                                            }}
                                            maxSizeMb={0.5}
                                            error={errors.favicon}
                                        />

                                        <FieldCard
                                            htmlFor="site_description"
                                            label="Site description"
                                            error={errors.site_description}
                                        >
                                            <Textarea
                                                id="site_description"
                                                name="site_description"
                                                rows={3}
                                                defaultValue={
                                                    setting.site_description ??
                                                    ''
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="support_email"
                                            label="Support email"
                                            error={errors.support_email}
                                        >
                                            <Input
                                                id="support_email"
                                                name="support_email"
                                                type="email"
                                                defaultValue={
                                                    setting.support_email ?? ''
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="default_language"
                                            label="Default language"
                                            description="Default language for generated storybooks"
                                            error={errors.default_language}
                                        >
                                            <Input
                                                id="default_language"
                                                name="default_language"
                                                defaultValue={
                                                    setting.default_language
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="timezone"
                                            label="Timezone"
                                            description="PHP timezone identifier, e.g. UTC or America/New_York"
                                            error={errors.timezone}
                                        >
                                            <Input
                                                id="timezone"
                                                name="timezone"
                                                defaultValue={setting.timezone}
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="date_format"
                                            label="Date format"
                                            description="Default date format for displaying dates"
                                            error={errors.date_format}
                                        >
                                            <Select
                                                name="date_format"
                                                defaultValue={
                                                    setting.date_format
                                                }
                                            >
                                                <SelectTrigger
                                                    id="date_format"
                                                    className="w-full"
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DATE_FORMATS.map(
                                                        (format) => (
                                                            <SelectItem
                                                                key={
                                                                    format.value
                                                                }
                                                                value={
                                                                    format.value
                                                                }
                                                            >
                                                                {format.example}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="items_per_page"
                                            label="Items per page"
                                            description="Default number of items per page in tables"
                                            error={errors.items_per_page}
                                        >
                                            <Input
                                                id="items_per_page"
                                                name="items_per_page"
                                                type="number"
                                                defaultValue={
                                                    setting.items_per_page
                                                }
                                            />
                                        </FieldCard>
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'company'}
                                        className="space-y-5"
                                    >
                                        <FieldCard
                                            htmlFor="company_name"
                                            label="Company name"
                                            error={errors.company_name}
                                        >
                                            <Input
                                                id="company_name"
                                                name="company_name"
                                                defaultValue={
                                                    setting.company_name ?? ''
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="company_email"
                                            label="Company email"
                                            error={errors.company_email}
                                        >
                                            <Input
                                                id="company_email"
                                                name="company_email"
                                                type="email"
                                                defaultValue={
                                                    setting.company_email ?? ''
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="company_phone"
                                            label="Company phone"
                                            error={errors.company_phone}
                                        >
                                            <Input
                                                id="company_phone"
                                                name="company_phone"
                                                defaultValue={
                                                    setting.company_phone ?? ''
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="company_address"
                                            label="Company address"
                                            error={errors.company_address}
                                        >
                                            <Textarea
                                                id="company_address"
                                                name="company_address"
                                                rows={2}
                                                defaultValue={
                                                    setting.company_address ??
                                                    ''
                                                }
                                            />
                                        </FieldCard>
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'book'}
                                        className="space-y-5"
                                    >
                                        <FieldCard
                                            htmlFor="default_story_page_count"
                                            label="Default story page count"
                                            description="Number of story pages generated for a new book"
                                            error={
                                                errors.default_story_page_count
                                            }
                                        >
                                            <Input
                                                id="default_story_page_count"
                                                name="default_story_page_count"
                                                type="number"
                                                defaultValue={
                                                    setting.default_story_page_count
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="min_story_page_count"
                                            label="Minimum story page count"
                                            description="Books must contain at least this many pages"
                                            error={errors.min_story_page_count}
                                        >
                                            <Input
                                                id="min_story_page_count"
                                                name="min_story_page_count"
                                                type="number"
                                                defaultValue={
                                                    setting.min_story_page_count
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="default_preview_page_count"
                                            label="Preview page count"
                                            description="Pages illustrated before payment"
                                            error={
                                                errors.default_preview_page_count
                                            }
                                        >
                                            <Input
                                                id="default_preview_page_count"
                                                name="default_preview_page_count"
                                                type="number"
                                                defaultValue={
                                                    setting.default_preview_page_count
                                                }
                                            />
                                        </FieldCard>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FieldCard
                                                htmlFor="default_age_min"
                                                label="Default min age"
                                                error={errors.default_age_min}
                                            >
                                                <Input
                                                    id="default_age_min"
                                                    name="default_age_min"
                                                    type="number"
                                                    defaultValue={
                                                        setting.default_age_min
                                                    }
                                                />
                                            </FieldCard>

                                            <FieldCard
                                                htmlFor="default_age_max"
                                                label="Default max age"
                                                error={errors.default_age_max}
                                            >
                                                <Input
                                                    id="default_age_max"
                                                    name="default_age_max"
                                                    type="number"
                                                    defaultValue={
                                                        setting.default_age_max
                                                    }
                                                />
                                            </FieldCard>
                                        </div>

                                        <FieldCard
                                            htmlFor="default_illustration_style"
                                            label="Default illustration style"
                                            error={
                                                errors.default_illustration_style
                                            }
                                        >
                                            <Input
                                                id="default_illustration_style"
                                                name="default_illustration_style"
                                                defaultValue={
                                                    setting.default_illustration_style
                                                }
                                            />
                                        </FieldCard>

                                        <div className="grid grid-cols-2 gap-4">
                                            <FieldCard
                                                htmlFor="min_pet_photos"
                                                label="Minimum pet photos"
                                                error={errors.min_pet_photos}
                                            >
                                                <Input
                                                    id="min_pet_photos"
                                                    name="min_pet_photos"
                                                    type="number"
                                                    defaultValue={
                                                        setting.min_pet_photos
                                                    }
                                                />
                                            </FieldCard>

                                            <FieldCard
                                                htmlFor="max_pet_photos"
                                                label="Maximum pet photos"
                                                error={errors.max_pet_photos}
                                            >
                                                <Input
                                                    id="max_pet_photos"
                                                    name="max_pet_photos"
                                                    type="number"
                                                    defaultValue={
                                                        setting.max_pet_photos
                                                    }
                                                />
                                            </FieldCard>
                                        </div>
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'ai'}
                                        className="space-y-5"
                                    >
                                        <FieldCard
                                            htmlFor="story_ai_model"
                                            label="Story AI model"
                                            description="Primary OpenAI model used for the story blueprint"
                                            error={errors.story_ai_model}
                                        >
                                            <Input
                                                id="story_ai_model"
                                                name="story_ai_model"
                                                defaultValue={
                                                    setting.story_ai_model
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="story_ai_fallback_model"
                                            label="Story AI fallback model"
                                            description="Used automatically if the primary model fails"
                                            error={
                                                errors.story_ai_fallback_model
                                            }
                                        >
                                            <Input
                                                id="story_ai_fallback_model"
                                                name="story_ai_fallback_model"
                                                defaultValue={
                                                    setting.story_ai_fallback_model ??
                                                    ''
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="image_ai_model"
                                            label="Image AI model"
                                            description="Model used to generate page illustrations"
                                            error={errors.image_ai_model}
                                        >
                                            <Input
                                                id="image_ai_model"
                                                name="image_ai_model"
                                                defaultValue={
                                                    setting.image_ai_model
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="image_generation_concurrency"
                                            label="Image generation concurrency"
                                            description="How many page illustrations may render at once"
                                            error={
                                                errors.image_generation_concurrency
                                            }
                                        >
                                            <Input
                                                id="image_generation_concurrency"
                                                name="image_generation_concurrency"
                                                type="number"
                                                defaultValue={
                                                    setting.image_generation_concurrency
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="ai_max_retries"
                                            label="Max retries"
                                            description="Retry attempts for a failed AI job before it is marked failed"
                                            error={errors.ai_max_retries}
                                        >
                                            <Input
                                                id="ai_max_retries"
                                                name="ai_max_retries"
                                                type="number"
                                                defaultValue={
                                                    setting.ai_max_retries
                                                }
                                            />
                                        </FieldCard>
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'storage'}
                                        className="space-y-5"
                                    >
                                        <FieldCard
                                            htmlFor="max_photo_size_mb"
                                            label="Max photo size"
                                            description="Maximum upload size for a single pet reference photo"
                                            error={errors.max_photo_size_mb}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    id="max_photo_size_mb"
                                                    name="max_photo_size_mb"
                                                    type="number"
                                                    defaultValue={
                                                        setting.max_photo_size_mb
                                                    }
                                                />
                                                <span className="text-sm text-muted-foreground">
                                                    MB
                                                </span>
                                            </div>
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="allowed_photo_mime_types"
                                            label="Allowed photo types"
                                            description="Comma-separated MIME types accepted for pet photo uploads"
                                            error={
                                                errors.allowed_photo_mime_types
                                            }
                                        >
                                            <Input
                                                id="allowed_photo_mime_types"
                                                name="allowed_photo_mime_types"
                                                defaultValue={
                                                    setting.allowed_photo_mime_types
                                                }
                                            />
                                        </FieldCard>
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'billing'}
                                        className="space-y-5"
                                    >
                                        <FieldCard
                                            htmlFor="default_currency"
                                            label="Default currency"
                                            description="3-letter ISO currency code, e.g. USD"
                                            error={errors.default_currency}
                                        >
                                            <Input
                                                id="default_currency"
                                                name="default_currency"
                                                className="uppercase"
                                                defaultValue={
                                                    setting.default_currency
                                                }
                                            />
                                        </FieldCard>

                                        <FieldCard
                                            htmlFor="free_page_revisions"
                                            label="Free page revisions"
                                            description="Free revisions included per purchased book before charging"
                                            error={errors.free_page_revisions}
                                        >
                                            <Input
                                                id="free_page_revisions"
                                                name="free_page_revisions"
                                                type="number"
                                                defaultValue={
                                                    setting.free_page_revisions
                                                }
                                            />
                                        </FieldCard>
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'notifications'}
                                        className="space-y-5"
                                    >
                                        <ToggleCard
                                            id="notify_on_preview_ready"
                                            label="Preview ready"
                                            description="Email the customer when their 3-page preview finishes"
                                            defaultChecked={
                                                setting.notify_on_preview_ready
                                            }
                                        />
                                        <ToggleCard
                                            id="notify_on_payment_confirmed"
                                            label="Payment confirmed"
                                            description="Email the customer once payment is verified"
                                            defaultChecked={
                                                setting.notify_on_payment_confirmed
                                            }
                                        />
                                        <ToggleCard
                                            id="notify_on_full_book_ready"
                                            label="Full book ready"
                                            description="Email the customer when every purchased page is illustrated"
                                            defaultChecked={
                                                setting.notify_on_full_book_ready
                                            }
                                        />
                                        <ToggleCard
                                            id="notify_on_pdf_ready"
                                            label="PDF ready"
                                            description="Email the customer when their PDF download is ready"
                                            defaultChecked={
                                                setting.notify_on_pdf_ready
                                            }
                                        />
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'security'}
                                        className="space-y-5"
                                    >
                                        <ToggleCard
                                            id="registration_enabled"
                                            label="Allow new user registration"
                                            description="Turn off to close public sign-ups"
                                            defaultChecked={
                                                setting.registration_enabled
                                            }
                                        />
                                        <ToggleCard
                                            id="require_email_verification"
                                            label="Require email verification"
                                            description="Customers must verify their email before purchasing"
                                            defaultChecked={
                                                setting.require_email_verification
                                            }
                                        />
                                    </div>

                                    <div
                                        hidden={activeGroup !== 'maintenance'}
                                        className="space-y-5"
                                    >
                                        <ToggleCard
                                            id="maintenance_mode"
                                            label="Maintenance mode"
                                            description="Only admins can access the application while enabled"
                                            defaultChecked={
                                                setting.maintenance_mode
                                            }
                                            onCheckedChange={setMaintenanceMode}
                                        />

                                        <FieldCard
                                            htmlFor="maintenance_message"
                                            label="Maintenance message"
                                            description="Shown to visitors while maintenance mode is on"
                                            error={errors.maintenance_message}
                                        >
                                            <Textarea
                                                id="maintenance_message"
                                                name="maintenance_message"
                                                rows={2}
                                                defaultValue={
                                                    setting.maintenance_message ??
                                                    ''
                                                }
                                            />
                                        </FieldCard>
                                    </div>
                                </div>

                                <div className="mt-8 flex items-center gap-4 border-t pt-6">
                                    <Button
                                        type="button"
                                        disabled={processing}
                                        onClick={async () => {
                                            const enablingMaintenance =
                                                maintenanceMode &&
                                                !setting.maintenance_mode;

                                            if (enablingMaintenance) {
                                                const confirmed =
                                                    await confirmWarning({
                                                        title: 'Enable maintenance mode?',
                                                        text: 'Only admins will be able to access the application until you turn this back off.',
                                                        confirmText:
                                                            'Enable maintenance mode',
                                                    });

                                                if (!confirmed) {
                                                    return;
                                                }
                                            }

                                            submit();
                                        }}
                                    >
                                        Save settings
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

SettingsIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Settings', href: edit() },
    ],
};
