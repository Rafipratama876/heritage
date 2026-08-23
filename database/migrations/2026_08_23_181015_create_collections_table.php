<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collections', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('tagline');
            $table->text('description');
            $table->text('image');
            $table->foreignId('parent_id')->nullable()->constrained('collections')->nullOnDelete();
            $table->timestamps();

            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collections');
    }
};
