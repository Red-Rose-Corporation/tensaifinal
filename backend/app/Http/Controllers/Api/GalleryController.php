<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = GalleryItem::active()->with('branch:id,name,slug')->orderBy('sort_order')->orderByDesc('created_at');

        if ($request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        if ($request->branch && $request->branch !== 'all') {
            $query->whereHas('branch', fn ($q) => $q->where('slug', $request->branch));
        }

        return response()->json(
            $query->get(['id', 'branch_id', 'title', 'description', 'content', 'image_url', 'image_path', 'extra_images', 'category', 'is_featured'])
                ->map(fn ($item) => $this->withBranchBadge($item))
        );
    }

    public function featured(): JsonResponse
    {
        // Curated (is_featured) posts lead, but the homepage teaser no longer requires
        // is_featured to be set at all — otherwise newly uploaded photos (branch photos
        // in particular, which are never manually marked "Featured") would never rotate
        // in and the same old hero image would sit there forever. Featured items still
        // win the top spot; the rest auto-fills with whatever was uploaded most recently.
        $items = GalleryItem::active()->with('branch:id,name,slug')
            ->orderByDesc('is_featured')
            ->orderByDesc('created_at')
            ->limit(6)
            ->get(['id', 'branch_id', 'title', 'description', 'image_url', 'image_path', 'extra_images', 'category']);

        return response()->json($items->map(fn ($item) => $this->withBranchBadge($item)));
    }

    /** Shared response shaping: resolved image URLs + a lightweight branch identity for the UI badge. */
    private function withBranchBadge(GalleryItem $item): array
    {
        return array_merge($item->toArray(), [
            'image_url'         => $item->display_image_url,
            'extra_image_urls'  => $item->extra_image_urls,
            'branch'            => $item->branch ? ['name' => $item->branch->name, 'slug' => $item->branch->slug] : null,
        ]);
    }

    /**
     * Proxy-serve an R2-stored image through the backend.
     * Used as fallback when R2 bucket is private (no public CDN URL configured).
     */
    public function serveImage(GalleryItem $gallery): Response
    {
        if (!$gallery->image_path) {
            abort(404);
        }

        $disk = app()->environment('production') ? 'r2' : 'public';

        try {
            $contents = Storage::disk($disk)->get($gallery->image_path);
        } catch (\Exception $e) {
            abort(404);
        }

        // Detect mime type from file extension (avoids extra S3 API call)
        $ext = strtolower(pathinfo($gallery->image_path, PATHINFO_EXTENSION));
        $mimeMap = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];
        $mimeType = $mimeMap[$ext] ?? 'image/jpeg';

        return response($contents, 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'public, max-age=86400'); // 24h browser cache
    }

    /**
     * Proxy-serve any gallery-uploaded image (cover or extra) by its stored path.
     * Used as fallback when R2 bucket is private (no public CDN URL configured).
     */
    public function serveImagePath(Request $request): Response
    {
        $path = (string) $request->query('path', '');
        // Only ever serve files inside a known gallery upload directory — never arbitrary paths.
        // 'branch-gallery/' is the legacy prefix used before branch photos were unified into
        // this same gallery_items table; existing rows still point at files stored there.
        $allowedPrefixes = ['gallery/', 'branch-gallery/'];
        if ($path === '' || !collect($allowedPrefixes)->contains(fn ($p) => str_starts_with($path, $p))) {
            abort(404);
        }

        $disk = app()->environment('production') ? 'r2' : 'public';

        try {
            $contents = Storage::disk($disk)->get($path);
        } catch (\Exception $e) {
            abort(404);
        }

        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mimeMap = ['jpg' => 'image/jpeg', 'jpeg' => 'image/jpeg', 'png' => 'image/png', 'webp' => 'image/webp', 'gif' => 'image/gif'];
        $mimeType = $mimeMap[$ext] ?? 'image/jpeg';

        return response($contents, 200)
            ->header('Content-Type', $mimeType)
            ->header('Cache-Control', 'public, max-age=86400'); // 24h browser cache
    }
}
