<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Setting;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('admin/dashboard', [
            'stats' => [
                'total_users' => User::query()->count(),
                'total_admins' => User::query()->where('is_admin', true)->count(),
                'total_pages' => Page::query()->count(),
                'published_pages' => Page::query()->where('is_published', true)->count(),
                'registration_enabled' => Setting::instance()->registration_enabled,
            ],
        ]);
    }
}
