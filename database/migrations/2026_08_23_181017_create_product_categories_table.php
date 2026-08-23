<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Join table for Product <-> Category (many-to-many). Category stays an
// enum rather than its own table since the set of categories is fixed.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('category', [
                'batik',
                'songket_tenun',
                'kebaya',
                'accessories_jewelry',
                'bag',
                'jewelry',
                'plate',
                'other_accessories',
            ]);

            $table->unique(['product_id', 'category']);
            $table->index('product_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_categories');
    }
};
