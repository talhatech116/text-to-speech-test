<?php

namespace App\Services;

use Stichoza\GoogleTranslate\GoogleTranslate;

class TranslationService
{
    public function translate(string $text, array $languages): array
    {
        $translations = [];

        foreach ($languages as $lang) {
            try {
                $tr = new GoogleTranslate($lang);
                $translatedText = $tr->translate($text);
                $translations[$lang] = $translatedText;
            } catch (\Exception $e) {
                $translations[$lang] = '[Translation failed: '.$e->getMessage().']';
            }
        }

        return $translations;
    }
}
