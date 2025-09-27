<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TtsHistory;

class TtsHistoryController extends Controller
{
    public function index()
    {
        $histories = TtsHistory::whereNotNull('voice')
                ->where('voice', '!=', '')
                ->latest()
                ->get();
        return view('tts_history', compact('histories'));
    }

    public function store(Request $request)
    {
        $request->validate([
            'original_text' => 'nullable|string',
            'translated_text' => 'required|string',
            'language' => 'required|string',
            'voice' => 'required|string|min:2',
        ]);

        // Additional validation to prevent translation data
        if (strlen($request->voice) < 2) {
            return response()->json(['success' => false, 'error' => 'Invalid voice']);
        }

        $recentDuplicate = TtsHistory::where('translated_text', $request->translated_text)
            ->where('voice', $request->voice)
            ->where('created_at', '>=', now()->subMinutes(5))
            ->first();

        if ($recentDuplicate) {
            return response()->json(['success' => true, 'message' => 'TTS already saved recently']);
        }

        TtsHistory::create([
            'original_text' => $request->original_text,
            'translated_text' => $request->translated_text,
            'language' => $request->language,
            'voice' => $request->voice
        ]);

        return response()->json(['success' => true]);
    }
}