<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function validSettingPayload(array $overrides = []): array
{
    return array_merge([
        'site_name' => 'Petfable',
        'site_description' => 'A place for pets.',
        'support_email' => 'support@petfable.test',
        'default_language' => 'en',
        'timezone' => 'UTC',
        'date_format' => 'M j, Y',
        'items_per_page' => 15,

        'company_name' => 'Petfable Inc.',
        'company_email' => 'hello@petfable.test',
        'company_phone' => '+1 555 0100',
        'company_address' => '1 Market St, San Francisco, CA',

        'default_story_page_count' => 16,
        'min_story_page_count' => 16,
        'default_preview_page_count' => 3,
        'default_age_min' => 4,
        'default_age_max' => 8,
        'default_illustration_style' => 'soft_watercolor_storybook',
        'min_pet_photos' => 3,
        'max_pet_photos' => 8,

        'story_ai_model' => 'gpt-5.6-terra',
        'story_ai_fallback_model' => 'gpt-5.6-sol',
        'image_ai_model' => 'gpt-image-2',
        'image_generation_concurrency' => 4,
        'ai_max_retries' => 3,

        'max_photo_size_mb' => 10,
        'allowed_photo_mime_types' => 'image/jpeg,image/png,image/webp',

        'default_currency' => 'USD',
        'free_page_revisions' => 1,

        'notify_on_preview_ready' => true,
        'notify_on_payment_confirmed' => true,
        'notify_on_full_book_ready' => true,
        'notify_on_pdf_ready' => true,

        'registration_enabled' => true,
        'require_email_verification' => true,

        'maintenance_mode' => false,
        'maintenance_message' => null,
    ], $overrides);
}

test('non-admins cannot view system settings', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $response = $this->actingAs($user)->get(route('admin.settings.edit'));
    $response->assertForbidden();
});

test('admins can view system settings', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('admin.settings.edit'));
    $response->assertOk();
});

test('admins can update system settings', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'site_name' => 'Petfable',
        'registration_enabled' => false,
    ]));

    $response->assertRedirect(route('admin.settings.edit'));
    expect(Setting::instance()->site_name)->toBe('Petfable');
    expect(Setting::instance()->registration_enabled)->toBeFalse();
});

test('checked checkboxes submitted as the string "1" (what the browser actually sends) validate and persist', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'registration_enabled' => '1',
        'notify_on_preview_ready' => '1',
    ]));

    $response->assertSessionHasNoErrors();
    $response->assertRedirect(route('admin.settings.edit'));
    expect(Setting::instance()->registration_enabled)->toBeTrue();
    expect(Setting::instance()->notify_on_preview_ready)->toBeTrue();
});

test('a checkbox submitted as "on" (the native HTML default) fails boolean validation', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'registration_enabled' => 'on',
    ]));

    $response->assertSessionHasErrors('registration_enabled');
});

test('book default age range must be logical', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'default_age_min' => 10,
        'default_age_max' => 4,
    ]));

    $response->assertSessionHasErrors('default_age_max');
});

test('disabling registration blocks new signups', function () {
    Setting::instance()->update(['registration_enabled' => false]);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
    $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
});

test('the register page redirects when registration is disabled', function () {
    Setting::instance()->update(['registration_enabled' => false]);

    $response = $this->get(route('register'));

    $response->assertRedirect(route('login'));
});

test('maintenance mode blocks non-admins with the configured message', function () {
    Setting::instance()->update([
        'maintenance_mode' => true,
        'maintenance_message' => 'Back soon!',
    ]);

    $response = $this->get(route('login'));

    $response->assertStatus(503);
    $response->assertSeeText('Back soon!');
});

test('maintenance mode does not block admins', function () {
    Setting::instance()->update(['maintenance_mode' => true]);
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('dashboard'));

    $response->assertOk();
});

test('admins can upload a logo and favicon', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
        'favicon' => UploadedFile::fake()->image('favicon.png', 32, 32)->size(100),
    ]));

    $response->assertRedirect(route('admin.settings.edit'));

    $setting = Setting::instance();
    expect($setting->logo_path)->not->toBeNull();
    expect($setting->favicon_path)->not->toBeNull();
    expect($setting->logo_url)->not->toBeNull();
    Storage::disk('public')->assertExists($setting->logo_path);
    Storage::disk('public')->assertExists($setting->favicon_path);
});

test('uploading a new logo replaces and removes the previous file', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
    ]));
    $firstPath = Setting::instance()->logo_path;

    $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'logo' => UploadedFile::fake()->image('logo-2.png', 200, 200),
    ]));
    $secondPath = Setting::instance()->logo_path;

    expect($secondPath)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('admins can remove an uploaded logo', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'logo' => UploadedFile::fake()->image('logo.png', 200, 200),
    ]));
    $path = Setting::instance()->logo_path;

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'remove_logo' => true,
    ]));

    $response->assertRedirect(route('admin.settings.edit'));
    expect(Setting::instance()->logo_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('logo upload rejects files that are too large', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->put(route('admin.settings.update'), validSettingPayload([
        'logo' => UploadedFile::fake()->create('logo.png', 3000, 'image/png'),
    ]));

    $response->assertSessionHasErrors('logo');
});
