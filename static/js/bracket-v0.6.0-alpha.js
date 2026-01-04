let participants = [];
let bracketData = [];
let currentMatch = null;
let draggedElement = null;

const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const participantsGrid = document.getElementById('participantsGrid');
const participantsCount = document.getElementById('participantsCount');
const randomizeBtn = document.getElementById('randomizeBtn');
const startBtn = document.getElementById('startBtn');
const setupPhase = document.getElementById('setupPhase');
const tournamentPhase = document.getElementById('tournamentPhase');
const bracket = document.getElementById('bracket');
const matchOverlay = document.getElementById('matchOverlay');
const matchRoundTitle = document.getElementById('matchRoundTitle');
const matchInfo = document.getElementById('matchInfo');
const matchContent = document.getElementById('matchContent');
const resetBtn = document.getElementById('resetBtn');

// Upload Area Events
uploadArea.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFiles);

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFiles({ target: { files: e.dataTransfer.files } });
});

function handleFiles(e) {
    const files = Array.from(e.target.files);

    let shouldRename = confirm("Senpai, möchtest du deiner Datei einen neuen Namen geben?");

    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            let newName = "";
            let finalName = "";
            // Frag den Nutzer nach einem neuen Namen (optional!)

            if (shouldRename) {
                newName = prompt(`Senpai, wie soll deine Datei heißen? (Aktuell: ${file.name})`, file.name);

                // Wenn der Nutzer etwas eingibt, verwende den neuen Namen
                finalName = newName !== null ? newName.trim() : file.name;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                participants.push({
                    id: Date.now() + Math.random(),
                    name: finalName, // Hier wird der (geänderte) Name verwendet!
                    image: event.target.result
                });
                renderParticipants();
                updateStartButton();
            };
            reader.readAsDataURL(file);
        }
    });

    fileInput.value = ''; // Reset des File-Inputs
}

function renderParticipants() {
    participantsGrid.innerHTML = '';
    participants.forEach((participant, index) => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.draggable = true;
        card.dataset.index = index;

        card.innerHTML = `
            <button class="remove-btn" onclick="removeParticipant(${index})">×</button>
            <img src="${participant.image}" alt="${participant.name}">
            <div class="participant-name">${participant.name}</div>
        `;

        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
        card.addEventListener('dragover', handleDragOver);
        card.addEventListener('drop', handleDrop);

        participantsGrid.appendChild(card);
    });
}

function removeParticipant(index) {
    participants.splice(index, 1);
    renderParticipants();
    updateStartButton();
}

function handleDragStart(e) {
    draggedElement = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedElement = null;
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedElement !== this) {
        const draggedIndex = parseInt(draggedElement.dataset.index);
        const targetIndex = parseInt(this.dataset.index);

        const temp = participants[draggedIndex];
        participants[draggedIndex] = participants[targetIndex];
        participants[targetIndex] = temp;

        renderParticipants();
    }
}

// Randomizer Function
function randomizeParticipants() {
    // Fisher-Yates Shuffle Algorithm
    for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]];
    }
    
    renderParticipants();
    
    // Kleiner visueller Effekt
    participantsGrid.style.animation = 'fadeIn 0.5s';
    setTimeout(() => {
        participantsGrid.style.animation = '';
    }, 500);
}

randomizeBtn.addEventListener('click', randomizeParticipants);

function updateStartButton() {
    const count = participants.length;
    
    // Update Teilnehmerzahl
    participantsCount.textContent = `${count} Teilnehmer`;
    
    randomizeBtn.disabled = count < 2;
    startBtn.disabled = count < 2;
    // Update Buttons
    for (var i = 1; i <= count; i++) {
        if (count >= 2 && count == 2**i) {
            startBtn.textContent = `Tournament starten (${count} Teilnehmer)`;
            randomizeBtn.disabled = count != 2**i;
            startBtn.disabled = count != 2**i;
            break;
        } else {
            startBtn.textContent = `Mindestens 2 Bilder benötigt bzw. falsche Teilnehmerzahl \n
            (${i} Teilnehmer.)`;
            randomizeBtn.disabled = count != 2**i;
            startBtn.disabled = count != 2**i;
        }
    }
}

startBtn.addEventListener('click', startTournament);

function startTournament() {
    setupPhase.classList.add('hidden');
    tournamentPhase.style.display = 'block';
    
    initializeBracket();
    renderBracket();
    findNextMatch();
}

function initializeBracket() {
    const numParticipants = participants.length;
    const numRounds = Math.ceil(Math.log2(numParticipants)) + 1;
    const totalSlots = Math.pow(2, numRounds) / 2;
    
    bracketData = [];
    
    for (let round = 0; round < numRounds; round++) {
        bracketData[round] = [];
    }
    
    for (let i = 0; i < totalSlots; i++) {
        if (i < numParticipants) {
            bracketData[0].push({
                participant: participants[i],
                winner: false,
                loser: false
            });
        } else {
            bracketData[0].push(null);
        }
    }
    
    for (let round = 1; round < numRounds; round++) {
        const matchesInRound = Math.pow(2, numRounds - round - 1);
        for (let i = 0; i < matchesInRound; i++) {
            bracketData[round].push({
                participant: null,
                winner: false,
                loser: false
            });
        }
    }
}

function createBracketItem(match, round, index) {
    const item = document.createElement('div');
    item.className = 'bracket-item';

    if (match.winner) {
        item.classList.add('winner');
    }

    if (index % 2 === 0) {
        item.classList.add('top');
    } else {
        item.classList.add('bottom');
    }

    item.innerHTML = `
        <div class="participant-name">${match.name}</div>
        <img src="${match.image}" class="participant-image">
    `;

    return item;
}

function renderBracket() {
    bracket.innerHTML = '';

    const numRounds = bracketData.length;

    for (let round = 0; round < numRounds; round++) {
        const column = document.createElement('div');
        column.className = round === numRounds - 1 ? 'bracket-column winner-column' : 'bracket-column';
        column.dataset.round = round;

        const header = document.createElement('div');
        header.className = 'round-header';
        header.textContent = getRoundName(round, numRounds);
        column.appendChild(header);

        const roundMatches = bracketData[round];
        const matchPairsCount = Math.ceil(roundMatches.length / 2);

        for (let i = 0; i < matchPairsCount; i++) {
            const matchPair = document.createElement('div');
            matchPair.className = 'match-pair';
            matchPair.dataset.index = i;

            const idx1 = i * 2;
            const idx2 = i * 2 + 1;

            if (roundMatches[idx1]) {
                matchPair.appendChild(createBracketItem(roundMatches[idx1], round, idx1));
            }

            if (roundMatches[idx2]) {
                matchPair.appendChild(createBracketItem(roundMatches[idx2], round, idx2));
            }

            column.appendChild(matchPair);

            // Füge Verbindungen zur nächsten Runde hinzu, wenn nicht die letzte Runde
            if (round < numRounds - 1) {
                const nextRoundMatches = bracketData[round + 1];
                const nextRoundIndex = Math.floor(i / 2);

                if (nextRoundMatches[nextRoundIndex]) {
                    const connector = document.createElement('div');
                    connector.className = `match-connector round-${round}-to-${round + 1}`;
                    matchPair.appendChild(connector);
                }
            }
        }

        bracket.appendChild(column);
    }

    // Füge Verbindungen zwischen den Runden hinzu
    for (let round = 0; round < numRounds - 1; round++) {
        const currentColumn = document.querySelector(`.bracket-column[data-round="${round}"]`);
        const nextColumn = document.querySelector(`.bracket-column[data-round="${round + 1}"]`);
    
        if (currentColumn && nextColumn) {
            const currentMatches = currentColumn.querySelectorAll('.match-pair');
            const nextMatches = nextColumn.querySelectorAll('.match-pair');
    

            const roundConnectorDiv = document.createElement('div');
            roundConnectorDiv.className = `round-connector-div`;
            currentMatches.forEach((match, index) => {
                const nextMatchIndex = Math.floor(index / 2);
                if (nextMatches[nextMatchIndex]) {
                    // Horizontale Linie (obere Hälfte)
                    const horizontalLine = document.createElement('div');
                    horizontalLine.className = `round-connector round-${round}-to-${round + 1}`;
                    currentColumn.appendChild(horizontalLine);
    
                    // Positioniere die horizontale Linie
                    horizontalLine.style.top = `${match.offsetTop + match.offsetHeight / 2}px`;
                    horizontalLine.style.height = '2px';
                    horizontalLine.style.left = `${(currentColumn.offsetLeft + currentColumn.offsetWidth)*0.737}px`;
                    horizontalLine.style.width = `${(nextColumn.offsetLeft - (currentColumn.offsetLeft + currentColumn.offsetWidth))/2}px`;
    
                    //if (index < 1) {
                        // Vertikale Linie (linke Hälfte)
                        const verticalLineLeft = document.createElement('div');
                        verticalLineLeft.className = `round-connector round-${round}-to-${round + 1}`;
                        currentColumn.appendChild(verticalLineLeft);
    
                        // Positioniere die vertikale Linie links
                        verticalLineLeft.style.top = `${match.offsetTop + match.offsetHeight / 2}px`;
                        verticalLineLeft.style.height = `${((nextColumn.offsetTop + nextMatches[nextMatchIndex].offsetTop + nextMatches[nextMatchIndex].offsetHeight) - (match.offsetTop + match.offsetHeight / 2))*1}px`;
                        verticalLineLeft.style.left = `${currentColumn.offsetLeft + currentColumn.offsetWidth}px`;
                        verticalLineLeft.style.width = '2px';
                    //}
                    
                    // Vertikale Linie (rechte Hälfte)
                    const verticalLineRight = document.createElement('div');
                    verticalLineRight.className = `round-connector round-${round}-to-${round + 1}`;
                    currentColumn.appendChild(verticalLineRight);
        
                    // Positioniere die vertikale Linie rechts
                    verticalLineRight.style.top = `${nextColumn.offsetTop + nextMatches[nextMatchIndex].offsetTop + nextMatches[nextMatchIndex].offsetHeight / 2}px`;
                    verticalLineRight.style.height = '2px';
                    verticalLineRight.style.left = `${((currentColumn.offsetLeft + currentColumn.offsetWidth)*0.737)*1.75}px`;
                    verticalLineRight.style.width = `${(nextColumn.offsetLeft - (currentColumn.offsetLeft + currentColumn.offsetWidth))/1.85}px`;
                }
            });
        }
    }
}


//function renderBracket() {
//    bracket.innerHTML = '';
//
//    const numRounds = bracketData.length;
//
//    for (let round = 0; round < numRounds; round++) {
//        const column = document.createElement('div');
//        column.className = round === numRounds - 1 ? 'bracket-column winner-column' : 'bracket-column';
//
//        const header = document.createElement('div');
//        header.className = 'round-header';
//        header.textContent = getRoundName(round, numRounds);
//        column.appendChild(header);
//
//        const roundMatches = bracketData[round];
//        const matchPairsCount = Math.ceil(roundMatches.length / 2);
//
//        for (let i = 0; i < matchPairsCount; i++) {
//            const matchPair = document.createElement('div');
//            matchPair.className = 'match-pair';
//
//            const idx1 = i * 2;
//            const idx2 = i * 2 + 1;
//
//            if (roundMatches[idx1]) {
//                matchPair.appendChild(createBracketItem(roundMatches[idx1], round, idx1));
//            }
//
//            if (roundMatches[idx2]) {
//                matchPair.appendChild(createBracketItem(roundMatches[idx2], round, idx2));
//            }
//
//            column.appendChild(matchPair);
//        }
//
//        bracket.appendChild(column);
//    }
//}

function createBracketItem(data, round, index) {
    const item = document.createElement('div');
    item.className = 'bracket-item';
    
    if (!data || !data.participant) {
        item.classList.add('empty');
        item.textContent = 'BYE';
        return item;
    }
    
    if (data.winner) {
        item.classList.add('winner');
    }
    if (data.loser) {
        item.classList.add('loser');
    }
    
    const participant = data.participant;
    
    if (round === bracketData.length - 1 && data.winner) {
        item.innerHTML = `
            <div class="winner-badge">👑</div>
            <img src="${participant.image}" alt="${participant.name}">
            <div class="bracket-item-name">${participant.name}</div>
        `;
    } else {
        item.innerHTML = `
            <img src="${participant.image}" alt="${participant.name}">
            <div class="bracket-item-name">${participant.name}</div>
        `;
    }
    
    item.dataset.round = round;
    item.dataset.index = index;
    
    return item;
}

function getRoundName(round, totalRounds) {
    const matchesInRound = Math.pow(2, totalRounds - round - 1);
    
    if (round === totalRounds - 1) return '🏆 Gewinner';
    if (matchesInRound === 2) return 'Finale';
    if (matchesInRound === 4) return 'Halbfinale';
    if (matchesInRound === 8) return 'Viertelfinale';
    return `Runde ${round + 1}`;
}

function findNextMatch() {
    for (let round = 0; round < bracketData.length; round++) {
        const roundData = bracketData[round];
        
        for (let i = 0; i < roundData.length; i += 2) {
            const item1 = roundData[i];
            const item2 = roundData[i + 1];
            
            if (!item1 && !item2) continue;
            
            const hasWinner = (item1 && item1.winner) || (item2 && item2.winner);
            
            if (!hasWinner && ((item1 && item1.participant) || (item2 && item2.participant))) {
                currentMatch = { round, index1: i, index2: i + 1 };
                highlightCurrentMatch();
                showMatchOverlay();
                return;
            }
        }
    }
    
    currentMatch = null;
    matchOverlay.classList.remove('active');
}

function highlightCurrentMatch() {
    document.querySelectorAll('.bracket-item').forEach(item => {
        item.classList.remove('current-match');
    });
    
    if (!currentMatch) return;
    
    const { round, index1, index2 } = currentMatch;
    
    const items = document.querySelectorAll('.bracket-item');
    items.forEach(item => {
        const itemRound = parseInt(item.dataset.round);
        const itemIndex = parseInt(item.dataset.index);
        
        if (itemRound === round && (itemIndex === index1 || itemIndex === index2)) {
            item.classList.add('current-match');
        }
    });
}

function showMatchOverlay() {
    if (!currentMatch) return;
    
    const { round, index1, index2 } = currentMatch;
    const item1 = bracketData[round][index1];
    const item2 = bracketData[round][index2];
    
    if (!item1 || !item1.participant || !item2 || !item2.participant) {
        selectWinner(round, index1);
        return;
    }
    
    const roundName = getRoundName(round, bracketData.length);
    matchRoundTitle.textContent = roundName;
    matchInfo.textContent = 'Klicke auf den Gewinner (Du Streamer)';
    
    matchContent.innerHTML = `
        <div class="match-competitor" onclick="selectWinnerFromOverlay(${round}, ${index1})">
            <img src="${item1.participant.image}" alt="${item1.participant.name}">
            <div class="match-competitor-name">${item1.participant.name}</div>
            <div class="match-click-hint">👆 Klick für Sieg</div>
        </div>
        <div class="match-vs">VS</div>
        <div class="match-competitor" onclick="selectWinnerFromOverlay(${round}, ${index2})">
            <img src="${item2.participant.image}" alt="${item2.participant.name}">
            <div class="match-competitor-name">${item2.participant.name}</div>
            <div class="match-click-hint">👆 Klick für Sieg</div>
        </div>
    `;
    
    matchOverlay.classList.add('active');
}

function selectWinnerFromOverlay(round, index) {
    selectWinner(round, index);
}

function selectWinner(round, index) {
    if (!currentMatch || currentMatch.round !== round) return;
    
    const { index1, index2 } = currentMatch;
    const winner = bracketData[round][index];
    const loserIndex = index === index1 ? index2 : index1;
    
    if (!winner || !winner.participant) return;
    
    winner.winner = true;
    
    if (bracketData[round][loserIndex] && bracketData[round][loserIndex].participant) {
        bracketData[round][loserIndex].loser = true;
    }
    
    const nextRound = round + 1;
    const nextIndex = Math.floor(index / 2);
    
    if (nextRound < bracketData.length) {
        bracketData[nextRound][nextIndex] = {
            participant: winner.participant,
            winner: false,
            loser: false
        };
    }
    
    matchOverlay.classList.remove('active');
    
    renderBracket();
    findNextMatch();
}

resetBtn.addEventListener('click', () => {
    participants = [];
    bracketData = [];
    currentMatch = null;
    
    matchOverlay.classList.remove('active');
    setupPhase.classList.remove('hidden');
    tournamentPhase.style.display = 'none';
    
    renderParticipants();
    updateStartButton();
});