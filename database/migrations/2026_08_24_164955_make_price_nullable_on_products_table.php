<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Raw SQL rather than Schema::table(...)->change() — that method needs
// doctrine/dbal, an extra dependency not worth adding for one column.
return new class extends Migration
{
    public function up(): void
    {
        // Nullable price = "contact us for price" — the storefront shows
        // a "Hubungi Kami" message and hides Add to Cart for these.
        DB::statement('ALTER TABLE products MODIFY price INT UNSIGNED NULL');
    }

    public function down(): void
    {
        DB::statement('UPDATE products SET price = 0 WHERE price IS NULL');
        DB::statement('ALTER TABLE products MODIFY price INT UNSIGNED NOT NULL');
    }
};
