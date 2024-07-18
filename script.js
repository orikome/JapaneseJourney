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


    async function loadWords() {
        const response = await fetch('words.json');
        const data = await response.json();
        wordsData = data.words;
        currentIndex = Math.floor(Math.random() * wordsData.length);
        displayWord(wordsData[currentIndex]);
        animateCardEntrance();
    }

    function animateCardEntrance() {
        const card = document.querySelector(".card");
        anime({
            targets: card,
            opacity: [0, 1],
            scale: [0.85, 1],
            easing: 'easeOutExpo',
            duration: 1000,
            begin: function() {
                card.style.display = 'block';
                adjustFontSize();
            }
        });
        textInputArea.innerHTML = `<span class="placeholder">${placeholderText}</span>`;
    }

    document.addEventListener('keydown', function(event) {
        if (!canInput) return;

        if (event.ctrlKey || event.altKey) {
            // Ignore CTRL and ALT keys
            return;
        }

        // Remove placeholder text when user starts typing
        if (textInputArea.innerHTML.includes('placeholder')) {
            textInputArea.innerHTML = '';
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

        anime({
            targets: charSpan,
            opacity: [0, 1],
            scale: [3, 1],
            easing: 'easeOutBack',
            duration: 400
        });
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
        updateXpDisplay();
        showFeedbackAnimation(wordBox, isCorrect ? '#4CAF50' : '#F44336', isCorrect ? '+10' : '不正解', isCorrect);
        adjustFontSize();
        flipCardToShowAnswer();
    }

    function adjustFontSize() {
        const cards = document.querySelectorAll('.card-container .card');
        cards.forEach(card => {
            const containerWidth = card.offsetWidth - 20;
            const containerHeight = card.offsetHeight - 20;
    
            ['front', 'back'].forEach(side => {
                const element = card.querySelector(`.${side}`);
                if (!element) return;
    
                // Measure content size to scale font appropriately
                let fontSize = 80;
                const tempElement = document.createElement('div');
                tempElement.style.fontWeight = 'bold';
                tempElement.style.position = 'absolute';
                tempElement.style.visibility = 'hidden';
                tempElement.style.width = 'max-content';
                tempElement.innerHTML = element.innerHTML.trim();
                document.body.appendChild(tempElement);
    
                // Check both width and height
                for (let i = 0; i < 50 && fontSize > 12; i++) {
                    tempElement.style.fontSize = `${fontSize}px`;
                    if (tempElement.offsetWidth <= containerWidth && tempElement.offsetHeight <= containerHeight) {
                        break;
                    }
                    fontSize -= 5;

                    if (fontSize <= 12 + 5) {
                        fontSize -= 1;
                    }
                }
    
                element.style.fontSize = `${fontSize}px`;
                document.body.removeChild(tempElement);
            });
        });
    }
    

    function flipCardToShowAnswer() {
        const card = document.querySelector(".card");
        anime({
            targets: card,
            scale: [{value: 1}, {value: 1.2}, {value: 1, delay: 500}],
            rotateY: {value: '+=180', delay: 300},
            duration: 800,
            easing: 'easeInOutSine',
            complete: function() {
                // Maybe wait for user action to move on?
                setTimeout(() => {
                    prepareNextWord();
                }, 2000);
            }
        });

        // Clear input text
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
        const card = document.querySelector(".card");
        anime({
            targets: card,
            scale: [{value: 1}, {value: 1.2}, {value: 1, delay: 500}],
            rotateY: {value: '+=180', delay: 300},
            duration: 800,
            easing: 'easeInOutSine',
            complete: function() {
                const nextWordData = wordsData[currentIndex];
                const back = document.querySelector('.card .back');
                let nextTranslationText = nextWordData.sense[0].gloss[0].text;
                
                // Check for parentheses in the text and split if necessary
                nextTranslationText = nextTranslationText.replace(/ \(([^)]+)\)/, '<br>($1)');
    
                back.innerHTML = `<p class="kana">${nextWordData.kana[0].text}<br>${nextTranslationText}</p>`;
        
                playingFlipAnim = false;
                canInput = true;
                textInputArea.innerHTML = `<span class="placeholder">${placeholderText}</span>`;
            }
        });
    }

    function displayWord(wordData) {
        const front = document.querySelector('.card .front');
        const back = document.querySelector('.card .back');
        const kanjiText = wordData.kanji[0].text;
        const kanaText = wordData.kana[0].text;
        let translationText = wordData.sense[0].gloss[0].text;
    
        // Check for parentheses in the text and split if necessary
        translationText = translationText.replace(/ \(([^)]+)\)/, '<br>($1)');
        
        front.innerHTML = `<p class="kanji">${kanjiText}</p>`;
        back.innerHTML = `<p class="kana">${kanaText}<br>${translationText}</p>`;
        
        const card = document.querySelector('.card');
        card.style.transform = 'rotateY(0deg)';
    }

    function updateXpDisplay() {
        const xpDisplay = document.getElementById('xpDisplay');
        xpDisplay.textContent = `XP: ${xp}`;
    }

    function showFeedbackAnimation(targetElement, color, feedbackText, isCorrect) {
        const textElement = document.createElement('div');
        textElement.textContent = feedbackText;
        textElement.style.position = 'fixed';
        textElement.style.left = '50%';
        textElement.style.bottom = '20%';
        textElement.style.transform = 'translate(-50%, 0) scale(0)';
        textElement.style.fontSize = '4rem';
        textElement.style.fontWeight = 'bold';
        textElement.style.color = color;
        textElement.style.opacity = '0';
        textElement.style.zIndex = '1000';
        document.body.appendChild(textElement);

        anime({
            targets: textElement,
            scale: [0, 2],
            opacity: [1, 0],
            easing: 'easeOutSine',
            duration: 2000,
            complete: function() {
                document.body.removeChild(textElement);
            }
        });

    }

    loadWords();
    updateXpDisplay();
});
