<?php

use App\Http\Controllers\EventController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'application' => 'PoliLink',
        'status' => 'ok',
    ]);
});

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::post('/events', [EventController::class, 'store']);
Route::patch('/events/{event}', [EventController::class, 'update']);
Route::patch('/events/{event}/cancel', [EventController::class, 'cancel']);
