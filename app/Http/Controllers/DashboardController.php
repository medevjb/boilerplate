<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the dashboard appropriate for the authenticated user's role.
     */
    public function __invoke(Request $request, AdminDashboardController $adminDashboard): Response
    {
        if ($request->user()->isAdmin()) {
            return $adminDashboard->index();
        }

        return Inertia::render('dashboard', [
            'user' => $request->user(),
        ]);
    }
}
