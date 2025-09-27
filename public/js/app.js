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
    document.getElementById('speed-slider').addEventListener('input', function() {
        document.getElementById('speed-value').textContent = this.value;
    });
    
    document.getElementById('pitch-slider').addEventListener('input', function() {
        document.getElementById('pitch-value').textContent = this.value;
    });
    
    // Translation functionality - FIXED to prevent duplicate saves
    let isTranslating = false;
    document.getElementById('translate-btn').addEventListener('click', async function() {
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
        const translateBtn = document.getElementById('translate-btn');
        const originalText = translateBtn.innerHTML;
        translateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Translating...';
        translateBtn.disabled = true;
        
        try {
            // Call your backend translation API
            const res = await fetch('/translate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
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
    
    // TTS functionality with real browser voices
    const synth = window.speechSynthesis;
    let utterance = null;
    let selectedVoice = null;
    let isSpeaking = false;

    // Function to get appropriate avatar for a voice
    function getVoiceAvatar(voice) {
        const name = voice.name.toLowerCase();
        const lang = voice.lang.toLowerCase();
        
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
        const voices = synth.getVoices();
        const voicesContainer = document.getElementById('voices-container');
        voicesContainer.innerHTML = '';
        
        // Filter to show only 5 voices
        const filteredVoices = voices.filter(voice => {
            const name = voice.name.toLowerCase();
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
                !voice.name.toLowerCase().includes('albert') &&
                !voice.name.toLowerCase().includes('amelie') &&
                !voice.name.toLowerCase().includes('amira')
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
            if (index === 0) {
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
    setTimeout(populateVoices, 100);
    
    // TTS Controls - FIXED to prevent duplicate speech and saves
    document.getElementById('play-btn').addEventListener('click', async function() {
        // Prevent multiple simultaneous TTS
        if (isSpeaking) return;
        isSpeaking = true;
        
        const text = document.getElementById('tts-text').value.trim();
        const targetLang = document.getElementById('tts-language').value;
        const rate = parseFloat(document.getElementById('speed-slider').value);
        const pitch = parseFloat(document.getElementById('pitch-slider').value);
        
        if (!text) {
            alert('Please enter some text to speak.');
            isSpeaking = false;
            return;
        }
        
        // Show loading indicator
        document.getElementById('tts-loading').style.display = 'block';
        const playBtn = document.getElementById('play-btn');
        const originalText = playBtn.innerHTML;
        playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        playBtn.disabled = true;
        
        if (synth.speaking) {
            synth.cancel();
        }
        
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
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    },
                    body: JSON.stringify({ 
                        text: text, 
                        languages: [langCode],
                        // Add a flag to indicate this is for TTS, not translation history
                        for_tts: true 
                    })
                });
                
                if (res.ok) {
                    const data = await res.json();
                    textToSpeak = data.translations[langCode] || text;
                }
            }
            
            utterance = new SpeechSynthesisUtterance(textToSpeak);
            utterance.lang = targetLang;
            utterance.rate = rate;
            utterance.pitch = pitch;
            
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }
            
            // Set up event listeners - FIXED: Remove previous listeners to prevent duplicates
            utterance.onstart = function() {
                document.getElementById('tts-loading').style.display = 'none';
                playBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
            };
            
            utterance.onend = function() {
                playBtn.innerHTML = originalText;
                playBtn.disabled = false;
                document.getElementById('tts-loading').style.display = 'none';
                isSpeaking = false; // Reset flag
                
                // ✅ FIXED: Only save ONCE to TTS history when TTS is completed
                if (selectedVoice) {
                    fetch('/tts/history', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                        },
                        body: JSON.stringify({
                            original_text: originalTextValue,
                            translated_text: textToSpeak,
                            language: targetLang,
                            voice: selectedVoice.name
                        })
                    });
                }
            };
            
            utterance.onerror = function() {
                playBtn.innerHTML = originalText;
                playBtn.disabled = false;
                document.getElementById('tts-loading').style.display = 'none';
                isSpeaking = false; // Reset flag
                alert('Error generating speech. Please try again.');
            };
            
            synth.speak(utterance);
            
        } catch (error) {
            console.error('TTS error:', error);
            playBtn.innerHTML = originalText;
            playBtn.disabled = false;
            document.getElementById('tts-loading').style.display = 'none';
            isSpeaking = false; // Reset flag
            alert('Error processing text. Please try again.');
        }
    });
    
    document.getElementById('pause-btn').addEventListener('click', function() {
        if (synth.speaking && !synth.paused) {
            synth.pause();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i> Resume';
        } else if (synth.speaking && synth.paused) {
            synth.resume();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-volume-up"></i> Speaking...';
        }
    });
    
    document.getElementById('stop-btn').addEventListener('click', function() {
        if (synth.speaking) {
            synth.cancel();
            document.getElementById('play-btn').innerHTML = '<i class="fas fa-play"></i> Play';
            document.getElementById('play-btn').disabled = false;
            document.getElementById('tts-loading').style.display = 'none';
            isSpeaking = false; // Reset flag
        }
    });
    
    // History buttons - go to separate pages
    document.getElementById('history-btn').addEventListener('click', function() {
        window.location.href = '/tts/history-page';
    });

    document.getElementById('translation-history-btn').addEventListener('click', function() {
        window.location.href = '/translation/history-page';
    });
});