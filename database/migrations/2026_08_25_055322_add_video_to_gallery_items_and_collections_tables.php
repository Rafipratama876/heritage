<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            // A gallery item can now be a video instead of a photo — image
            // stays the grid thumbnail/poster, video_url is optional and,
            // when present, is what actually plays when the item is opened.
            $table->text('video_url')->nullable()->after('image');
        });

        // image was NOT NULL — raw SQL rather than Schema::table()->change(),
        // which needs doctrine/dbal (not installed, not worth adding for
        // one column — see the products.price migration for the same call).
        DB::statement('ALTER TABLE gallery_items MODIFY image TEXT NULL');

        Schema::table('collections', function (Blueprint $table) {
            // Optional promo video for the collection's detail page —
            // the cover `image` stays required and is still what's used
            // on card/listing views; this only shows on the detail page.
            $table->text('video_url')->nullable()->after('image');
        });
    }

    public function down(): void
    {
        Schema::table('gallery_items', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });
        DB::statement('UPDATE gallery_items SET image = "" WHERE image IS NULL');
        DB::statement('ALTER TABLE gallery_items MODIFY image TEXT NOT NULL');

        Schema::table('collections', function (Blueprint $table) {
            $table->dropColumn('video_url');
        });
    }
};
