<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TranslationHistory;

class TranslationHistoryController extends Controller
{
    public function index()
    {
        $histories = TranslationHistory::whereNotNull('translations')
            ->whereNotNull('target_languages')
            ->whereJsonLength('translations', '>', 0)
            ->whereJsonLength('target_languages', '>', 0)
            ->latest()
            ->get();
            
        return view('translation_history', compact('histories'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'original_text' => 'required|string',
            'translations' => 'required|array',
            'target_languages' => 'required|array',
        ]);

        // Additional validation to ensure this is real translation data
        if (empty($request->translations) || empty($request->target_languages)) {
            return response()->json(['success' => false, 'error' => 'Invalid translation data']);
        }

        // ✅ ADD DUPLICATE PREVENTION: Check if identical translation already exists in last 5 minutes
        $recentDuplicate = TranslationHistory::where('original_text', $request->original_text)
            ->whereJsonContains('target_languages', $request->target_languages)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if ($recentDuplicate) {
            return response()->json(['success' => true, 'message' => 'Translation already saved recently']);
        }

        TranslationHistory::create([
            'original_text' => $request->original_text,
            'translations' => $request->translations,
            'target_languages' => $request->target_languages
        ]);

        return response()->json(['success' => true]);
    }
}