        let participants = [];
        let bracketData = [];
        let currentMatch = null;
        let draggedElement = null;

        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const participantsGrid = document.getElementById('participantsGrid');
        const startBtn = document.getElementById('startBtn');
        const setupPhase = document.getElementById('setupPhase');
        const tournamentPhase = document.getElementById('tournamentPhase');
        const bracket = document.getElementById('bracket');
        const currentMatchIndicator = document.getElementById('currentMatchIndicator');
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
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        participants.push({
                            id: Date.now() + Math.random(),
                            name: file.name,
                            image: event.target.result
                        });
                        renderParticipants();
                        updateStartButton();
                    };
                    reader.readAsDataURL(file);
                }
            });
            fileInput.value = '';
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

        function updateStartButton() {
            startBtn.disabled = participants.length < 2;
            if (participants.length >= 2) {
                startBtn.textContent = `Tournament starten (${participants.length} Teilnehmer)`;
            } else {
                startBtn.textContent = 'Mindestens 2 Bilder benötigt';
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
            const numRounds = Math.ceil(Math.log2(numParticipants));
            const totalSlots = Math.pow(2, numRounds);
            
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

        function renderBracket() {
            bracket.innerHTML = '';
            
            const numRounds = bracketData.length;
            
            for (let round = 0; round < numRounds; round++) {
                const column = document.createElement('div');
                column.className = round === numRounds - 1 ? 'bracket-column winner-column' : 'bracket-column';
                
                const header = document.createElement('div');
                header.className = 'round-header';
                header.textContent = getRoundName(round, numRounds);
                column.appendChild(header);
                
                const roundMatches = bracketData[round];
                const matchPairsCount = Math.ceil(roundMatches.length / 2);
                
                for (let i = 0; i < matchPairsCount; i++) {
                    const matchPair = document.createElement('div');
                    matchPair.className = 'match-pair';
                    
                    const idx1 = i * 2;
                    const idx2 = i * 2 + 1;
                    
                    if (roundMatches[idx1]) {
                        matchPair.appendChild(createBracketItem(roundMatches[idx1], round, idx1));
                    }
                    
                    if (roundMatches[idx2]) {
                        matchPair.appendChild(createBracketItem(roundMatches[idx2], round, idx2));
                    }
                    
                    column.appendChild(matchPair);
                }
                
                bracket.appendChild(column);
            }
        }

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
            if (matchesInRound === 1) return 'Finale';
            if (matchesInRound === 2) return 'Halbfinale';
            if (matchesInRound === 4) return 'Viertelfinale';
            return `Runde ${round + 1}`;
        }

        function findNextMatch() {
            // Durchlaufe alle Runden einschließlich des Finals
            for (let round = 0; round < bracketData.length; round++) {
                const roundData = bracketData[round];
                
                for (let i = 0; i < roundData.length; i += 2) {
                    const item1 = roundData[i];
                    const item2 = roundData[i + 1];
                    
                    // Überspringe leere Paare
                    if (!item1 && !item2) continue;
                    
                    // Prüfe ob bereits ein Gewinner existiert
                    const hasWinner = (item1 && item1.winner) || (item2 && item2.winner);
                    
                    // Wenn kein Gewinner und mindestens ein Teilnehmer, ist dies das nächste Match
                    if (!hasWinner && ((item1 && item1.participant) || (item2 && item2.participant))) {
                        currentMatch = { round, index1: i, index2: i + 1 };
                        highlightCurrentMatch();
                        return;
                    }
                }
            }
            
            // Kein offenes Match mehr gefunden - Tournament ist beendet
            currentMatch = null;
            currentMatchIndicator.textContent = '🎉 Tournament beendet!';
        }

        function highlightCurrentMatch() {
            document.querySelectorAll('.bracket-item').forEach(item => {
                item.classList.remove('pending', 'clickable');
                item.onclick = null;
            });
            
            if (!currentMatch) return;
            
            const { round, index1, index2 } = currentMatch;
            const item1 = bracketData[round][index1];
            const item2 = bracketData[round][index2];
            
            const items = document.querySelectorAll('.bracket-item');
            items.forEach(item => {
                const itemRound = parseInt(item.dataset.round);
                const itemIndex = parseInt(item.dataset.index);
                
                if (itemRound === round && (itemIndex === index1 || itemIndex === index2)) {
                    if ((itemIndex === index1 && item1 && item1.participant) ||
                        (itemIndex === index2 && item2 && item2.participant)) {
                        item.classList.add('pending', 'clickable');
                        item.onclick = () => selectWinner(itemRound, itemIndex);
                    }
                }
            });
            
            const roundName = getRoundName(round, bracketData.length);
            currentMatchIndicator.textContent = `⚔️ Aktuelles Match: ${roundName}`;
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
            
            renderBracket();
            findNextMatch();
        }

        resetBtn.addEventListener('click', () => {
            participants = [];
            bracketData = [];
            currentMatch = null;
            
            setupPhase.classList.remove('hidden');
            tournamentPhase.style.display = 'none';
            
            renderParticipants();
            updateStartButton();
        });