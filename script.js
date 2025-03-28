import { AnimationManager } from './anim-manager.js';
import { UIManager } from './ui-manager.js';

document.addEventListener('DOMContentLoaded', function() {
    let wordsData = [];
    let playingFlipAnim = false;
    let canInput = true;
    const wordBox = document.getElementById('wordBox');
    const textInputArea = document.getElementById('textInputArea');
    let currentIndex = Math.floor(Math.random() * wordsData.length);
    let xp = parseInt(localStorage.getItem('xp')) || 0;
    const placeholderText = '入力してください';

    var primaryColor = localStorage.getItem('primaryGradientColor') || '#121212';
    var secondaryColor = '#251c2e';
    document.body.style.background = `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`;

    UIManager.initializeBackground();

    async function loadWords() {
        const response = await fetch('words.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        // Skip header line and empty lines
        const dataRows = lines.slice(1).filter(line => line.trim() && !line.startsWith('//'));
        
        // Convert CSV rows
        wordsData = dataRows.map(row => {
            // Split by comma (handling possible commas in the meaning field)
            const parts = [];
            let currentPart = '';
            let inQuotes = false;
            
            for (let i = 0; i < row.length; i++) {
                const char = row[i];
                
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === ',' && !inQuotes) {
                    parts.push(currentPart);
                    currentPart = '';
                } else {
                    currentPart += char;
                }
            }
        

            parts.push(currentPart);
            // Get the columns
            const [expression, reading, meaning] = parts;
            
            // Return the word
            return {
                kanji: [{ text: expression }],
                kana: [{ text: reading }],
                sense: [{ gloss: [{ text: meaning }] }]
            };
        });
        
        // Continue with the existing functionality
        currentIndex = Math.floor(Math.random() * wordsData.length);
        UIManager.displayWord(wordsData[currentIndex]);
        animateCardEntrance();
    }

    function animateCardEntrance() {
        const card = document.querySelector(".card");
        AnimationManager.animateCardEntrance(card, function() {
            card.style.display = 'block';
            UIManager.adjustFontSize();
        });
        UIManager.setInputPlaceholder(textInputArea);
    }

    document.addEventListener('keydown', function(event) {
        if (!canInput) return;

        if (event.ctrlKey || event.altKey) {
            // Ignore CTRL and ALT keys
            return;
        }

        // Remove placeholder text when user starts typing
        if (textInputArea.innerHTML.includes('placeholder')) {
            UIManager.clearInput(textInputArea);
        }
        
        // Ignore if the event is not a character or special handling keys
        if (['Enter', 'Backspace', 'Escape'].includes(event.key)) {
            handleSpecialKeys(event);
            return;
        }

        // Only allow character inputs
        if (!event.key.match(/^[a-zぁ-んァ-ン0-9]$/i)) return;

        // Create a span for each typed character for individual animation
        const charSpan = document.createElement('span');
        charSpan.textContent = event.key;
        textInputArea.appendChild(charSpan);

        AnimationManager.animateCharacterInput(charSpan);
    });

    function handleSpecialKeys(event) {
        switch (event.key) {
            case 'Enter':
                const typedAnswer = textInputArea.textContent.trim();
                checkAnswer(typedAnswer);
                break;
            case 'Backspace':
                if (textInputArea.childNodes.length > 0 && !textInputArea.innerHTML.includes('placeholder')) {
                    textInputArea.removeChild(textInputArea.lastChild);
                }
                if (textInputArea.innerHTML.trim() === '') {
                    textInputArea.innerHTML = `<span class="placeholder">${placeholderText}</span>`;
                }
                break;
            case 'Escape':
                textInputArea.innerHTML = `<span class="placeholder">${placeholderText}</span>`;
                break;
        }
    }

    function checkAnswer(typedAnswer) {
        if (!canInput || playingFlipAnim) return;
        canInput = false;
        playingFlipAnim = true;

        const answerInHiragana = wanakana.toHiragana(typedAnswer);
        const correctAnswer = wordsData[currentIndex].kana[0].text;
        const isCorrect = answerInHiragana === correctAnswer;
        
        if (isCorrect) {
            xp += 10;
        } else {
            const typedAnswerInHiragana = wanakana.toHiragana(typedAnswer);
            const partialCorrectChars = [...correctAnswer].filter((char, index) => char === typedAnswerInHiragana[index]);
            
            if (partialCorrectChars.length >= correctAnswer.length / 2) {
                xp += 2;
            }
        }

        localStorage.setItem('xp', xp.toString());
        UIManager.updateXpDisplay(xp);
        showFeedbackAnimation(wordBox, isCorrect ? '#4CAF50' : '#F44336', isCorrect ? '+10' : '不正解', isCorrect);
        UIManager.adjustFontSize();
        flipCardToShowAnswer();
    }

    function flipCard(onComplete) {
        const card = document.querySelector(".card");
        AnimationManager.flipCard(card, onComplete);
    }

    function flipCardToShowAnswer() {
        flipCard(() => {
            setTimeout(() => {
                prepareNextWord();
            }, 2000);
        });

        setTimeout(() => {
            const spans = textInputArea.querySelectorAll('span');
            anime({
                targets: spans,
                opacity: [1, 0],
                scale: [1, 0],
                easing: 'easeInOutQuad',
                duration: 400,
                complete: function() {
                    textInputArea.innerHTML = '';
                }
            });
        }, 2500);
    }

    function prepareNextWord() {
        // Move to next word, maybe should be random instead?
        currentIndex = (currentIndex + 1) % wordsData.length;
        const nextWordData = wordsData[currentIndex];
        
        // Update front card
        const front = document.querySelector('.card .front');
        front.innerHTML = `<p class="kanji">${nextWordData.kanji[0].text}</p>`;

        flipCardBackToFront();
    }
    
    function flipCardBackToFront() {
        flipCard(() => {
            const nextWordData = wordsData[currentIndex];
            const back = document.querySelector('.card .back');
            let nextTranslationText = nextWordData.sense[0].gloss[0].text;
            nextTranslationText = nextTranslationText.replace(/ \(([^)]+)\)/, '<br>($1)');
            back.innerHTML = `<p class="kana">${nextWordData.kana[0].text}<br>${nextTranslationText}</p>`;
            
            playingFlipAnim = false;
            canInput = true;
            textInputArea.innerHTML = `<span class="placeholder">${placeholderText}</span>`;
        });
    }

    function updateXpDisplay() {
        const xpDisplay = document.getElementById('xpDisplay');
        xpDisplay.textContent = `XP: ${xp}`;
    }

    function showFeedbackAnimation(targetElement, color, feedbackText, isCorrect) {
        AnimationManager.showFeedback(feedbackText, color);
    }

    loadWords();
    updateXpDisplay();
});
