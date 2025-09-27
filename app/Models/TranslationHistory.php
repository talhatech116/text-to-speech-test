<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class TranslationHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'original_text',
        'translations',
        'target_languages'
    ];

    protected $casts = [
        'translations' => 'array',
        'target_languages' => 'array'
    ];
}