<?php

use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return response()->json([
        'application' => 'PoliLink',
        'status' => 'ok',
    ]);
});
