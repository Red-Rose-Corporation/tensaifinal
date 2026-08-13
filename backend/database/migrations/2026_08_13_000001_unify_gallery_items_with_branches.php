<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Unifies the main site's gallery_items with branches' gallery_items so a
 * photo uploaded from either the super-admin Filament gallery or a branch
 * admin's dashboard shows up in both places (main /gallery grid + that
 * branch's public page), tagged with its source branch.
 *
 * Also fixes a pre-existing bug: gallery_items.category was a rigid ENUM
 * ('success_story','event','campus','student_life','milestone') that never
 * matched the values Filament's GalleryItemResource actually saves
 * ('students','japan','milestones', etc.) or the frontend's filter keys.
 * Converted to a free-form nullable string.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->foreignId('branch_id')->nullable()->after('id')
                ->constrained('branches')->nullOnDelete();
            $table->string('title')->nullable()->change();
        });

        DB::statement("ALTER TABLE gallery_items MODIFY category VARCHAR(50) NULL DEFAULT NULL");

        // One-time copy of existing branch gallery photos into the unified table.
        if (Schema::hasTable('branch_gallery_items')) {
            DB::table('branch_gallery_items')->orderBy('id')->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('gallery_items')->insert([
                        'branch_id'   => $row->branch_id,
                        'title'       => $row->title ?: $row->caption,
                        'description' => $row->description,
                        'image_url'   => $row->image_url,
                        'image_path'  => $row->image_path,
                        'category'    => null,
                        'is_featured' => false,
                        'is_active'   => $row->is_active,
                        'sort_order'  => $row->sort_order,
                        'created_at'  => $row->created_at,
                        'updated_at'  => $row->updated_at,
                    ]);
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('gallery_items', 'branch_id')) {
            DB::table('gallery_items')->whereNotNull('branch_id')->delete();
        }

        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropConstrainedForeignId('branch_id');
        });

        DB::statement("ALTER TABLE gallery_items MODIFY category ENUM('success_story','event','campus','student_life','milestone') NOT NULL DEFAULT 'success_story'");
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->string('title')->nullable(false)->change();
        });
    }
};
