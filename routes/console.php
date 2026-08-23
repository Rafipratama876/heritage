<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Daily analytics cleanup — was a node-cron job at 03:00 in the old
// backend (backend/src/jobs/cleanupInsight.ts). On shared hosting this
// scheduler only runs when a single cron entry calls
// `php artisan schedule:run` every minute (see deploy notes) — the OS
// cron itself does not need to know about this specific task.
Schedule::command('insight:cleanup')->dailyAt('03:00');
