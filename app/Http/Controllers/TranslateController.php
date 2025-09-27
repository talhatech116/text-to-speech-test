<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\TranslationService;
// REMOVE this line: use App\Models\TranslationHistory;

class TranslateController extends Controller
{
    protected $translator;

    public function __construct(TranslationService $translator)
    {
        $this->translator = $translator;
    }

    public function translate(Request $request)
    {
        $request->validate([
            'text' => 'required|string',
            'languages' => 'required|array|min:1'
        ]);

        $translations = $this->translator->translate($request->text, $request->languages);

        return response()->json(['translations' => $translations]);
    }
}