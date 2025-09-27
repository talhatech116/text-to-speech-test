<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TranslateController;
use App\Http\Controllers\TtsHistoryController;
use App\Http\Controllers\TranslationHistoryController;

Route::get('/', function () {
    return view('home');
});

// Translation
Route::post('/translate', [TranslateController::class, 'translate']);

// Translation History
Route::post('/translation-history', [TranslationHistoryController::class, 'store']);
Route::get('/translation/history-page', [TranslationHistoryController::class, 'index'])->name('translation.history.index');

// Text to Speech
Route::post('/tts/history', [TtsHistoryController::class, 'store']);
Route::get('/tts/history-page', [TtsHistoryController::class, 'index'])->name('tts.history.index');
Route::get('/tts/history/{id}/download', [TtsHistoryController::class, 'downloadAudio'])->name('tts.history.download');

