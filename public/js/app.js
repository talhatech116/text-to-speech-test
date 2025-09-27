document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the correct page
    if (!document.querySelector('.container')) return;
    
    // Get CSRF token properly
    function getCsrfToken() {
        return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
    }

    // Flag to prevent duplicate event listeners
    let listenersAttached = false;
    if (listenersAttached) return;
    listenersAttached = true;

    // Tab switching functionality
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    // Language selection
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            option.classList.toggle('selected');
        });
    });
    
    // Slider value updates
    const speedSlider = document.getElementById('speed-slider');
    const pitchSlider = document.getElementById('pitch-slider');
    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            document.getElementById('speed-value').textContent = this.value;
        });
    }
    if (pitchSlider) {
        pitchSlider.addEventListener('input', function() {
            document.getElementById('pitch-value').textContent = this.value;
        });
    }
    
    // Translation functionality - FIXED to prevent duplicate saves
    let isTranslating = false;
    const translateBtnEl = document.getElementById('translate-btn');
    if (translateBtnEl) {
        translateBtnEl.addEventListener('click', async function() {
            // Prevent multiple simultaneous translations
            if (isTranslating) return;
            isTranslating = true;
            
            const text = document.getElementById('translation-text').value.trim();
            const selectedLanguages = Array.from(document.querySelectorAll('.language-option.selected'))
                .map(opt => opt.getAttribute('data-lang'));
            
            if (!text) {
                alert('Please enter some text to translate.');
                isTranslating = false;
                return;
            }
            
            if (selectedLanguages.length === 0) {
                alert('Please select at least one language.');
                isTranslating = false;
                return;
            }
            
            // Show loading state
            const translateBtn = translateBtnEl;
            const originalText = translateBtn.innerHTML;
            translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
            translateBtn.disabled = true;
            
            try {
                // Call your backend translation API
                const res = await fetch('/translate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({ 
                        text: text, 
                        languages: selectedLanguages 
                    })
                });
                
                if (!res.ok) {
                    throw new Error('Translation failed');
                }
                
                const data = await res.json();
                
                const translationsContainer = document.getElementById('translations-container');
                translationsContainer.innerHTML = '';
                
                for(const lang in data.translations){
                    const translationItem = document.createElement('div');
                    translationItem.className = 'translation-item';
                    
                    const langTag = document.createElement('span');
                    langTag.className = 'language-tag';
                    langTag.textContent = lang.toUpperCase();
                    
                    translationItem.appendChild(langTag);
                    translationItem.appendChild(document.createTextNode(data.translations[lang]));
                    
                    translationsContainer.appendChild(translationItem);
                }
                
                document.getElementById('translation-output').classList.add('active');
                
                // Copy the first translation to the TTS textarea
                const firstTranslation = Object.values(data.translations)[0] || '';
                document.getElementById('tts-text').value = firstTranslation;
                
                // ✅ FIXED: Only save ONCE to translation history
                await fetch('/translation-history', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': getCsrfToken()
                    },
                    body: JSON.stringify({
                        original_text: text,
                        translations: data.translations,
                        target_languages: selectedLanguages
                    })
                });
                
            } catch (error) {
                console.error('Translation error:', error);
                alert('Error translating text. Please try again.');
            } finally {
                // Restore button state
                translateBtn.innerHTML = originalText;
                translateBtn.disabled = false;
                isTranslating = false; // Reset flag
            }
        });
    }
    
    // TTS functionality with real browser voices
    const synth = window.speechSynthesis;
    let utterance = null;
    let selectedVoice = null;
    let isSpeaking = false;     // true when we're actively creating a new utterance or speaking
    let stopRequested = false;  // true when user intentionally requested stop/cancel

    // Function to get appropriate avatar for a voice
    function getVoiceAvatar(voice) {
        const name = (voice.name || '').toLowerCase();
        const lang = (voice.lang || '').toLowerCase();
        
        if (name.includes('female') || name.includes('woman') || name.includes('girl') || 
            name.includes('samantha') || name.includes('karen') || name.includes('veena') ||
            name.includes('tessa') || name.includes('melina') || name.includes('zuzana')) {
            return "👩";
        } else if (name.includes('male') || name.includes('man') || name.includes('boy') || 
                  name.includes('alex') || name.includes('daniel') || name.includes('fred') ||
                  name.includes('victor') || name.includes('thomas')) {
            return "👨";
        } else if (lang.includes('es') || lang.includes('fr') || lang.includes('it') || 
                  lang.includes('pt') || lang.includes('ru')) {
            return "💃";
        } else if (lang.includes('de') || lang.includes('nl')) {
            return "🧑‍💼";
        } else if (lang.includes('ja') || lang.includes('ko') || lang.includes('zh')) {
            return "👘";
        } else {
            return "🗣️";
        }
    }
    
    // Function to populate voices
    function populateVoices() {
        const voices = synth.getVoices() || [];
        const voicesContainer = document.getElementById('voices-container');
        if (!voicesContainer) return;
        voicesContainer.innerHTML = '';
        
        // Filter to show only 5 voices
        const filteredVoices = voices.filter(voice => {
            const name = (voice.name || '').toLowerCase();
            return !name.includes('albert') && 
                   !name.includes('amelie') && 
                   !name.includes('amira') &&
                   !name.includes('microsoft') && 
                   !name.includes('google');
        }).slice(0, 5);
        
        // If we don't have enough voices, add some from the full list
        if (filteredVoices.length < 5) {
            const additionalVoices = voices.filter(voice => 
                !filteredVoices.includes(voice) &&
                !((voice.name || '').toLowerCase().includes('albert')) &&
                !((voice.name || '').toLowerCase().includes('amelie')) &&
                !((voice.name || '').toLowerCase().includes('amira'))
            ).slice(0, 5 - filteredVoices.length);
            
            filteredVoices.push(...additionalVoices);
        }
        
        filteredVoices.forEach((voice, index) => {
            const voiceOption = document.createElement('div');
            voiceOption.className = `voice-option ${index === 0 ? 'selected' : ''}`;
            voiceOption.setAttribute('data-voice', voice.name);
            
            const avatar = getVoiceAvatar(voice);
            
            voiceOption.innerHTML = `
                <div class="voice-avatar">${avatar}</div>
                <div class="voice-name">${voice.name}</div>
                <div class="voice-desc">${voice.lang}</div>
            `;
            
            voiceOption.addEventListener('click', () => {
                document.querySelectorAll('.voice-option').forEach(v => v.classList.remove('selected'));
                voiceOption.classList.add('selected');
                selectedVoice = voice;
            });
            
            voicesContainer.appendChild(voiceOption);
            
            // Set the first voice as selected by default
            if (index === 0 && !selectedVoice) {
                selectedVoice = voice;
            }
        });
        
        // If no voices are available, show a message
        if (filteredVoices.length === 0) {
            voicesContainer.innerHTML = '<p>No voices available. Please check your browser settings.</p>';
        }
    }
    
    // Initialize voices when they are loaded
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = populateVoices;
    }
    // Also try to populate voices immediately
    setTimeout(populateVoices, 150);

    // UI elements
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const stopBtn = document.getElementById('stop-btn');
    const ttsLoading = document.getElementById('tts-loading');

    // Helper: reset UI to initial state
    function resetTtsUi() {
        if (playBtn) {
            playBtn.innerHTML = '<i class="fas fa-play"></i> Play';
            playBtn.disabled = false;
        }
        if (pauseBtn) {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            pauseBtn.disabled = false;
        }
        if (ttsLoading) {
            ttsLoading.style.display = 'none';
        }
    }

    // Clean up any existing utterance references and listeners
    function clearUtteranceListeners() {
        if (!utterance) return;
        utterance.onstart = null;
        utterance.onend = null;
        utterance.onerror = null;
        utterance = null;
    }

    // PLAY button logic (Play or Resume)
    if (playBtn) {
        playBtn.addEventListener('click', async function() {
            // If speech is paused, resume
            if (synth.paused) {
                // ensure pause button gets enabled
                synth.resume();
                if (playBtn) playBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
                if (pauseBtn) { pauseBtn.disabled = false; pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause'; }
                return;
            }

            // If already speaking (not paused), prevent re-entry
            if (isSpeaking) return;

            isSpeaking = true;
            stopRequested = false;

            const textEl = document.getElementById('tts-text');
            const targetLang = document.getElementById('tts-language')?.value || 'en-US';
            const rate = parseFloat(document.getElementById('speed-slider')?.value || 1);
            const pitch = parseFloat(document.getElementById('pitch-slider')?.value || 1);
            const text = textEl ? textEl.value.trim() : '';

            if (!text) {
                alert('Please enter some text to speak.');
                isSpeaking = false;
                return;
            }

            // Show loading indicator
            if (ttsLoading) ttsLoading.style.display = 'block';
            const originalPlayHtml = playBtn.innerHTML;
            playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            playBtn.disabled = true;

            try {
                let textToSpeak = text;
                let originalTextValue = text;

                // Only translate if needed - BUT DON'T SAVE TO TRANSLATION HISTORY
                if (targetLang !== 'en-US') {
                    const langCode = targetLang.split('-')[0];

                    // Call translation API but DON'T save to translation history
                    const res = await fetch('/translate', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': getCsrfToken()
                        },
                        body: JSON.stringify({ 
                            text: text, 
                            languages: [langCode],
                            for_tts: true 
                        })
                    });

                    if (res.ok) {
                        const data = await res.json();
                        textToSpeak = data.translations?.[langCode] || text;
                    }
                }

                // Clean previous utterance listeners
                clearUtteranceListeners();

                utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.lang = targetLang;
                utterance.rate = rate;
                utterance.pitch = pitch;

                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                }

                // onstart
                utterance.onstart = function() {
                    if (ttsLoading) ttsLoading.style.display = 'none';
                    if (playBtn) {
                        playBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
                        playBtn.disabled = true;
                    }
                    if (pauseBtn) {
                        pauseBtn.disabled = false;
                        pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                    }
                };

                // onend
                utterance.onend = function() {
                    // If stop was requested, just reset UI silently
                    isSpeaking = false;
                    stopRequested = false;
                    resetTtsUi();
                    
                    // ✅ Save once to TTS history (only if not stopped)
                    if (!stopRequested && selectedVoice) {
                        try {
                            fetch('/tts/history', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'X-CSRF-TOKEN': getCsrfToken()
                                },
                                body: JSON.stringify({
                                    original_text: originalTextValue,
                                    translated_text: textToSpeak,
                                    language: targetLang,
                                    voice: selectedVoice.name
                                })
                            }).catch(err => {
                                // don't block UI if history save fails
                                console.warn('Failed to save tts history', err);
                            });
                        } catch (e) {
                            console.warn('Failed to save tts history', e);
                        }
                    }
                    clearUtteranceListeners();
                };

                // onerror - ignore errors triggered by stop/cancel
                utterance.onerror = function(event) {
                    // If this error was caused by an intentional stop, don't show the alert
                    if (stopRequested) {
                        // cleanup and reset
                        stopRequested = false;
                        isSpeaking = false;
                        resetTtsUi();
                        clearUtteranceListeners();
                        return;
                    }

                    console.error('TTS utterance error:', event);
                    isSpeaking = false;
                    resetTtsUi();
                    clearUtteranceListeners();
                    alert('Error generating speech. Please try again.');
                };

                // Speak
                synth.speak(utterance);

            } catch (error) {
                console.error('TTS error:', error);
                isSpeaking = false;
                stopRequested = false;
                resetTtsUi();
                alert('Error processing text. Please try again.');
            }
        });
    }

    // Pause button - only pause. Resume handled by Play button.
    if (pauseBtn) {
        pauseBtn.addEventListener('click', function() {
            if (synth.speaking && !synth.paused) {
                synth.pause();
                // set UI for paused state
                if (playBtn) {
                    playBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
                    playBtn.disabled = false;
                }
                // disable pause while paused to avoid confusion
                pauseBtn.disabled = true;
                pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
            }
        });
    }

    // Stop button - cancel everything and reset UI. Suppress error alert when this happens.
    if (stopBtn) {
        stopBtn.addEventListener('click', function() {
            // If nothing is happening, just reset UI
            stopRequested = true;
            try {
                if (synth.speaking || synth.paused) {
                    synth.cancel();
                }
            } catch (e) {
                console.warn('Error calling synth.cancel()', e);
            } finally {
                // Reset flags & UI
                isSpeaking = false;
                stopRequested = false; // clear after cancel — utterance.onerror checks stopRequested at time of event, but we cleared it here so ensure we cleared earlier if necessary
                resetTtsUi();
                clearUtteranceListeners();
            }
        });
    }

    // History buttons - go to separate pages
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', function() {
            window.location.href = '/tts/history-page';
        });
    }

    const translationHistoryBtn = document.getElementById('translation-history-btn');
    if (translationHistoryBtn) {
        translationHistoryBtn.addEventListener('click', function() {
            window.location.href = '/translation/history-page';
        });
    }
});