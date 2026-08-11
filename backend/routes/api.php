<?php

use App\Http\Controllers\EventController;
use App\Http\Controllers\OrganizerController;
use App\Http\Controllers\ReferenceDataController;
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

Route::get('/organizers/{organizer}/communities', [OrganizerController::class, 'communities']);
Route::get('/organizers/{organizer}/events', [OrganizerController::class, 'events']);

Route::get('/event-categories', [ReferenceDataController::class, 'categories']);
Route::get('/event-modalities', [ReferenceDataController::class, 'modalities']);
Route::get('/locations', [ReferenceDataController::class, 'locations']);
Route::get('/communities', [ReferenceDataController::class, 'communities']);
