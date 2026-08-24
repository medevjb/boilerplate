<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class SettingUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // General
            'site_name' => ['required', 'string', 'max:255'],
            'site_description' => ['nullable', 'string', 'max:1000'],
            'support_email' => ['nullable', 'email', 'max:255'],
            'logo' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,svg', 'max:2048'],
            'remove_logo' => ['sometimes', 'boolean'],
            'favicon' => ['nullable', 'file', 'mimes:png,jpg,jpeg,ico,svg', 'max:512'],
            'remove_favicon' => ['sometimes', 'boolean'],
            'default_language' => ['required', 'string', 'max:10'],
            'timezone' => ['required', 'string', 'max:64', 'timezone'],
            'date_format' => ['required', 'string', 'max:30'],
            'items_per_page' => ['required', 'integer', 'min:5', 'max:100'],

            // Company
            'company_name' => ['nullable', 'string', 'max:255'],
            'company_email' => ['nullable', 'email', 'max:255'],
            'company_phone' => ['nullable', 'string', 'max:30'],
            'company_address' => ['nullable', 'string', 'max:500'],

            // Book defaults
            'default_story_page_count' => ['required', 'integer', 'min:1', 'max:200'],
            'min_story_page_count' => ['required', 'integer', 'min:1', 'max:200'],
            'default_preview_page_count' => ['required', 'integer', 'min:1', 'max:200'],
            'default_age_min' => ['required', 'integer', 'min:0', 'max:18'],
            'default_age_max' => ['required', 'integer', 'min:0', 'max:18', 'gte:default_age_min'],
            'default_illustration_style' => ['required', 'string', 'max:100'],
            'min_pet_photos' => ['required', 'integer', 'min:1', 'max:20'],
            'max_pet_photos' => ['required', 'integer', 'min:1', 'max:20', 'gte:min_pet_photos'],

            // AI & generation
            'story_ai_model' => ['required', 'string', 'max:100'],
            'story_ai_fallback_model' => ['nullable', 'string', 'max:100'],
            'image_ai_model' => ['required', 'string', 'max:100'],
            'image_generation_concurrency' => ['required', 'integer', 'min:1', 'max:20'],
            'ai_max_retries' => ['required', 'integer', 'min:0', 'max:10'],

            // Storage & uploads
            'max_photo_size_mb' => ['required', 'integer', 'min:1', 'max:100'],
            'allowed_photo_mime_types' => ['required', 'string', 'max:255'],

            // Billing
            'default_currency' => ['required', 'string', 'size:3'],
            'free_page_revisions' => ['required', 'integer', 'min:0', 'max:20'],

            // Notifications
            'notify_on_preview_ready' => ['boolean'],
            'notify_on_payment_confirmed' => ['boolean'],
            'notify_on_full_book_ready' => ['boolean'],
            'notify_on_pdf_ready' => ['boolean'],

            // Security
            'registration_enabled' => ['boolean'],
            'require_email_verification' => ['boolean'],

            // Maintenance
            'maintenance_mode' => ['boolean'],
            'maintenance_message' => ['nullable', 'string', 'max:500'],
        ];
    }
}
