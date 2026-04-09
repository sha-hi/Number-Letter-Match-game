// Data
const arabicAlphabet = [
    { letter: 'أ', number: 1 }, { letter: 'ب', number: 2 }, { letter: 'ت', number: 3 },
    { letter: 'ث', number: 4 }, { letter: 'ج', number: 5 }, { letter: 'ح', number: 6 },
    { letter: 'خ', number: 7 }, { letter: 'د', number: 8 }, { letter: 'ذ', number: 9 },
    { letter: 'ر', number: 10 }, { letter: 'ز', number: 11 }, { letter: 'س', number: 12 },
    { letter: 'ش', number: 13 }, { letter: 'ص', number: 14 }, { letter: 'ض', number: 15 },
    { letter: 'ط', number: 16 }, { letter: 'ظ', number: 17 }, { letter: 'ع', number: 18 },
    { letter: 'غ', number: 19 }, { letter: 'ف', number: 20 }, { letter: 'ق', number: 21 },
    { letter: 'ك', number: 22 }, { letter: 'ل', number: 23 }, { letter: 'م', number: 24 },
    { letter: 'ن', number: 25 }, { letter: 'هـ', number: 26 }, { letter: 'و', number: 27 },
    { letter: 'ي', number: 28 }
];

// State
let playerName = '';
let currentLevelVal = '1';
let score = 0;
let wrongAttempts = 0;
let timeSeconds = 0;
let timerInterval = null;
let gameStarted = false;

let currentLetters = [];
let selectedItem = null;
let matchesCompletedLevel = 0;
let totalMatchesRequiredLevel = 7;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const endScreen = document.getElementById('end-screen');

const startBtn = document.getElementById('start-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const endEarlyBtn = document.getElementById('end-early-btn');
const playerNameInput = document.getElementById('player-name');
const levelSelect = document.getElementById('level-select');
const pastScoresContainer = document.getElementById('past-scores-container');
const pastScoresList = document.getElementById('past-scores-list');

const dispName = document.getElementById('display-name');
const dispLevel = document.getElementById('display-level');
const dispTime = document.getElementById('display-time');
const dispScore = document.getElementById('display-score');
const dispWrong = document.getElementById('display-wrong');

const lettersContainer = document.getElementById('letters-container');
const numbersContainer = document.getElementById('numbers-container');

// Audio
const soundCorrect = document.getElementById('sound-correct');
const soundWrong = document.getElementById('sound-wrong');
const soundWin = document.getElementById('sound-win');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadPastScores();
});

startBtn.addEventListener('click', startGame);
playAgainBtn.addEventListener('click', () => {
    endScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
    playerNameInput.value = '';
    loadPastScores();
});
endEarlyBtn.addEventListener('click', () => {
    endGame();
});

function loadPastScores() {
    const scores = JSON.parse(localStorage.getItem('arabicGameScoresKids') || '[]');
    if (scores.length > 0) {
        pastScoresContainer.classList.remove('hidden');
        pastScoresList.innerHTML = scores.map(s => 
            `<div class="score-item">
                <span>👤 ${s.name} <small>(Lvl ${s.level})</small></span>
                <span>⭐ ${s.score} pts / ⏱️ ${s.time}s</span>
            </div>`
        ).join('');
    } else {
        pastScoresContainer.classList.add('hidden');
    }
}

function saveScore() {
    // Only save if some interactions happened
    if (score === 0 && timeSeconds === 0) return;

    const scores = JSON.parse(localStorage.getItem('arabicGameScoresKids') || '[]');
    scores.push({
        name: playerName || 'Kid',
        score: score,
        time: timeSeconds,
        level: currentLevelVal
    });
    
    // Sort by best score descending, then least time ascending
    scores.sort((a, b) => b.score - a.score || a.time - b.time);

    // Keep only last 3 top scores
    if (scores.length > 3) {
        scores.length = 3;
    }
    
    localStorage.setItem('arabicGameScoresKids', JSON.stringify(scores));
}

function startGame() {
    playerName = playerNameInput.value.trim() || 'Kid';
    dispName.textContent = playerName;
    
    currentLevelVal = levelSelect.value;
    dispLevel.textContent = getLevelDisplayName(currentLevelVal);
    
    score = 0;
    wrongAttempts = 0;
    timeSeconds = 0;
    gameStarted = false;
    dispScore.textContent = score;
    dispWrong.textContent = wrongAttempts;
    dispTime.textContent = '0s';
    
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    clearInterval(timerInterval);

    loadLevel(currentLevelVal);
}

function getLevelDisplayName(val) {
    switch (val) {
        case '1': return '1';
        case '2': return '2';
        case 'upto2': return 'Up to 2';
        case '3': return '3';
        case 'upto3': return 'Up to 3';
        case '4': return '4';
        case 'upto4': return 'Up to 4';
        case '5': return 'Ultimate';
        default: return '1';
    }
}

function loadLevel(level) {
    matchesCompletedLevel = 0;
    
    let levelData = [];
    
    if (level === '1') {
        levelData = arabicAlphabet.slice(0, 7);
        totalMatchesRequiredLevel = 7;
    } else if (level === '2') {
        levelData = arabicAlphabet.slice(7, 14);
        totalMatchesRequiredLevel = 7;
    } else if (level === 'upto2') {
        const pool = [...arabicAlphabet.slice(0, 14)].sort(() => 0.5 - Math.random());
        levelData = pool.slice(0, 7);
        totalMatchesRequiredLevel = 7;
    } else if (level === '3') {
        levelData = arabicAlphabet.slice(14, 21);
        totalMatchesRequiredLevel = 7;
    } else if (level === 'upto3') {
        const pool = [...arabicAlphabet.slice(0, 21)].sort(() => 0.5 - Math.random());
        levelData = pool.slice(0, 7);
        totalMatchesRequiredLevel = 7;
    } else if (level === '4') {
        levelData = arabicAlphabet.slice(21, 28);
        totalMatchesRequiredLevel = 7;
    } else if (level === 'upto4') {
        const pool = [...arabicAlphabet.slice(0, 28)].sort(() => 0.5 - Math.random());
        levelData = pool.slice(0, 7);
        totalMatchesRequiredLevel = 7;
    } else if (level === '5') {
        // Level 5: 10 random letters from entire alphabet
        const pool = [...arabicAlphabet].sort(() => 0.5 - Math.random());
        levelData = pool.slice(0, 10);
        totalMatchesRequiredLevel = 10;
    }

    currentLetters = levelData;

    // Shuffle arrays for display
    const shuffledLetters = [...levelData].sort(() => 0.5 - Math.random());
    const shuffledNumbers = [...levelData].sort(() => 0.5 - Math.random());

    lettersContainer.innerHTML = '';
    numbersContainer.innerHTML = '';

    shuffledLetters.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'game-btn arabic';
        btn.textContent = item.letter;
        btn.dataset.val = item.number;
        btn.addEventListener('click', () => handleItemClick(btn, 'letter'));
        lettersContainer.appendChild(btn);
    });

    shuffledNumbers.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'game-btn';
        btn.textContent = item.number;
        btn.dataset.val = item.number;
        btn.addEventListener('click', () => handleItemClick(btn, 'number'));
        numbersContainer.appendChild(btn);
    });

    selectedItem = null;
}

function playSound(audioEl) {
    if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(e => console.log('Audio play prevented', e));
    }
}

function handleItemClick(btn, type) {
    if (btn.classList.contains('correct') || btn.classList.contains('disabled')) return;
    
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timeSeconds++;
            dispTime.textContent = timeSeconds + 's';
        }, 1000);
    }
    
    if (!selectedItem) {
        btn.classList.add('selected');
        selectedItem = { btn, type };
        return;
    }
    
    if (selectedItem.type === type) {
        if (selectedItem.btn === btn) {
            btn.classList.remove('selected');
            selectedItem = null;
        } else {
            selectedItem.btn.classList.remove('selected');
            btn.classList.add('selected');
            selectedItem = { btn, type };
        }
        return;
    }

    const expectedVal = selectedItem.btn.dataset.val;
    const clickedVal = btn.dataset.val;

    if (expectedVal === clickedVal) {
        playSound(soundCorrect);
        selectedItem.btn.classList.remove('selected');
        selectedItem.btn.classList.add('correct');
        btn.classList.add('correct');
        selectedItem = null;
        
        score += 10;
        dispScore.textContent = score;
        matchesCompletedLevel++;

        if (matchesCompletedLevel === totalMatchesRequiredLevel) {
            setTimeout(endGame, 800);
        }
    } else {
        playSound(soundWrong);
        btn.classList.add('error');
        selectedItem.btn.classList.add('error');
        score = Math.max(0, score - 2);
        wrongAttempts++;
        dispScore.textContent = score;
        dispWrong.textContent = wrongAttempts;

        setTimeout(() => {
            btn.classList.remove('error');
            if (selectedItem) selectedItem.btn.classList.remove('error');
        }, 400);
    }
}

function endGame() {
    clearInterval(timerInterval);
    if(matchesCompletedLevel === totalMatchesRequiredLevel) {
        playSound(soundWin);
    }
    
    saveScore();
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-time').textContent = timeSeconds + 's';

    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
}
