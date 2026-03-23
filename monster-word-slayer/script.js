(function () {
  var setupForm = document.getElementById('setupForm');
  var wordsInput = document.getElementById('wordsInput');
  var monsterNameInput = document.getElementById('monsterNameInput');

  var setupCard = document.getElementById('setupCard');
  var battleArea = document.getElementById('battleArea');
  var victoryCard = document.getElementById('victoryCard');

  var monsterNameEl = document.getElementById('monsterName');
  var hpLabel = document.getElementById('hpLabel');
  var hpBar = document.getElementById('hpBar');

  var currentWordEl = document.getElementById('currentWord');
  var writesCountEl = document.getElementById('writesCount');
  var wroteWordBtn = document.getElementById('wroteWordBtn');
  var masteredToggle = document.getElementById('masteredToggle');

  var diceHint = document.getElementById('diceHint');
  var damageInput = document.getElementById('damageInput');
  var attackBtn = document.getElementById('attackBtn');
  var attackError = document.getElementById('attackError');

  var battleLog = document.getElementById('battleLog');
  var playAgainBtn = document.getElementById('playAgainBtn');

  var state = {
    words: [],
    currentWordIndex: 0,
    writesForCurrentWord: 0,
    monsterMaxHP: 0,
    monsterCurrentHP: 0,
    monsterName: ''
  };

  function parseWords(raw) {
    return raw
      .split(',')
      .map(function (word) { return word.trim(); })
      .filter(Boolean);
  }

  function pushLog(message) {
    var item = document.createElement('li');
    item.textContent = message;
    battleLog.prepend(item);
  }

  function renderHP() {
    hpLabel.textContent = 'HP: ' + state.monsterCurrentHP + ' / ' + state.monsterMaxHP;
    var percent = state.monsterMaxHP === 0 ? 0 : Math.max(0, (state.monsterCurrentHP / state.monsterMaxHP) * 100);
    hpBar.style.width = percent + '%';
  }

  function renderWordProgress() {
    var word = state.words[state.currentWordIndex] || 'All words complete';
    currentWordEl.textContent = word;
    writesCountEl.textContent = String(state.writesForCurrentWord);

    if (state.currentWordIndex >= state.words.length) {
      wroteWordBtn.disabled = true;
      masteredToggle.disabled = true;
      masteredToggle.checked = false;
      diceHint.textContent = 'All words completed! Finish off the monster with your rolls.';
      return;
    }

    wroteWordBtn.disabled = false;
    masteredToggle.disabled = false;
    updateDiceHint();
  }

  function updateDiceHint() {
    diceHint.textContent = masteredToggle.checked
      ? 'Word mastered: roll 3 physical dice and enter their total (3–18).'
      : 'Roll 1 physical die and enter total damage (1–6).';
  }

  function startSession(words, monsterName) {
    state.words = words;
    state.currentWordIndex = 0;
    state.writesForCurrentWord = 0;
    state.monsterMaxHP = Math.round(words.length * 18);
    state.monsterCurrentHP = state.monsterMaxHP;
    state.monsterName = monsterName || 'Spelling Monster';

    monsterNameEl.textContent = state.monsterName;
    battleLog.innerHTML = '';
    attackError.textContent = '';
    masteredToggle.checked = false;

    setupCard.classList.add('hidden');
    victoryCard.classList.add('hidden');
    battleArea.classList.remove('hidden');

    renderHP();
    renderWordProgress();
    pushLog('A wild ' + state.monsterName + ' appears with ' + state.monsterMaxHP + ' HP.');
  }

  function finishVictory() {
    battleArea.classList.add('hidden');
    victoryCard.classList.remove('hidden');
    pushLog('Victory! The monster has been defeated.');
  }

  setupForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var words = parseWords(wordsInput.value);

    if (words.length === 0) {
      alert('Please enter at least one word.');
      return;
    }

    startSession(words, monsterNameInput.value.trim());
  });

  wroteWordBtn.addEventListener('click', function () {
    if (state.currentWordIndex >= state.words.length) {
      return;
    }

    state.writesForCurrentWord += 1;
    pushLog('Practiced "' + state.words[state.currentWordIndex] + '" (' + state.writesForCurrentWord + '/5).');

    if (state.writesForCurrentWord >= 5) {
      pushLog('Great! Word "' + state.words[state.currentWordIndex] + '" completed. Move to next word.');
      state.currentWordIndex += 1;
      state.writesForCurrentWord = 0;
      masteredToggle.checked = false;
    }

    renderWordProgress();
  });

  masteredToggle.addEventListener('change', updateDiceHint);

  attackBtn.addEventListener('click', function () {
    attackError.textContent = '';
    var rawDamage = Number(damageInput.value);

    if (!Number.isInteger(rawDamage) || rawDamage <= 0) {
      attackError.textContent = 'Please enter a positive whole number for damage.';
      return;
    }

    if (!masteredToggle.checked && rawDamage > 6) {
      attackError.textContent = 'Tip: normal mode is usually 1–6. You can still continue.';
    }

    if (masteredToggle.checked && (rawDamage < 3 || rawDamage > 18)) {
      attackError.textContent = 'Tip: mastered mode is usually 3–18. You can still continue.';
    }

    state.monsterCurrentHP = Math.max(0, state.monsterCurrentHP - rawDamage);
    pushLog('You hit ' + state.monsterName + ' for ' + rawDamage + ' damage!');
    renderHP();

    if (state.monsterCurrentHP <= 0) {
      finishVictory();
    }

    damageInput.value = '';
  });

  playAgainBtn.addEventListener('click', function () {
    setupCard.classList.remove('hidden');
    victoryCard.classList.add('hidden');
    wordsInput.focus();
  });
})();
