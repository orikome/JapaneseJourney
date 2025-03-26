export class UIManager {
    static placeholderText = '入力してください';
    
    static initializeBackground() {
        const primaryColor = localStorage.getItem('primaryGradientColor') || '#121212';
        const secondaryColor = '#251c2e';
        document.body.style.background = `linear-gradient(to bottom right, ${primaryColor}, ${secondaryColor})`;
    }

    static displayWord(wordData) {
        const front = document.querySelector('.card .front');
        const back = document.querySelector('.card .back');
        const kanjiText = wordData.kanji[0].text;
        const kanaText = wordData.kana[0].text;
        let translationText = this.formatTranslation(wordData.sense[0].gloss[0].text);
        
        front.innerHTML = `<p class="kanji">${kanjiText}</p>`;
        back.innerHTML = `<p class="kana">${kanaText}<br>${translationText}</p>`;
        
        const card = document.querySelector('.card');
        card.style.transform = 'rotateY(0deg)';
    }

    static formatTranslation(text) {
        return text.replace(/ \(([^)]+)\)/, '<br>($1)');
    }

    static updateXpDisplay(xp) {
        const xpDisplay = document.getElementById('xpDisplay');
        xpDisplay.textContent = `XP: ${xp}`;
    }

    static adjustFontSize() {
        const cards = document.querySelectorAll('.card-container .card');
        cards.forEach(card => {
            const containerWidth = card.offsetWidth - 20;
            const containerHeight = card.offsetHeight - 20;
    
            ['front', 'back'].forEach(side => {
                const element = card.querySelector(`.${side}`);
                if (!element) return;
                this.adjustElementFontSize(element, containerWidth, containerHeight);
            });
        });
    }

    static adjustElementFontSize(element, containerWidth, containerHeight) {
        let fontSize = 80;
        const tempElement = document.createElement('div');
        tempElement.style.fontWeight = 'bold';
        tempElement.style.position = 'absolute';
        tempElement.style.visibility = 'hidden';
        tempElement.style.width = 'max-content';
        tempElement.innerHTML = element.innerHTML.trim();
        document.body.appendChild(tempElement);

        fontSize = this.calculateOptimalFontSize(tempElement, containerWidth, containerHeight, fontSize);
        element.style.fontSize = `${fontSize}px`;
        document.body.removeChild(tempElement);
    }

    static calculateOptimalFontSize(element, maxWidth, maxHeight, startSize) {
        let fontSize = startSize;
        for (let i = 0; i < 50 && fontSize > 12; i++) {
            element.style.fontSize = `${fontSize}px`;
            if (element.offsetWidth <= maxWidth && element.offsetHeight <= maxHeight) {
                break;
            }
            fontSize -= 5;
            if (fontSize <= 12 + 5) {
                fontSize -= 1;
            }
        }
        return fontSize;
    }

    static setInputPlaceholder(textInputArea) {
        textInputArea.innerHTML = `<span class="placeholder">${this.placeholderText}</span>`;
    }

    static clearInput(textInputArea) {
        textInputArea.innerHTML = '';
    }
}