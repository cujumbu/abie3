// Flashcard Component Generator
export const createFlashcards = (cards) => {
  const flashcardId = `flashcard-${Math.random().toString(36).substring(2, 9)}`;
  
  const cardElements = cards.map((card, index) => `
    <div class="flashcard" data-index="${index}">
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <p class="text-lg">${card.question}</p>
        </div>
        <div class="flashcard-back">
          <p class="text-lg">${card.answer}</p>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <div class="flashcards-container my-8 p-6 bg-white rounded-lg shadow-lg">
      <div class="text-center mb-6">
        <h3 class="text-xl font-bold mb-2">Review Key Concepts</h3>
        <p class="text-gray-600">Click cards to flip them</p>
      </div>
      
      <div id="${flashcardId}" class="flashcards-deck">
        ${cardElements}
      </div>
      
      <div class="flex justify-center gap-4 mt-6">
        <button onclick="previousCard('${flashcardId}')" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
          Previous
        </button>
        <button onclick="nextCard('${flashcardId}')" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Next
        </button>
      </div>
    </div>

    <style>
      .flashcards-deck {
        perspective: 1000px;
        min-height: 200px;
        position: relative;
      }
      
      .flashcard {
        position: absolute;
        width: 100%;
        height: 200px;
        transform-style: preserve-3d;
        transition: transform 0.6s;
        cursor: pointer;
        display: none;
      }
      
      .flashcard.active {
        display: block;
      }
      
      .flashcard.flipped {
        transform: rotateY(180deg);
      }
      
      .flashcard-inner {
        position: relative;
        width: 100%;
        height: 100%;
        text-align: center;
        transform-style: preserve-3d;
      }
      
      .flashcard-front,
      .flashcard-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        border: 2px solid #e5e7eb;
        border-radius: 0.5rem;
        background: #f9fafb;
      }
      
      .flashcard-back {
        transform: rotateY(180deg);
        background: #f0f9ff;
      }
    </style>

    <script>
      document.addEventListener('DOMContentLoaded', () => {
        initializeFlashcards('${flashcardId}');
      });

      function initializeFlashcards(deckId) {
        const deck = document.getElementById(deckId);
        const cards = deck.querySelectorAll('.flashcard');
        if (cards.length > 0) {
          cards[0].classList.add('active');
        }

        cards.forEach(card => {
          card.addEventListener('click', () => {
            card.classList.toggle('flipped');
          });
        });
      }

      function nextCard(deckId) {
        const deck = document.getElementById(deckId);
        const cards = deck.querySelectorAll('.flashcard');
        let activeIndex = -1;

        cards.forEach((card, index) => {
          if (card.classList.contains('active')) {
            activeIndex = index;
            card.classList.remove('active', 'flipped');
          }
        });

        const nextIndex = activeIndex + 1 < cards.length ? activeIndex + 1 : 0;
        cards[nextIndex].classList.add('active');
      }

      function previousCard(deckId) {
        const deck = document.getElementById(deckId);
        const cards = deck.querySelectorAll('.flashcard');
        let activeIndex = -1;

        cards.forEach((card, index) => {
          if (card.classList.contains('active')) {
            activeIndex = index;
            card.classList.remove('active', 'flipped');
          }
        });

        const prevIndex = activeIndex - 1 >= 0 ? activeIndex - 1 : cards.length - 1;
        cards[prevIndex].classList.add('active');
      }
    </script>
  `;
};
