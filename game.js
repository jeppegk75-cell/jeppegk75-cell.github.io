const boardEl = document.getElementById("board");
const taskTextEl = document.getElementById("taskText");
const taskMetaEl = document.getElementById("taskMeta");
const resetBtn = document.getElementById("resetBtn");

const STORAGE_KEY = "nytars_game_v3";

/** 52 brede udfordringer */
const TASKS = [
  "Drik 2 tårer.",
  "Giv 2 tårer til en valgfri spiller.",
  "Alle drikker 1 tåre",
  "Drik 3 tårer hvis du har grinet inden for de sidste 2 minutter – ellers giv 3.",
  "Sid med en ske i hånden i 5 minutter eller drik 3 tårer.",
  "Du er din høre sidemands tjener indtil der bliver trukket en 7'er - eller drik 4 tårer.",
  "Du må kun drikke med venstre hånd",
  "Tag 1 tåre for hver person ved bordet.",
  "Fortæl noget om dig selv, som ingen i rummet ved – eller drik 5 tårer.",
  "Du må ikke længere sige medspillernes navne – hver gang du gør det, drikker du 1 tår.",
  "Fortæl hvem dit største crush er (nu eller nogensinde) – eller drik 3 tårer",
  "Giv 4 tårer fordelt som du vil.",
  "Drik 4 tårer.",
  "Gå ud på altanen og råb at du elsker Slidte Dorthe - eller drik 3 tårer",
  "Sid med rykken til indtil der bliver trukket et billedekort.",
  "Vis sidste billede i din kamerarulle – eller drik 2 tårer.",
  "Fortæl om din mest akavede date – eller drik 4 tårer.",
  "Læs sidste besked du sendte højt – eller drik 2 tårer.",
  "Du skal stønne hver gang du hører navne Dorthe i resten af spillet – hver gang du glemmer det, drikker du 2 tårer.",
  "Du er Skålmester og skalm sørge for der bliver skålet - indtil der bliver trukket en 5'er",
  "Du må kun svare med spørgsmål - hver gang du svarer normalt, drikker du 2 tårer.",
  "Ros en valgfri spiller på den mest overdrevne måde. Hvis folk griner: giv 3. Ellers drik 2.",
  "Fortæl en pinlig (men ok) historie. Hvis du nægter: drik 4.",
  "Giv en person et overdrevet kompliment – eller drik 2 tårer.",
  "Giv en person et overdrevet dizz – eller drik 2 tårer.",
  "Fortæl hvad du oftest søger på pornhub – eller drik 3 tårer.",
  "Fortæl en dirty secret – eller drik 5 tårer.",
  "Sten-saks-papir mod en valgfri spiller. Taber drikker 3, vinder giver 2.",
  "Sid på skødet af spilleren til venstre for dig i 3 runder – eller drik 3 tårer.",
  "Du skal drikke 1 tår.",
  "Du skal drikke 3 tårer.",
  "Peg på den i rummet, du har haft de mest upassende tanker om – eller drik 5 tårer.",
  "Næste spiller der trækker et kort drikker 2 ekstra.",
  "Fortæl hvem du har stalket mest på sociale medier – eller drik 3 tårer.",
  "Gå ud på altanen og vis din røv i 30 sekunder – eller drik 4 tårer.",
  "Lad din sidemand sende en sms fra din telefon – eller drik 3 tårer.",
  "Hvis du kan rime på 'nytår' på 5 sek: giv 3. Ellers drik 3.",
  "Klaus drikker 2 tårer.",
  "Frederik drikker 2 tårer.",
  "Rasmus drikker 2 tårer.",
  "Jeppe drikker 2 tårer.",
  "Fællesskål",
  "Tag Dorthe på røven - eller drik 2 tårer.",
  "Tillykke – du har vundet et kys fra Dorthe! Hvis du nægter: drik 3 tårer.",
  "Har du trukket dette kort og er Dorthe må du slå en valgfri spiller i røven uden modstand",
  "Smid trøjen – eller drik 3 tårer.",
  "Hvis ikke tænder på Dorthe - Bund din genstand (like WTF hun er jo skide bad)",
  "Hvis du er Dorthe, skal du give en lapdance til personen over for dig – ellers drik 4 tårer.",
  "Fællesskål",
  "Hvis du nogensinde har set dit eget røvhul i spejlet – drik 2 tårer.",
  "Hold kæft i 3 runder – eller drik 4 tårer.",
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

