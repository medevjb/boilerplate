<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Concerns\HandlesFileUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SettingUpdateRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    use HandlesFileUploads;

    /**
     * Show the system settings page.
     */
    public function edit(): Response
    {
        return Inertia::render('admin/settings/index', [
            'setting' => Setting::instance(),
        ]);
    }

    /**
     * Update the system settings.
     */
    public function update(SettingUpdateRequest $request): RedirectResponse
    {
        $setting = Setting::instance();

        $data = $request->safe()->except(['logo', 'favicon', 'remove_logo', 'remove_favicon']);

        $data['logo_path'] = $this->resolveUploadedPath(
            $setting->logo_path,
            $request->file('logo'),
            $request->boolean('remove_logo'),
            'branding/logos',
        );

        $data['favicon_path'] = $this->resolveUploadedPath(
            $setting->favicon_path,
            $request->file('favicon'),
            $request->boolean('remove_favicon'),
            'branding/favicons',
        );

        $setting->update($data);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Settings updated.')]);

        return to_route('admin.settings.edit');
    }
}
