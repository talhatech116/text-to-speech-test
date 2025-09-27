@extends('layouts.app')

@section('title', 'Text to Speech & Voice Changer')

@section('content')
    <div class="container">
        <header>
            <h1>Text to Speech</h1>
            <div class="subtitle">Voice Changer</div>
            
            <div class="tabs">
                <div class="tab active" data-tab="translation">Translation</div>
                <div class="tab" data-tab="tts">Text to Speech</div>

                
            </div>
        </header>
        
        <!-- Translation Tab -->
        <div class="content active" id="translation-content">
            <h2>1️⃣ Translate Text</h2>
            <textarea class="text-input" id="translation-text" placeholder="Enter English text"></textarea>
            
            <div class="languages-section">
                <div class="section-title">Select Target Language(s)</div>
                <div class="languages-grid">
                    <div class="language-option" data-lang="es">Spanish</div>
                    <div class="language-option" data-lang="fr">French</div>
                    <div class="language-option" data-lang="de">German</div>
                </div>
            </div>
            
            <button class="btn btn-primary" id="translate-btn">
                <i class="fas fa-language"></i> Translate
            </button>
            
            <div class="translation-output" id="translation-output">
                <h3>Translations:</h3>
                <div id="translations-container"></div>
            </div>

            <button class="translation-history-btn" id="translation-history-btn">
                <i class="fas fa-history"></i> View History
            </button>
        </div>
        
        <!-- Text to Speech Tab -->
        <div class="content" id="tts-content">
            <h2>2️⃣ Generate Speech</h2>
            <textarea class="text-input" id="tts-text" placeholder="Enter text to speak"></textarea>
            
            <div class="tts-language-selector">
                <div class="section-title">Select Target Language for Speech</div>
                <select class="tts-language-select" id="tts-language">
                    <option value="en-US">English</option>
                    <option value="es-ES">Spanish</option>
                    <option value="fr-FR">French</option>
                    <option value="de-DE">German</option>
                </select>
            </div>
            
            <div class="section-title">Select a Voice</div>
            <div class="voices-grid" id="voices-container">
                <!-- Voices will be populated by JavaScript -->
            </div>
            
            <div class="loading" id="tts-loading">
                <i class="fas fa-spinner fa-spin"></i> Translating and generating speech...
            </div>
            
            <div class="controls">
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Speed</span>
                        <span id="speed-value">1.0</span>
                    </div>
                    <input type="range" min="0.5" max="2" step="0.1" value="1" class="slider" id="speed-slider">
                </div>
                
                <div class="slider-container">
                    <div class="slider-label">
                        <span>Pitch</span>
                        <span id="pitch-value">1.0</span>
                    </div>
                    <input type="range" min="0.5" max="2" step="0.1" value="1" class="slider" id="pitch-slider">
                </div>
                
                <div class="action-buttons">
                    <button class="btn btn-primary" id="play-btn">
                        <i class="fas fa-play"></i> Play
                    </button>
                    <button class="btn btn-secondary" id="pause-btn">
                        <i class="fas fa-pause"></i> Pause
                    </button>
                    <button class="btn btn-secondary" id="stop-btn">
                        <i class="fas fa-stop"></i> Stop
                    </button>
                </div>
            </div>
            
            <button class="history-btn" id="history-btn">
                <i class="fas fa-history"></i> View History
            </button>
        </div>
    </div>

@endsection

