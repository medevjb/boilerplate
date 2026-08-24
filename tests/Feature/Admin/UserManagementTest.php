<?php

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('non-admins cannot view the users list', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $response = $this->actingAs($user)->get(route('admin.users.index'));
    $response->assertForbidden();
});

test('admins can view the users list', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->get(route('admin.users.index'));
    $response->assertOk();
});

test('admins can promote a user to admin', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $user = User::factory()->create(['is_admin' => false, 'role' => 'user']);

    $response = $this->actingAs($admin)->patch(route('admin.users.update-role', $user), [
        'role' => 'admin',
    ]);

    $response->assertRedirect(route('admin.users.index'));
    $this->assertDatabaseHas('users', ['id' => $user->id, 'role' => 'admin', 'is_admin' => true]);
});

test('admins cannot remove their own admin access', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->patch(route('admin.users.update-role', $admin), [
        'role' => 'user',
    ]);

    $response->assertSessionHasErrors('role');
    $this->assertDatabaseHas('users', ['id' => $admin->id, 'role' => 'admin', 'is_admin' => true]);
});

test('admins can upload an avatar for a user', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->patch(route('admin.users.update-avatar', $user), [
        'avatar' => UploadedFile::fake()->image('avatar.png', 200, 200),
    ]);

    $response->assertRedirect(route('admin.users.index'));

    $user->refresh();
    expect($user->avatar_path)->not->toBeNull();
    expect($user->avatar)->not->toBeNull();
    Storage::disk('public')->assertExists($user->avatar_path);
});

test('uploading a new avatar replaces and removes the previous file', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $user = User::factory()->create();

    $this->actingAs($admin)->patch(route('admin.users.update-avatar', $user), [
        'avatar' => UploadedFile::fake()->image('avatar.png', 200, 200),
    ]);
    $firstPath = $user->refresh()->avatar_path;

    $this->actingAs($admin)->patch(route('admin.users.update-avatar', $user), [
        'avatar' => UploadedFile::fake()->image('avatar-2.png', 200, 200),
    ]);
    $secondPath = $user->refresh()->avatar_path;

    expect($secondPath)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('admins can remove a user avatar', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $user = User::factory()->create();

    $this->actingAs($admin)->patch(route('admin.users.update-avatar', $user), [
        'avatar' => UploadedFile::fake()->image('avatar.png', 200, 200),
    ]);
    $path = $user->refresh()->avatar_path;

    $response = $this->actingAs($admin)->patch(route('admin.users.update-avatar', $user), [
        'remove_avatar' => true,
    ]);

    $response->assertRedirect(route('admin.users.index'));
    expect($user->refresh()->avatar_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('avatar upload rejects files that are too large', function () {
    Storage::fake('public');
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $user = User::factory()->create();

    $response = $this->actingAs($admin)->patch(route('admin.users.update-avatar', $user), [
        'avatar' => UploadedFile::fake()->create('avatar.png', 3000, 'image/png'),
    ]);

    $response->assertSessionHasErrors('avatar');
});

test('non-admins cannot update a user avatar', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $other = User::factory()->create();

    $response = $this->actingAs($user)->patch(route('admin.users.update-avatar', $other), [
        'avatar' => UploadedFile::fake()->image('avatar.png', 200, 200),
    ]);

    $response->assertForbidden();
});
