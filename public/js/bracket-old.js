// assets/js/bracket.js
// Minimal, skalierbar, klickbare Auswahl, BYE-Auto-Win, optional localStorage

const PARTICIPANTS_JSON = '/data/participants.json';
const STORAGE_KEY = 'tournament_state_v1';

function nextPowerOfTwo(n) {
  return 2 ** Math.ceil(Math.log2(Math.max(1, n)));
}

function loadParticipants() {
  // 1) Wenn Hugo die Daten in die Seite eingebettet hat:
  if (window.PARTICIPANTS) {
    // Stelle sicher, dass ein Array zurückkommt
    return Promise.resolve(Array.isArray(window.PARTICIPANTS) ? window.PARTICIPANTS : (window.PARTICIPANTS.participants || []));
  }

  // 2) Sonst: versuche die statische JSON-Datei zu laden
  return fetch('/data/participants.json')
    .then(res => {
      if (!res.ok) {
        // bessere Fehlermeldung mit Status
        throw new Error('Teilnehmer-Datei nicht gefunden (HTTP ' + res.status + '). Stelle sicher, dass participants.json in /static/data/ liegt oder in die Seite eingebettet ist.');
      }
      return res.json();
    })
    .then(json => json.participants || json || []);
}


// Erzeuge die initialen Rundenstruktur (Array von Runden, jede Runde = Array von Matches)
function buildEmptyBracket(participants) {
  const targetSize = nextPowerOfTwo(participants.length);
  const padded = participants.slice();
  // Fülle mit BYE-Teilnehmern, damit die Anzahl 2^k ist
  while (padded.length < targetSize) {
    padded.push({ name: 'BYE', image: '' });
  }

  const roundsCount = Math.log2(targetSize);
  const rounds = [];

  // Runde 0 (erste Runde) -> Matches aus Paaren
  const firstRound = [];
  for (let i = 0; i < padded.length; i += 2) {
    firstRound.push({
      p1: padded[i],
      p2: padded[i + 1],
      winner: null
    });
  }
  rounds.push(firstRound);

  // weitere Runden initialisieren (leer)
  let matchesThisRound = firstRound.length;
  for (let r = 1; r <= roundsCount - 1; r++) {
    matchesThisRound = Math.ceil(matchesThisRound / 2);
    const emptyRound = [];
    for (let m = 0; m < matchesThisRound; m++) {
      emptyRound.push({ p1: null, p2: null, winner: null });
    }
    rounds.push(emptyRound);
  }

  return rounds;
}

// Speichern / Laden des Bracket-Status (optional)
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Speichern fehlgeschlagen', e);
  }
}
function loadState() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : null;
  } catch (e) {
    return null;
  }
}

// Hilfsfunktion zum Setzen des Siegers und Weiterleiten in die nächste Runde
function setMatchWinner(rounds, roundIndex, matchIndex, winnerPlayer) {
  const match = rounds[roundIndex][matchIndex];
  match.winner = winnerPlayer;

  // Wenn es eine nächste Runde gibt, setze den Spieler dort in p1 oder p2
  if (roundIndex + 1 < rounds.length) {
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const slot = (matchIndex % 2 === 0) ? 'p1' : 'p2';
    rounds[roundIndex + 1][nextMatchIndex][slot] = winnerPlayer;
  }
}

// Rendering
function createPlayerDiv(player, onClick, highlight = false) {
  const div = document.createElement('div');
  div.className = 'player';
  if (highlight) div.classList.add('winner');

  const name = document.createElement('div');
  name.className = 'player-name';
  name.textContent = player ? player.name : '';

  if (player && player.image) {
    const img = document.createElement('img');
    img.src = player.image;
    img.alt = player.name || '';
    img.className = 'player-image';
    div.appendChild(img);
  }

  div.appendChild(name);

  if (onClick && player && player.name !== 'BYE') {
    div.style.cursor = 'pointer';
    div.addEventListener('click', onClick);
  }

  return div;
}

function renderBracket(container, rounds, onStateChange) {
  container.innerHTML = '';
  container.className = 'bracket';

  rounds.forEach((round, rIdx) => {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round';
    roundDiv.dataset.round = rIdx;

    const roundTitle = document.createElement('h3');
    roundTitle.textContent = rIdx === 0 ? 'Runde 1' : `Runde ${rIdx + 1}`;
    roundDiv.appendChild(roundTitle);

    round.forEach((match, mIdx) => {
      const matchDiv = document.createElement('div');
      matchDiv.className = 'match';

      // Wenn p2 fehlt (shouldn't happen because of padding), setze BYE
      const p1 = match.p1 || { name: 'BYE', image: '' };
      const p2 = match.p2 || { name: 'BYE', image: '' };

      // Wenn einer ein BYE ist und der andere existiert -> Auto-Win
      if ((p1.name === 'BYE' && p2.name !== 'BYE') && !match.winner) {
        setMatchWinner(rounds, rIdx, mIdx, p2);
        if (onStateChange) onStateChange();
      } else if ((p2.name === 'BYE' && p1.name !== 'BYE') && !match.winner) {
        setMatchWinner(rounds, rIdx, mIdx, p1);
        if (onStateChange) onStateChange();
      }

      const p1Div = createPlayerDiv(p1, () => {
        setMatchWinner(rounds, rIdx, mIdx, p1);
        if (onStateChange) onStateChange();
      }, match.winner && match.winner.name === p1.name);

      const vsDiv = document.createElement('div');
      vsDiv.className = 'vs';
      vsDiv.textContent = 'VS';

      const p2Div = createPlayerDiv(p2, () => {
        setMatchWinner(rounds, rIdx, mIdx, p2);
        if (onStateChange) onStateChange();
      }, match.winner && match.winner.name === p2.name);

      matchDiv.appendChild(p1Div);
      matchDiv.appendChild(vsDiv);
      matchDiv.appendChild(p2Div);

      roundDiv.appendChild(matchDiv);
    });

    container.appendChild(roundDiv);
  });
}

// Start
(async function init() {
  const container = document.getElementById('bracket');
  if (!container) {
    console.error('Kein #bracket Container gefunden.');
    return;
  }

  const rawParticipants = await loadParticipants().catch(e => {
    container.textContent = 'Fehler beim Laden der Teilnehmer: ' + e.message;
    throw e;
  });

  // Versuche gespeicherten Zustand zu laden
  const saved = loadState();

  let rounds;
  if (saved && saved.rounds) {
    rounds = saved.rounds;
  } else {
    rounds = buildEmptyBracket(rawParticipants);
  }

  // onStateChange: speichere und rendere neu
  function onStateChange() {
    saveState({ rounds });
    renderBracket(container, rounds, onStateChange);
  }

  // Initial render
  renderBracket(container, rounds, onStateChange);

  // Buttons: Reset & Export
  const controls = document.createElement('div');
  controls.className = 'bracket-controls';
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Reset';
  resetBtn.addEventListener('click', () => {
    localStorage.removeItem(STORAGE_KEY);
    rounds = buildEmptyBracket(rawParticipants);
    onStateChange();
  });

  const exportBtn = document.createElement('button');
  exportBtn.textContent = 'Export JSON';
  exportBtn.addEventListener('click', () => {
    const dataStr = JSON.stringify({ rounds }, null, 2);
    const w = window.open();
    w.document.write('<pre>' + escapeHtml(dataStr) + '</pre>');
  });

  controls.appendChild(resetBtn);
  controls.appendChild(exportBtn);
  container.parentNode.insertBefore(controls, container.nextSibling);

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
})();
