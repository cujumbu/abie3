export const createQuiz = (question, options) => {
  const quizId = `quiz-${Math.random().toString(36).substring(2, 9)}`;
  
  // Clean up options and determine correct answer
  const cleanOptions = options.map(option => ({
    text: option.text.replace(/^\*?\s*-\s*|\*\s*-\s*/, '').trim(),
    isCorrect: option.text.startsWith('*')
  }));

  return `
    <div class="quiz-container my-8 p-6 bg-white rounded-lg shadow-lg max-w-3xl mx-auto">
      <h3 class="text-xl font-bold mb-4">${question}</h3>
      <div class="space-y-3" id="${quizId}-options">
        ${cleanOptions.map(option => `
          <button
            type="button"
            class="quiz-option w-full text-left p-4 rounded border hover:bg-blue-50 transition-colors"
            data-correct="${option.isCorrect}"
            onclick="handleQuizAnswer(this, '${quizId}')"
          >${option.text}</button>
        `).join('')}
      </div>
      <div id="${quizId}-feedback" class="mt-4 hidden"></div>
    </div>
  `;
};