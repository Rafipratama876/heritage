<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One row per page load, from a lightweight anonymous tracker.
// visitorId is a long-lived id stored in the browser's localStorage;
// sessionId resets after ~30 minutes of inactivity. No IP address or
// precise location is stored.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_views', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id');
            $table->string('session_id');
            $table->string('path');
            $table->string('device');
            $table->timestamp('created_at')->useCurrent();

            $table->index('visitor_id');
            $table->index('session_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
    }
};
