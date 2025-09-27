@extends('layouts.app')

@section('title', 'TTS History')

@section('content')

<div class="history-container">
    <div class="container">
        <!-- Header -->
        <div class="history-header">
            <h1 class="history-title">TTS & Translation History</h1>
            <div class="history-subtitle">All your text processing activities</div>
        </div>

        <!-- History Table -->
        <div class="history-table">
            <!-- Table Header -->
            <div class="table-header-row">
                <div>Type</div>
                <div>Original Text</div>
                <div>Translated Text</div>
                <div>Language</div>
                <div>Voice</div>
                <div>Date & Time</div>
            </div>

            <!-- Table Body -->
            <div class="table-body">
                @forelse($histories as $item)
                <div class="table-row" data-label="Entry {{ $loop->iteration }}">
                    <div>
                        <span class="type-badge {{ $item->voice ? 'type-tts' : 'type-translation' }}">
                            {{ $item->voice ? 'TTS' : 'TRANS' }}
                        </span>
                    </div>
                    <div class="text-cell" title="{{ $item->original_text ?? 'N/A' }}">
                        {{ $item->original_text ?? 'N/A' }}
                    </div>
                    <div class="text-cell" title="{{ $item->translated_text }}">
                        {{ $item->translated_text }}
                    </div>
                    <div class="language-cell">
                        @php
                            $languageNames = [
                                'en-US' => 'English',
                                'es-ES' => 'Spanish',
                                'fr-FR' => 'French',
                                'de-DE' => 'German',
                                'en' => 'English',
                                'es' => 'Spanish',
                                'fr' => 'French',
                                'de' => 'German'
                            ];
                        @endphp
                        {{ $languageNames[$item->language] ?? $item->language }}
                    </div>
                    <div class="voice-cell">
                        {{ $item->voice ?? '—' }}
                    </div>
                    <div class="date-cell">
                        {{ $item->created_at->format('M j, Y · H:i') }}
                    </div>
                </div>
                @empty
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No history yet</h3>
                    <p>Your translation and TTS activities will appear here</p>
                </div>
                @endforelse
            </div>
        </div>

        <!-- Back Button -->
        <div style="text-align: center; margin-top: 30px;">
            <a href="/" class="back-btn">
                ← Back to Translator
            </a>
        </div>
    </div>
</div>
@endsection