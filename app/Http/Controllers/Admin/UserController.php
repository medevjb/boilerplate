<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Concerns\HandlesFileUploads;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserAvatarUpdateRequest;
use App\Http\Requests\Admin\UserRoleUpdateRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    use HandlesFileUploads;

    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        return Inertia::render('admin/users/index', [
            'users' => User::query()->latest()->get(),
        ]);
    }

    /**
     * Update the given user's role.
     */
    public function updateRole(UserRoleUpdateRequest $request, User $user): RedirectResponse
    {
        $role = UserRole::from($request->validated('role'));

        if ($user->is($request->user()) && $role !== UserRole::Admin) {
            throw ValidationException::withMessages([
                'role' => __('You cannot remove your own admin access.'),
            ]);
        }

        $user->update([
            'role' => $role,
            'is_admin' => $role === UserRole::Admin,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('User role updated.')]);

        return to_route('admin.users.index');
    }

    /**
     * Update the given user's avatar.
     */
    public function updateAvatar(UserAvatarUpdateRequest $request, User $user): RedirectResponse
    {
        $user->update([
            'avatar_path' => $this->resolveUploadedPath(
                $user->avatar_path,
                $request->file('avatar'),
                $request->boolean('remove_avatar'),
                'avatars',
            ),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Avatar updated.')]);

        return to_route('admin.users.index');
    }
}
