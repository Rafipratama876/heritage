<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One row per product-related event from the storefront: opening a
// product's detail page (view), clicking "Order via WhatsApp" (wa_click),
// or clicking "Share" (share). visitorId is the same anonymous id used by
// page_views, so repeat views by the same person can be detected. Powers
// the admin "Product Insight" dashboard.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->enum('type', ['view', 'wa_click', 'share']);
            $table->string('visitor_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('product_id');
            $table->index('type');
            $table->index('visitor_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_events');
    }
};
