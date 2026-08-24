<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Appends;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;

/**
 * @property int $id
 * @property string $site_name
 * @property string|null $site_description
 * @property string|null $support_email
 * @property string|null $logo_path
 * @property string|null $favicon_path
 * @property-read string|null $logo_url
 * @property-read string|null $favicon_url
 * @property string $default_language
 * @property string $timezone
 * @property string $date_format
 * @property int $items_per_page
 * @property string|null $company_name
 * @property string|null $company_email
 * @property string|null $company_phone
 * @property string|null $company_address
 * @property int $default_story_page_count
 * @property int $min_story_page_count
 * @property int $default_preview_page_count
 * @property int $default_age_min
 * @property int $default_age_max
 * @property string $default_illustration_style
 * @property int $min_pet_photos
 * @property int $max_pet_photos
 * @property string $story_ai_model
 * @property string|null $story_ai_fallback_model
 * @property string $image_ai_model
 * @property int $image_generation_concurrency
 * @property int $ai_max_retries
 * @property int $max_photo_size_mb
 * @property string $allowed_photo_mime_types
 * @property string $default_currency
 * @property int $free_page_revisions
 * @property bool $notify_on_preview_ready
 * @property bool $notify_on_payment_confirmed
 * @property bool $notify_on_full_book_ready
 * @property bool $notify_on_pdf_ready
 * @property bool $registration_enabled
 * @property bool $require_email_verification
 * @property bool $maintenance_mode
 * @property string|null $maintenance_message
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'site_name', 'site_description', 'support_email', 'logo_path', 'favicon_path', 'default_language', 'timezone', 'date_format', 'items_per_page',
    'company_name', 'company_email', 'company_phone', 'company_address',
    'default_story_page_count', 'min_story_page_count', 'default_preview_page_count',
    'default_age_min', 'default_age_max', 'default_illustration_style', 'min_pet_photos', 'max_pet_photos',
    'story_ai_model', 'story_ai_fallback_model', 'image_ai_model', 'image_generation_concurrency', 'ai_max_retries',
    'max_photo_size_mb', 'allowed_photo_mime_types',
    'default_currency', 'free_page_revisions',
    'notify_on_preview_ready', 'notify_on_payment_confirmed', 'notify_on_full_book_ready', 'notify_on_pdf_ready',
    'registration_enabled', 'require_email_verification',
    'maintenance_mode', 'maintenance_message',
])]
#[Appends(['logo_url', 'favicon_url'])]
class Setting extends Model
{
    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'items_per_page' => 'integer',
            'default_story_page_count' => 'integer',
            'min_story_page_count' => 'integer',
            'default_preview_page_count' => 'integer',
            'default_age_min' => 'integer',
            'default_age_max' => 'integer',
            'min_pet_photos' => 'integer',
            'max_pet_photos' => 'integer',
            'image_generation_concurrency' => 'integer',
            'ai_max_retries' => 'integer',
            'max_photo_size_mb' => 'integer',
            'free_page_revisions' => 'integer',
            'notify_on_preview_ready' => 'boolean',
            'notify_on_payment_confirmed' => 'boolean',
            'notify_on_full_book_ready' => 'boolean',
            'notify_on_pdf_ready' => 'boolean',
            'registration_enabled' => 'boolean',
            'require_email_verification' => 'boolean',
            'maintenance_mode' => 'boolean',
        ];
    }

    /**
     * Get the single settings record, creating it with defaults if missing.
     */
    public static function instance(): self
    {
        return static::query()->firstOrCreate(['id' => 1]);
    }

    /**
     * Get the public URL for the uploaded logo, if any.
     *
     * @return Attribute<string|null, never>
     */
    protected function logoUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->logo_path ? Storage::disk('public')->url($this->logo_path) : null,
        );
    }

    /**
     * Get the public URL for the uploaded favicon, if any.
     *
     * @return Attribute<string|null, never>
     */
    protected function faviconUrl(): Attribute
    {
        return Attribute::make(
            get: fn (): ?string => $this->favicon_path ? Storage::disk('public')->url($this->favicon_path) : null,
        );
    }

    /**
     * Get the allowed pet photo MIME types as a list.
     *
     * @return list<string>
     */
    public function allowedPhotoMimeTypesList(): array
    {
        return array_values(array_filter(array_map('trim', explode(',', $this->allowed_photo_mime_types))));
    }
}
