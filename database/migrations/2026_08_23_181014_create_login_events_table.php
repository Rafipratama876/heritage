<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// One row per successful login — lets the admin dashboard report
// accurate "logins today" / "total logins" / "returning user" numbers,
// which a single counter field on users can't do on its own.
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('login_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();

            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_events');
    }
};
