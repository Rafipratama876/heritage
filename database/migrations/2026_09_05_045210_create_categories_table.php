<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Categories move from a hardcoded PHP enum (App\Support\Categories) to an
// admin-editable table, so the shop owner can add/rename/remove categories
// without a code deploy. Seeded here with the exact same 8 values/order
// the old hardcoded list had, so existing product_categories rows stay
// valid with zero data migration needed.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('label');
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });

        $now = now();
        $order = 0;
        foreach ([
            'batik' => 'Batik',
            'songket_tenun' => 'Songket and Tenun',
            'kebaya' => 'Kebaya',
            'accessories_jewelry' => 'Accessories and Jewelry',
            'bag' => 'Bag',
            'jewelry' => 'Jewelry',
            'plate' => 'Plate',
            'other_accessories' => 'Other Accessories',
        ] as $slug => $label) {
            DB::table('categories')->insert([
                'slug' => $slug,
                'label' => $label,
                'order' => $order++,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // product_categories.category was a fixed ENUM tied to the old
        // hardcoded list — loosen it to a plain string so new admin-added
        // category slugs can actually be stored. Raw SQL (not
        // Schema::table()->change()) since doctrine/dbal isn't installed —
        // same reasoning as the products.price nullability migration.
        DB::statement('ALTER TABLE product_categories MODIFY category VARCHAR(64) NOT NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');

        DB::statement("ALTER TABLE product_categories MODIFY category ENUM(
            'batik','songket_tenun','kebaya','accessories_jewelry','bag','jewelry','plate','other_accessories'
        ) NOT NULL");
    }
};
