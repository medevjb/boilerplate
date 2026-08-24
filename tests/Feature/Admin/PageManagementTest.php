<?php

use App\Models\Page;
use App\Models\User;

test('guests cannot view the pages list', function () {
    $response = $this->get(route('admin.pages.index'));
    $response->assertRedirect(route('login'));
});

test('non-admins cannot view the pages list', function () {
    $user = User::factory()->create(['is_admin' => false]);

    $response = $this->actingAs($user)->get(route('admin.pages.index'));
    $response->assertForbidden();
});

test('admins can view the pages list', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    Page::factory()->count(2)->create();

    $response = $this->actingAs($admin)->get(route('admin.pages.index'));
    $response->assertOk();
});

test('admins can create a page', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $response = $this->actingAs($admin)->post(route('admin.pages.store'), [
        'title' => 'About Us',
        'slug' => 'about-us',
        'content' => 'Some content.',
        'meta_description' => 'About our company.',
        'is_published' => true,
    ]);

    $response->assertRedirect(route('admin.pages.index'));
    $this->assertDatabaseHas('pages', ['slug' => 'about-us', 'title' => 'About Us']);
});

test('page slug must be unique', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    Page::factory()->create(['slug' => 'about-us']);

    $response = $this->actingAs($admin)->post(route('admin.pages.store'), [
        'title' => 'About Us',
        'slug' => 'about-us',
    ]);

    $response->assertSessionHasErrors('slug');
});

test('admins can update a page', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $page = Page::factory()->create();

    $response = $this->actingAs($admin)->put(route('admin.pages.update', $page), [
        'title' => 'Updated title',
        'slug' => $page->slug,
        'content' => $page->content,
        'is_published' => false,
    ]);

    $response->assertRedirect(route('admin.pages.index'));
    $this->assertDatabaseHas('pages', ['id' => $page->id, 'title' => 'Updated title', 'is_published' => false]);
});

test('admins can toggle a page published state', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $page = Page::factory()->create(['is_published' => true]);

    $response = $this->actingAs($admin)->patch(route('admin.pages.toggle-publish', $page));

    $response->assertRedirect(route('admin.pages.index'));
    $this->assertDatabaseHas('pages', ['id' => $page->id, 'is_published' => false]);

    $this->actingAs($admin)->patch(route('admin.pages.toggle-publish', $page));

    $this->assertDatabaseHas('pages', ['id' => $page->id, 'is_published' => true]);
});

test('non-admins cannot toggle a page published state', function () {
    $user = User::factory()->create(['is_admin' => false]);
    $page = Page::factory()->create(['is_published' => true]);

    $response = $this->actingAs($user)->patch(route('admin.pages.toggle-publish', $page));

    $response->assertForbidden();
    $this->assertDatabaseHas('pages', ['id' => $page->id, 'is_published' => true]);
});

test('admins can delete a page', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $page = Page::factory()->create();

    $response = $this->actingAs($admin)->delete(route('admin.pages.destroy', $page));

    $response->assertRedirect(route('admin.pages.index'));
    $this->assertDatabaseMissing('pages', ['id' => $page->id]);
});
