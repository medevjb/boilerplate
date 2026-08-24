<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

trait HandlesFileUploads
{
    /**
     * Store an uploaded file on the public disk, honoring removal requests, and
     * return the path to persist. Deletes the previous file when it is replaced
     * or removed.
     */
    private function resolveUploadedPath(?string $currentPath, ?UploadedFile $file, bool $remove, string $directory): ?string
    {
        if (! $file && ! $remove) {
            return $currentPath;
        }

        if ($currentPath) {
            Storage::disk('public')->delete($currentPath);
        }

        if (! $file) {
            return null;
        }

        $path = $file->store($directory, 'public');

        throw_if($path === false, new RuntimeException('Failed to store uploaded file.'));

        return $path;
    }
}
