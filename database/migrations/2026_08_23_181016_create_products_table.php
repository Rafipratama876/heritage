<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->unsignedInteger('price');
            $table->text('short_description');
            $table->text('description');
            $table->boolean('featured')->default(false);
            // No stock/quantity tracking in this catalog — this is a manual
            // on/off switch admins flip instead, e.g. for a one-off/sold piece.
            $table->boolean('available')->default(true);
            $table->text('video_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
