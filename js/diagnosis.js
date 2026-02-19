/**
 * diagnosis.js
 * 占い型7問診断 — 質問表示・スコア加算・タイプ判定
 */
const Diagnosis = (() => {
  let currentQ = 0;
  let scores = {};

  function resetScores() {
    scores = {};
    App.state.types.forEach(t => { scores[t.id] = 0; });
  }

  function start() {
    currentQ = 0;
    resetScores();
    renderQuestion();
  }

  function renderQuestion() {
    const questions = App.state.questions;
    if (currentQ >= questions.length) {
      finishDiagnosis();
      return;
    }

    const q = questions[currentQ];
    const area = document.getElementById('diagnosis-card-area');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    // Update progress
    const progress = ((currentQ + 1) / questions.length) * 100;
    progressFill.style.width = progress + '%';
    progressFill.parentElement.setAttribute('aria-valuenow', currentQ + 1);
    progressText.textContent = `${currentQ + 1} / ${questions.length}`;

    // Build card
    const card = document.createElement('div');
    card.className = 'diagnosis-card';
    card.innerHTML = `
      <p class="diagnosis-question">${q.text}</p>
      <div class="diagnosis-choices" role="radiogroup" aria-label="選択肢">
        ${q.choices.map((c, i) => `
          <button class="diagnosis-choice" 
                  data-index="${i}" 
                  role="radio" 
                  aria-checked="false"
                  tabindex="${i === 0 ? 0 : -1}">
            ${c.text}
          </button>
        `).join('')}
      </div>
    `;

    // Replace content
    area.innerHTML = '';
    area.appendChild(card);

    // Choice handlers
    const choices = card.querySelectorAll('.diagnosis-choice');
    choices.forEach((btn, i) => {
      btn.addEventListener('click', () => {
        // Visual feedback
        choices.forEach(c => {
          c.classList.remove('is-selected');
          c.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('is-selected');
        btn.setAttribute('aria-checked', 'true');

        // Add scores
        const choiceData = q.choices[i];
        if (choiceData.scores) {
          Object.entries(choiceData.scores).forEach(([typeId, pts]) => {
            scores[typeId] = (scores[typeId] || 0) + pts;
          });
        }

        // Next question with delay for animation
        setTimeout(() => {
          currentQ++;
          renderQuestion();
        }, 350);
      });

      // Keyboard navigation
      btn.addEventListener('keydown', (e) => {
        let nextIdx = i;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          nextIdx = (i + 1) % choices.length;
          e.preventDefault();
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          nextIdx = (i - 1 + choices.length) % choices.length;
          e.preventDefault();
        }
        if (nextIdx !== i) {
          choices[nextIdx].focus();
          choices.forEach((c, ci) => c.tabIndex = ci === nextIdx ? 0 : -1);
        }
      });
    });
  }

  function finishDiagnosis() {
    // Find top type (with random tiebreaker for fun)
    const sortedTypes = Object.entries(scores)
      .sort((a, b) => {
        if (b[1] !== a[1]) return b[1] - a[1];
        return Math.random() - 0.5; // Random tiebreaker
      });

    const topTypeId = sortedTypes[0][0];
    const secondTypeId = sortedTypes.length > 1 ? sortedTypes[1][0] : null;

    const topType = App.getTypeById(topTypeId);
    const secondType = secondTypeId ? App.getTypeById(secondTypeId) : null;

    if (topType) {
      App.showScreen('screen-result');
      Result.showDiagnosis(topType, secondType);
    }
  }

  return { start };
})();
