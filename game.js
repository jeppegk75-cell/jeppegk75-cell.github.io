const boardEl = document.getElementById("board");
const taskTextEl = document.getElementById("taskText");
const taskMetaEl = document.getElementById("taskMeta");
const resetBtn = document.getElementById("resetBtn");

const STORAGE_KEY = "nytars_game_v1";

/** 52 brede udfordringer (varieret + kan gentages uden “rigtige svar”) */
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
  "Alle der har lyst hår drikker 1 tåre (ellers giv 2).",
  "Drik 1 tåre – og vælg en spiller der også drikker 1.",
  "Giv 4 tårer fordelt som du vil.",
  "Drik 4 tårer eller tag en “mini-straf” (fx stå på ét ben 20 sek).",
  "Skål med den til venstre. Begge drikker 2 tårer.",
  "Skål med den til højre. Begge drikker 2 tårer.",
  "Byt plads med en valgfri spiller. Begge drikker 1 tåre.",
  "I 1 minut: hver gang nogen siger 'okay' – drik 1 tåre.",
  "I 1 minut: ingen må sige 'ja' eller 'nej'. Første fejl: drik 3 tårer.",
  "Vælg et ord der er forbudt i 5 minutter. Hver gang nogen siger det: drik 1.",
  "Du er dommer i 2 minutter: giv i alt 5 tårer (én ad gangen).",
  "Alle rækker en hånd op. Sidste person drikker 3 tårer.",
  "Gæt en persons højde (eller noget simpelt). Forkert: drik 2. Rigtigt: giv 2.",
  "Ros en valgfri spiller på den mest overdrevne måde. Hvis folk griner: giv 3. Ellers drik 2.",
  "Fortæl en pinlig (men okay) historie. Hvis du nægter: drik 4.",
  "Lav en skål. Hvis nogen siger 'skål' bagefter: de drikker 1.",
  "Alle drikker 2 tårer – og du drikker 1 ekstra.",
  "Vælg en “tvilling”: hver gang du drikker, drikker de også 1 (indtil næste reset).",
  "Lav en regel der kun gælder dig (fx 'jeg drikker altid først') i 5 minutter.",
  "Byt drik med en valgfri spiller (hvis I vil). Begge drikker 1.",
  "Hvis du har været på toilet siden spilstart: drik 2 – ellers giv 2.",
  "Alle stemmer: hvem er mest sandsynligt til at… (du finder på). Vinderen drikker 3.",
  "Sten-saks-papir mod en valgfri spiller. Taber drikker 3, vinder giver 2.",
  "Kig en spiller i øjnene uden at grine i 15 sek. Griner du: drik 3.",
  "Alle banker i bordet. Første der stopper drikker 2.",
  "Vælg en kategori (film, dyr, byer). I går på skift – første der stopper drikker 3.",
  "Tal i accent i 1 minut. Hvis nogen tager dig i at glemme det: drik 2.",
  "Vælg en spiller: de vælger om du drikker 2 eller giver 2.",
  "Drik 1 tåre nu. Næste spiller drikker 2 (kæde).",
  "Alle der har telefonen fremme drikker 2 tårer.",
  "Du må pege på én og sige 'drik'. De drikker 2 tårer.",
  "Lav 10 sekunders “reklame” for noget random (fx en kartoffel). Hvis folk klapper: giv 3, ellers drik 2.",
  "Giv 1 tåre til den der har mindst i glasset.",
  "Drik 2 tårer og vælg en spiller der skal drikke 1 for hver af dine tårer (altså 2).",
  "Hvis du kan rime på 'nytår' på 5 sek: giv 3. Ellers drik 3.",
  "Alle siger en ting de er taknemmelige for. Den første der tøver: drik 2.",
  "Vælg en spiller: I laver 'skålekæde' rundt – alle drikker 1 når du siger NU.",
  "Vælg en spiller der skal fortælle en joke. Hvis den er dårlig: de drikker 2. Hvis god: de giver 2.",
  "Drik 3 tårer hvis du har sagt 'jeg er okay' i aften – ellers giv 3.",
  "Alle drikker 1. Du bestemmer hvem der drikker 1 ekstra.",
  "“Stilleleg” i 20 sek. Første der laver en lyd: drik 3.",
  "BONUS: Du får en ‘redning’. Brug den én gang til at slippe for en opgave (gem den i gruppen)."
];

const SUITS = [
  { key: "H", symbol: "♥", colorClass: "suit-red", name: "Hjerter" },
  { key: "D", symbol: "♦", colorClass: "suit-red", name: "Ruder" },
  { key: "C", symbol: "♣", colorClass: "suit-black", name: "Klør" },
  { key: "S", symbol: "♠", colorClass: "suit-black", name: "Spar" }
];

const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];

/** Fisher-Yates shuffle */
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
  return ids; // 52
}

function defaultState(){
  // Bland opgaver og tildel dem tilfældigt til kort
  const cardIds = buildCardIds();
  const shuffledTasks = shuffle(TASKS);
  const mapping = {};
  cardIds.forEach((id, idx) => mapping[id] = shuffledTasks[idx]);

  return {
    mapping,
    used: {},          // id -> true
    round: 1
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return defaultState();
    const parsed = JSON.parse(raw);

    // Hvis opgavelisten ændres i fremtiden, lav ny state
    if(!parsed.mapping || Object.keys(parsed.mapping).length !== 52){
      return defaultState();
    }
    return parsed;
  }catch{
    return defaultState();
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

    tile.addEventListener("click", () => onCardClick(id, suit, rank));
    boardEl.appendChild(tile);
  }

  updateResetButton();
}

function onCardClick(cardId, suit, rank){
  const task = state.mapping[cardId];

  // Mark as used
  state.used[cardId] = true;
  saveState();

  // Update UI
  taskTextEl.textContent = task;
  taskMetaEl.textContent = `Kort: ${rank}${suit.symbol} • Runde: ${state.round}`;

  // Mark tile visually
  const tile = boardEl.querySelector(`[data-card-id="${cardId}"]`);
  if(tile) tile.classList.add("used");

  updateResetButton();
}

function updateResetButton(){
  const usedCount = Object.keys(state.used).length;
  const allUsed = usedCount >= 52;

  resetBtn.disabled = !allUsed;
  resetBtn.textContent = allUsed
    ? "🔄 Bland kortene og start ny runde"
    : `Brugte kort: ${usedCount}/52`;
}

function reshuffleRound(){
  state.round += 1;
  state.used = {};

  const cardIds = buildCardIds();
  const shuffledTasks = shuffle(TASKS);
  const newMapping = {};
  cardIds.forEach((id, idx) => newMapping[id] = shuffledTasks[idx]);
  state.mapping = newMapping;

  saveState();

  taskTextEl.textContent = "Ny runde! Træk et fysisk kort og tryk på det tilsvarende kort.";
  taskMetaEl.textContent = `Runde: ${state.round}`;

  renderBoard();
}

resetBtn.addEventListener("click", () => {
  if(!resetBtn.disabled) reshuffleRound();
});

// Init
renderBoard();
