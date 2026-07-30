<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    protected $fillable = [
        'title', 'slug', 'excerpt', 'body', 'comparison_table', 'content_box', 'type',
        'video_url', 'thumbnail_url', 'thumbnail_file', 'status', 'is_premium', 'published_at', 'created_by',
    ];

    protected $casts = [
        'published_at'     => 'datetime',
        'is_premium'       => 'boolean',
        'comparison_table' => 'array',
        'content_box'      => 'array',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function getYoutubeIdAttribute(): ?string
    {
        if (!$this->video_url) return null;
        preg_match('/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/', $this->video_url, $m);
        return $m[1] ?? null;
    }

    public function getThumbnailAttribute(): ?string
    {
        if ($this->thumbnail_file) {
            try {
                return $this->fileUrl($this->thumbnail_file);
            } catch (\Throwable $e) {
                // Bad/unreachable stored file — fall through to the other thumbnail sources
                // instead of crashing every page that reads this attribute (list, feed, admin form).
            }
        }
        if ($this->thumbnail_url) return $this->thumbnail_url;
        if ($this->youtube_id) return "https://img.youtube.com/vi/{$this->youtube_id}/hqdefault.jpg";
        return null;
    }

    /**
     * Resolve a stored file path to a publicly loadable URL.
     * R2_URL sometimes points at the private r2.cloudflarestorage.com endpoint, which
     * requires auth and can't be loaded by browsers or link-preview crawlers (WhatsApp,
     * Facebook, etc) — in that case, proxy the file through this backend instead.
     */
    private function fileUrl(string $path): string
    {
        if (app()->environment('production')) {
            $r2Url = (string) config('filesystems.disks.r2.url', '');
            if ($r2Url && !str_contains($r2Url, 'r2.cloudflarestorage.com')) {
                return rtrim($r2Url, '/') . '/' . ltrim($path, '/');
            }
            $appUrl = rtrim((string) config('app.url', 'https://tensai-production-3af6.up.railway.app'), '/');
            return $appUrl . '/api/feed/thumbnail?path=' . urlencode($path);
        }
        return \Illuminate\Support\Facades\Storage::disk('public')->url($path);
    }
}
