<?php

namespace App\Http\Middleware;

use App\Models\Setting;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckMaintenanceMode
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $setting = Setting::instance();

        if ($setting->maintenance_mode && ! $request->user()?->isAdmin()) {
            abort(503, $setting->maintenance_message ?: 'This application is currently undergoing scheduled maintenance.');
        }

        return $next($request);
    }
}
