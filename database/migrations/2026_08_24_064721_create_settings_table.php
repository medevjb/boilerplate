<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();

            // General
            $table->string('site_name')->default(config('app.name'));
            $table->text('site_description')->nullable();
            $table->string('support_email')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('default_language')->default('en');
            $table->string('timezone')->default('UTC');
            $table->string('date_format')->default('M j, Y');
            $table->unsignedInteger('items_per_page')->default(15);

            // Company (used on receipts, PDF footers, customer emails)
            $table->string('company_name')->nullable();
            $table->string('company_email')->nullable();
            $table->string('company_phone')->nullable();
            $table->string('company_address')->nullable();

            // Book defaults (Story Blueprint configuration)
            $table->unsignedInteger('default_story_page_count')->default(16);
            $table->unsignedInteger('min_story_page_count')->default(16);
            $table->unsignedInteger('default_preview_page_count')->default(3);
            $table->unsignedInteger('default_age_min')->default(4);
            $table->unsignedInteger('default_age_max')->default(8);
            $table->string('default_illustration_style')->default('soft_watercolor_storybook');
            $table->unsignedInteger('min_pet_photos')->default(3);
            $table->unsignedInteger('max_pet_photos')->default(8);

            // AI & generation (OpenAI models and job behaviour)
            $table->string('story_ai_model')->default('gpt-5.6-terra');
            $table->string('story_ai_fallback_model')->nullable()->default('gpt-5.6-sol');
            $table->string('image_ai_model')->default('gpt-image-2');
            $table->unsignedInteger('image_generation_concurrency')->default(4);
            $table->unsignedInteger('ai_max_retries')->default(3);

            // Storage & uploads (pet reference photos)
            $table->unsignedInteger('max_photo_size_mb')->default(10);
            $table->string('allowed_photo_mime_types')->default('image/jpeg,image/png,image/webp');

            // Billing
            $table->string('default_currency', 3)->default('USD');
            $table->unsignedInteger('free_page_revisions')->default(1);

            // Notifications
            $table->boolean('notify_on_preview_ready')->default(true);
            $table->boolean('notify_on_payment_confirmed')->default(true);
            $table->boolean('notify_on_full_book_ready')->default(true);
            $table->boolean('notify_on_pdf_ready')->default(true);

            // Security
            $table->boolean('registration_enabled')->default(true);
            $table->boolean('require_email_verification')->default(true);

            // Maintenance
            $table->boolean('maintenance_mode')->default(false);
            $table->string('maintenance_message')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
