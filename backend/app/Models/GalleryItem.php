<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class GalleryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'description', 'content',
        'image_url', 'image_path', 'extra_images',
        'category', 'is_featured', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'is_featured'  => 'boolean',
        'is_active'    => 'boolean',
        'extra_images' => 'array',
    ];

    protected $appends = ['display_image_url', 'extra_image_urls'];

    public function getDisplayImageUrlAttribute(): string
    {
        if ($this->image_path) {
            return $this->resolveImagePath($this->image_path);
        }
        return $this->image_url ?? '';
    }

    /** Resolved URLs for the (up to 2) additional images uploaded alongside the cover image. */
    public function getExtraImageUrlsAttribute(): array
    {
        return collect($this->extra_images ?? [])
            ->filter()
            ->map(fn (string $path) => $this->resolveImagePath($path))
            ->values()
            ->all();
    }

    private function resolveImagePath(string $path): string
    {
        if (app()->environment('production')) {
            $r2Url = (string) config('filesystems.disks.r2.url', '');
            // Only use R2_URL if it's a proper public CDN URL.
            // The private API endpoint (r2.cloudflarestorage.com) requires auth — browsers can't load it.
            $isPublicCdn = $r2Url && !str_contains($r2Url, 'r2.cloudflarestorage.com');
            if ($isPublicCdn) {
                return rtrim($r2Url, '/') . '/' . ltrim($path, '/');
            }
            // Fall back to backend proxy — streams the image through Railway
            $appUrl = rtrim((string) config('app.url', 'https://tensai-production-3af6.up.railway.app'), '/');
            return $appUrl . '/api/gallery/image-path?path=' . urlencode($path);
        }
        // Local dev: use public disk URL
        return Storage::disk('public')->url($path);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }
}
