<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommunityController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\ReferenceDataController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'application' => 'PoliLink',
        'status' => 'ok',
    ]);
});

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::middleware('auth:sanctum')->group(function () {
        Route::delete('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/communities', [CommunityController::class, 'store']);
    Route::get('/me/communities', [DashboardController::class, 'communities']);
    Route::get('/me/events', [DashboardController::class, 'events']);
    Route::post('/events', [EventController::class, 'store']);
    Route::patch('/events/{event}', [EventController::class, 'update']);
    Route::patch('/events/{event}/cancel', [EventController::class, 'cancel']);
});

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);
Route::get('/event-categories', [ReferenceDataController::class, 'categories']);
Route::get('/event-modalities', [ReferenceDataController::class, 'modalities']);
Route::get('/locations', [ReferenceDataController::class, 'locations']);
Route::get('/communities', [ReferenceDataController::class, 'communities']);
