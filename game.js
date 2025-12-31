const boardEl = document.getElementById("board");
const taskTextEl = document.getElementById("taskText");
const taskMetaEl = document.getElementById("taskMeta");
const resetBtn = document.getElementById("resetBtn");

const STORAGE_KEY = "nytars_game_v3";

/** 52 brede udfordringer */
const TASKS = [
  "Drik 2 tårer.",
  "Giv 2 tårer til en valgfri spiller.",
  "Alle drikker 1 tåre.",
  "Drik 3 tårer hvis du har grinet de sidste 2 minutter – ellers giv 3.",
  "Den yngste drikker 2 tårer.",
  "Den ældste drikker 2 tårer.",
  "Vælg en makker: I drikker 2 tårer sammen.",
  "Tag 1 tåre for hver person ved bordet (max 6).",
  "Giv 1 tåre til hver af dine naboer.",
  "Alle der har sort tøj på drikker 2 tårer.",
  "Drik 1 tåre – og vælg en spiller der også drikker 1.",
  "Giv 4 tårer fordelt som du vil.",
  "Drik 4 tårer.",
  "Skål med den til venstre. Begge drikker 2 tårer.",
  "Skål med den til højre. Begge drikker 2 tårer.",
  "Byt plads med en valgfri spiller. Begge drikker 1 tåre.",
  "I 1 minut: hver gang nogen siger 'okay' – drik 1 tåre.",
  "I 1 minut: ingen må sige 'ja' eller 'nej'. Første fejl: drik 3 tårer.",
  "Vælg et ord der er forbudt i 5 minutter. Hver gang nogen siger det: drik 1.",
  "Du er dommer i 2 minutter: giv i alt 5 tårer (én ad gangen).",
  "Alle rækker en hånd op. Sidste person drikker 3 tårer.",
  "Ros en valgfri spiller på den mest overdrevne måde. Hvis folk griner: giv 3. Ellers drik 2.",
  "Fortæl en pinlig (men ok) historie. Hvis du nægter: drik 4.",
  "Alle drikker 2 tårer – og du drikker 1 ekstra.",
  "Vælg en “tvilling”: hver gang du drikker, drikker de også 1 (indtil ny runde).",
  "Byt drik med en valgfri spiller (hvis I vil). Begge drikker 1.",
  "Alle stemmer: hvem er mest sandsynligt til at… (du finder på). Vinderen drikker 3.",
  "Sten-saks-papir mod en valgfri spiller. Taber drikker 3, vinder giver 2.",
  "Kig en spiller i øjnene uden at grine i 15 sek. Griner du: drik 3.",
  "Vælg en kategori (film, dyr, byer). I går på skift – første der stopper drikker 3.",
  "Tal i accent i 1 minut. Hvis nogen tager dig i at glemme det: drik 2.",
  "Vælg en spiller: de vælger om du drikker 2 eller giver 2.",
  "Næste spiller drikker 2 ekstra (kæde).",
  "Alle der har telefonen fremme drikker 2 tårer.",
  "Du må pege på én og sige 'drik'. De drikker 2 tårer.",
  "Giv 1 tåre til den der har mindst i glasset.",
  "Hvis du kan rime på 'nytår' på 5 sek: giv 3. Ellers drik 3.",
  "Alle siger en ting de er taknemmelige for. Den første der tøver: drik 2.",
  "Vælg en spiller der skal fortælle en joke. Hvis den er dårlig: de drikker 2. Hvis god: de giver 2.",
  "“Stilleleg” i 20 sek. Første der laver en lyd: drik 3.",
  "BONUS: Du får en ‘redning’. Brug den én gang til at slippe for en opgave (gruppen husker den).",
  "Drik 1 nu. Giv 2 bagefter.",
  "Giv 3 til den mest selvsikre i rummet.",
  "Alle drikker 1 – du giver 1 ekstra til en valgfri.",
  "Drik 5 tårer.",
  "Vælg to personer der skal skåle og drikke 2.",
  "Hvis du har sagt 'jeg er okay' i aften: drik 3, ellers giv 3.",
  "Byt plads to til højre. Alle der flytter drikker 1.",
  "Drik 2 og vælg en der drikker 2.",
  "Giv 5 fordelt som du vil.",
  "Alle drikker 2. Den der sidder tættest på døren drikker 1 ekstra."
];

// Kort-opsætning
const SUITS = [
  { key: "H", symbol: "♥", colorClass: "suit-red" },
  { key: "D", symbol: "♦", colorClass: "suit-red" },
  { key: "C", symbol: "♣", colorClass: "suit-black" },
  { key: "S", symbol: "♠", colorClass: "suit-black" }
];
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildCardIds(){
  const ids = [];
  for (const s of SUITS){
    for (const r of RANKS){
      ids.push(`${r}${s.key}`); // fx "4H"
    }
  }
  return ids;
}

function newRoundState(round){
  const cardIds = buildCardIds();
  const shuffledTasks = shuffle(TASKS);
  const mapping = {};
  cardIds.forEach((id, idx) => mapping[id] = shuffledTasks[idx]);
  return { mapping, used: {}, round };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return newRoundState(1);
    const parsed = JSON.parse(raw);
    if(!parsed.mapping || Object.keys(parsed.mapping).length !== 52){
      return newRoundState(1);
    }
    return parsed;
  }catch{
    return newRoundState(1);
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function renderBoard(){
  boardEl.innerHTML = "";
  const cardIds = buildCardIds();

  for(const id of cardIds){
    const rank = id.slice(0, -1);
    const suitKey = id.slice(-1);
    const suit = SUITS.find(s => s.key === suitKey);

    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "card-tile" + (state.used[id] ? " used" : "");
    tile.dataset.cardId = id;

    tile.innerHTML = `
      <div class="card-rank">${rank}</div>
      <div class="card-suit ${suit.colorClass}">${suit.symbol}</div>
    `;

    tile.addEventListener("click", () => onCardClick(id, suit.symbol, rank));
    boardEl.appendChild(tile);
  }
}

function onCardClick(cardId, suitSymbol, rank){
  const task = state.mapping[cardId];

  state.used[cardId] = true;
  saveState();

  taskTextEl.textContent = task;
  taskMetaEl.textContent = `Kort: ${rank}${suitSymbol} • Runde: ${state.round}`;

  const tile = boardEl.querySelector(`[data-card-id="${cardId}"]`);
  if(tile) tile.classList.add("used");
}

function reshuffleRound(){
  const nextRound = (state.round || 1) + 1;
  state = newRoundState(nextRound);
  saveState();

  taskTextEl.textContent = "Ny runde! Træk et fysisk kort og tryk på det tilsvarende kort.";
  taskMetaEl.textContent = `Runde: ${state.round}`;

  renderBoard();
}

resetBtn.addEventListener("click", reshuffleRound);

// Init board
renderBoard();


// ===== SCOREKORT (6 spillere) =====
const SCORE_KEY = "nytars_scores_v1";
const scoreGrid = document.getElementById("scoreGrid");
const resetScoresBtn = document.getElementById("resetScoresBtn");

let scores = loadScores();

function loadScores(){
  try{
    const raw = localStorage.getItem(SCORE_KEY);
    if(!raw) return Array.from({length: 6}, () => ({ name: "", value: 0 }));
    const parsed = JSON.parse(raw);
    if(!Array.isArray(parsed) || parsed.length !== 6) {
      return Array.from({length: 6}, () => ({ name: "", value: 0 }));
    }
    return parsed.map(p => ({
      name: typeof p.name === "string" ? p.name : "",
      value: Number.isFinite(p.value) ? p.value : 0
    }));
  }catch{
    return Array.from({length: 6}, () => ({ name: "", value: 0 }));
  }
}

function saveScores(){
  localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
}

function renderScores(){
  const rows = scoreGrid.querySelectorAll(".score-row");
  rows.forEach((row) => {
    const i = Number(row.dataset.i);
    const nameInput = row.querySelector(".score-name");
    const valueEl = row.querySelector(".score-value");

    nameInput.value = scores[i].name;
    valueEl.textContent = String(scores[i].value);
  });
}

function clampScore(n){
  // Tillad negative (minuspoint). Vil du stoppe ved 0? Brug: Math.max(0, n)
  return n;
}

scoreGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if(!btn) return;

  const row = e.target.closest(".score-row");
  if(!row) return;

  const i = Number(row.dataset.i);
  if(!Number.isFinite(i)) return;

  if(btn.classList.contains("plus")){
    scores[i].value = clampScore(scores[i].value + 1);
  } else if(btn.classList.contains("minus")){
    scores[i].value = clampScore(scores[i].value - 1);
  } else {
    return;
  }

  saveScores();
  renderScores();
});

scoreGrid.addEventListener("input", (e) => {
  const input = e.target.closest(".score-name");
  if(!input) return;

  const row = e.target.closest(".score-row");
  if(!row) return;

  const i = Number(row.dataset.i);
  scores[i].name = input.value;
  saveScores();
});

resetScoresBtn.addEventListener("click", () => {
  scores = Array.from({length: 6}, () => ({ name: "", value: 0 }));
  saveScores();
  renderScores();
});

// Init score
renderScores();

