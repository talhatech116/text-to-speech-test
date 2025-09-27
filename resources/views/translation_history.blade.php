@extends('layouts.app')

@section('title', 'Translation History')

@section('content')
<div class="translation-history-container">
    <div class="container">
        <!-- Header -->
        <div class="translation-history-header">
            <h1 class="translation-history-title">Translation History</h1>
            <div class="translation-history-subtitle">All your translation activities and results</div>
        </div>

        <!-- History Table -->
        <div class="translation-history-table">
            <!-- Table Header -->
            <div class="translation-table-header-row">
                <div>Date & Time</div>
                <div>Original Text</div>
                <div>Target Languages</div>
                <div>Translations</div>
            </div>

            <!-- Table Body -->
            <div class="table-body">
                @forelse($histories as $history)
                <div class="translation-table-row">
                    <div class="translation-date-cell">
                        {{ $history->created_at->format('M j, Y') }}<br>
                        <span style="color: #4ecdc4; font-size: 0.8rem;">{{ $history->created_at->format('H:i') }}</span>
                    </div>
                    
                    <div class="translation-original-text-cell">
                        <span class="translation-original-text-label">Original Text</span>
                        <div class="translation-original-content">
                            {{ $history->original_text }}
                        </div>
                    </div>
                    
                    <div class="translation-languages-cell">
                        <span class="translation-languages-label">
                            Target Languages 
                            <span class="translation-language-count">{{ count($history->target_languages) }}</span>
                        </span>
                        <div class="translation-language-badges">
                            @php
                                $languageNames = [
                                    'es' => 'Spanish',
                                    'fr' => 'French',
                                    'de' => 'German',
                                    'en' => 'English'
                                ];
                            @endphp
                            @foreach($history->target_languages as $language)
                            <span class="translation-language-badge">{{ $languageNames[$language] ?? strtoupper($language) }}</span>
                            @endforeach
                        </div>
                    </div>
                    
                    <div class="translation-translations-cell">
                        <span class="translation-translations-label">
                            Translations 
                            <span class="translation-language-count">{{ count($history->translations) }}</span>
                        </span>
                        <div class="translation-language-list">
                            @php
                                $languageNames = [
                                    'es' => 'Spanish',
                                    'fr' => 'French',
                                    'de' => 'German',
                                    'en' => 'English'
                                ];
                            @endphp
                            @foreach($history->translations as $language => $translation)
                            <div class="translation-language-item">
                                <span class="translation-language-code">{{ $languageNames[$language] ?? strtoupper($language) }}</span>
                                <span class="translation-text">{{ $translation }}</span>
                            </div>
                            @endforeach
                        </div>
                    </div>
                </div>
                @empty
                <div class="translation-empty-state">
                    <div class="translation-empty-icon">🌍</div>
                    <h3>No Translation History Yet</h3>
                    <p>Your translation activities will appear here once you start using the translator</p>
                </div>
                @endforelse
            </div>
        </div>

        <!-- Back Button -->
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="translation-back-btn">
                ← Back to Translator
            </a>
        </div>
    </div>
</div>
@endsection