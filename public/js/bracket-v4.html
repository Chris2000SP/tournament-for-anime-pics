        let participants = [];
        let bracket = [];
        let currentRound = 0;
        let currentMatchIndex = 0;
        let totalMatchesPlayed = 0;
        let draggedElement = null;

        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const participantsGrid = document.getElementById('participantsGrid');
        const participantsCount = document.getElementById('participantsCount');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const loadingIndicator = document.getElementById('loadingIndicator');
        const startBtn = document.getElementById('startBtn');
        const setupPhase = document.getElementById('setupPhase');
        const tournamentPhase = document.getElementById('tournamentPhase');
        const matchContainer = document.getElementById('matchContainer');
        const currentMatchDiv = document.getElementById('currentMatch');
        const roundTitle = document.getElementById('roundTitle');
        const winnerDisplay = document.getElementById('winnerDisplay');
        const winnerCard = document.getElementById('winnerCard');
        const resetBtn = document.getElementById('resetBtn');
        const matchNumber = document.getElementById('matchNumber');
        const totalMatches = document.getElementById('totalMatches');
        const remainingParticipants = document.getElementById('remainingParticipants');

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

        clearAllBtn.addEventListener('click', () => {
            if (confirm('Wirklich alle Teilnehmer entfernen?')) {
                participants = [];
                renderParticipants();
                updateStartButton();
            }
        });

        async function handleFiles(e) {
            const files = Array.from(e.target.files);
            
            if (files.length === 0) return;
            
            loadingIndicator.style.display = 'block';
            
            for (const file of files) {
                if (file.type.startsWith('image/')) {
                    try {
                        const dataUrl = await readFileAsDataURL(file);
                        participants.push({
                            id: Date.now() + Math.random(),
                            name: file.name,
                            image: dataUrl
                        });
                        
                        // Render nach jedem 10. Bild für bessere Performance
                        if (participants.length % 10 === 0) {
                            renderParticipants();
                            updateStartButton();
                            await sleep(10); // Kurze Pause für UI-Update
                        }
                    } catch (error) {
                        console.error('Fehler beim Laden von', file.name, error);
                    }
                }
            }
            
            loadingIndicator.style.display = 'none';
            renderParticipants();
            updateStartButton();
            fileInput.value = '';
        }

        function readFileAsDataURL(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        function sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
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

            participantsCount.textContent = `${participants.length} Teilnehmer`;
            clearAllBtn.style.display = participants.length > 0 ? 'block' : 'none';
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
                const totalMatchesCount = participants.length - 1;
                startBtn.textContent = `Tournament starten (${participants.length} Teilnehmer, ${totalMatchesCount} Matches)`;
            } else {
                startBtn.textContent = 'Mindestens 2 Bilder benötigt';
            }
        }

        startBtn.addEventListener('click', startTournament);

        function startTournament() {
            setupPhase.classList.add('hidden');
            tournamentPhase.style.display = 'block';
            
            bracket = [participants.slice()];
            currentRound = 0;
            currentMatchIndex = 0;
            totalMatchesPlayed = 0;
            
            const totalMatchesCount = participants.length - 1;
            totalMatches.textContent = totalMatchesCount;
            
            showNextMatch();
        }

        function showNextMatch() {
            const currentRoundParticipants = bracket[currentRound];
            
            if (currentMatchIndex >= currentRoundParticipants.length) {
                if (bracket[currentRound].length === 1) {
                    showWinner(bracket[currentRound][0]);
                    return;
                }
                
                currentRound++;
                currentMatchIndex = 0;
                bracket[currentRound] = [];
                showNextMatch();
                return;
            }

            const participant1 = currentRoundParticipants[currentMatchIndex];
            const participant2 = currentRoundParticipants[currentMatchIndex + 1];

            if (!participant2) {
                bracket[currentRound + 1] = bracket[currentRound + 1] || [];
                bracket[currentRound + 1].push(participant1);
                currentMatchIndex += 2;
                showNextMatch();
                return;
            }

            const roundName = getRoundName(currentRoundParticipants.length);
            roundTitle.textContent = roundName;

            matchNumber.textContent = totalMatchesPlayed + 1;
            remainingParticipants.textContent = currentRoundParticipants.length;

            currentMatchDiv.innerHTML = `
                <div class="competitor" onclick="selectWinner(${currentMatchIndex})">
                    <img src="${participant1.image}" alt="${participant1.name}">
                    <div class="competitor-name">${participant1.name}</div>
                </div>
                <div class="vs-divider">VS</div>
                <div class="competitor" onclick="selectWinner(${currentMatchIndex + 1})">
                    <img src="${participant2.image}" alt="${participant2.name}">
                    <div class="competitor-name">${participant2.name}</div>
                </div>
            `;
        }

        function selectWinner(index) {
            const winner = bracket[currentRound][index];
            
            bracket[currentRound + 1] = bracket[currentRound + 1] || [];
            bracket[currentRound + 1].push(winner);
            
            currentMatchIndex += 2;
            totalMatchesPlayed++;
            showNextMatch();
        }

        function getRoundName(participantsCount) {
            if (participantsCount === 2) return 'Finale';
            if (participantsCount === 4) return 'Halbfinale';
            if (participantsCount === 8) return 'Viertelfinale';
            if (participantsCount === 16) return 'Achtelfinale';
            return `Runde ${currentRound + 1} (${participantsCount} Teilnehmer)`;
        }

        function showWinner(winner) {
            matchContainer.classList.add('hidden');
            winnerDisplay.classList.remove('hidden');
            
            winnerCard.innerHTML = `
                <img src="${winner.image}" alt="${winner.name}">
                <h3>${winner.name}</h3>
                <p style="margin-top: 10px; font-size: 1.1em;">
                    🏆 Sieger nach ${totalMatchesPlayed} Matches
                </p>
            `;
        }

        resetBtn.addEventListener('click', () => {
            participants = [];
            bracket = [];
            currentRound = 0;
            currentMatchIndex = 0;
            totalMatchesPlayed = 0;
            
            setupPhase.classList.remove('hidden');
            tournamentPhase.style.display = 'none';
            matchContainer.classList.remove('hidden');
            winnerDisplay.classList.add('hidden');
            
            renderParticipants();
            updateStartButton();
        });