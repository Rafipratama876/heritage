<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One row per search made through the navbar search overlay.
// Powers the admin "Search Insight" dashboard.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('search_queries', function (Blueprint $table) {
            $table->id();
            $table->string('query');
            $table->unsignedInteger('results_count');
            $table->timestamp('created_at')->useCurrent();

            $table->index('query');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('search_queries');
    }
};
