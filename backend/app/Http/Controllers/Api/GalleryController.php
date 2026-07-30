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
        $query = GalleryItem::active()->orderBy('sort_order')->orderByDesc('created_at');

        if ($request->category && $request->category !== 'all') {
            $query->where('category', $request->category);
        }

        return response()->json(
            $query->get(['id', 'title', 'description', 'content', 'image_url', 'image_path', 'extra_images', 'category', 'is_featured'])
                ->map(fn ($item) => array_merge($item->toArray(), ['image_url' => $item->display_image_url, 'extra_image_urls' => $item->extra_image_urls]))
        );
    }

    public function featured(): JsonResponse
    {
        $items = GalleryItem::active()->featured()
            ->orderBy('sort_order')
            ->limit(6)
            ->get(['id', 'title', 'description', 'image_url', 'image_path', 'extra_images', 'category']);

        return response()->json(
            $items->map(fn ($item) => array_merge($item->toArray(), ['image_url' => $item->display_image_url, 'extra_image_urls' => $item->extra_image_urls]))
        );
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
        // Only ever serve files inside the gallery upload directory — never arbitrary paths.
        if ($path === '' || !str_starts_with($path, 'gallery/')) {
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
