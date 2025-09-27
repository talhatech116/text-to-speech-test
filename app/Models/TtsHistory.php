<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class TtsHistory extends Model
{
    use HasFactory;

    protected $table = 'tts_histories';

    protected $fillable = [
        'original_text',
        'translated_text',
        'language',
        'voice',
        'audio_file', 
    ];
}
