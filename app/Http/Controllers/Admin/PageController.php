<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\PageStoreRequest;
use App\Http\Requests\Admin\PageUpdateRequest;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    /**
     * Display a listing of the pages.
     */
    public function index(): Response
    {
        return Inertia::render('admin/pages/index', [
            'pages' => Page::query()->latest()->get(),
        ]);
    }

    /**
     * Show the form for creating a new page.
     */
    public function create(): Response
    {
        return Inertia::render('admin/pages/create');
    }

    /**
     * Store a newly created page.
     */
    public function store(PageStoreRequest $request): RedirectResponse
    {
        Page::create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Page created.')]);

        return to_route('admin.pages.index');
    }

    /**
     * Show the form for editing a page.
     */
    public function edit(Page $page): Response
    {
        return Inertia::render('admin/pages/edit', [
            'page' => $page,
        ]);
    }

    /**
     * Update the specified page.
     */
    public function update(PageUpdateRequest $request, Page $page): RedirectResponse
    {
        $page->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Page updated.')]);

        return to_route('admin.pages.index');
    }

    /**
     * Toggle the published state of the specified page.
     */
    public function togglePublish(Page $page): RedirectResponse
    {
        $page->update(['is_published' => ! $page->is_published]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $page->is_published ? __('Page published.') : __('Page unpublished.'),
        ]);

        return to_route('admin.pages.index');
    }

    /**
     * Remove the specified page.
     */
    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Page deleted.')]);

        return to_route('admin.pages.index');
    }
}
