export class AnimationManager {
    static animateCardEntrance(card, onBegin) {
        anime({
            targets: card,
            opacity: [0, 1],
            scale: [0.85, 1],
            easing: 'easeOutExpo',
            duration: 1000,
            begin: onBegin
        });
    }

    static animateCharacterInput(charSpan) {
        anime({
            targets: charSpan,
            opacity: [0, 1],
            scale: [3, 1],
            easing: 'easeOutBack',
            duration: 400
        });
    }

    static flipCard(card, onComplete) {
        anime({
            targets: card,
            scale: [{value: 1}, {value: 1.2}, {value: 1, delay: 500}],
            rotateY: {value: '+=180', delay: 300},
            duration: 800,
            easing: 'easeInOutSine',
            complete: onComplete
        });
    }

    static clearInputText(spans) {
        anime({
            targets: spans,
            opacity: [1, 0],
            scale: [1, 0],
            easing: 'easeInOutQuad',
            duration: 400
        });
    }

    static showFeedback(feedbackText, color) {
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
}