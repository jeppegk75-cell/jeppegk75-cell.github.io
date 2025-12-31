const canvas = document.getElementById("wheel");
const ctx = canvas.getContext("2d");

const spinBtn = document.getElementById("spinBtn");
const resultText = document.getElementById("resultText");

// Felter på hjulet (du kan ændre dem senere)
const options = ["1", "2", "3", "2", "3", "1", "Bund"];
const colors  = ["#f44336", "#4caf50", "#2196f3", "#ffeb3b", "#9c27b0", "#ff9800", "#00bcd4"];

const slices = options.length;
const sliceAngle = (2 * Math.PI) / slices;

// Wheel state
let rotation = 0;
let spinning = false;

function drawWheel() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 6;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < slices; i++) {
    const start = i * sliceAngle + rotation;
    const end = (i + 1) * sliceAngle + rotation;

    // Slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = colors[i % colors.length];
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + sliceAngle / 2);

    ctx.textAlign = "right";
    ctx.fillStyle = "#111";
    ctx.font = "bold 22px Georgia";
    ctx.fillText(options[i], radius - 14, 10);

    ctx.restore();
  }

  // Center circle (pænere look)
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function getSelectedIndex() {
  // Pointer peger opad (vinkel -90°), så vi korrigerer med -Math.PI/2
  const normalized = (rotation - (-Math.PI / 2)) % (2 * Math.PI);
  const positive = (normalized + 2 * Math.PI) % (2 * Math.PI);
  const index = Math.floor((2 * Math.PI - positive) / sliceAngle) % slices;
  return index;
}

function spin() {
  if (spinning) return;
  spinning = true;
  spinBtn.disabled = true;
  resultText.textContent = "";

  const extraSpins = 6 + Math.random() * 4; // 6-10 omgange
  const targetIndex = Math.floor(Math.random() * slices);

  // Find vinkel der ender på targetIndex ved pointeren
  // Vi vil have slice midt under pointer (op)
  const targetAngle = (slices - targetIndex) * sliceAngle - sliceAngle / 2;
  const current = rotation % (2 * Math.PI);
  const finalRotation = (extraSpins * 2 * Math.PI) + targetAngle;

  const duration = 7000; // ms
  const startTime = performance.now();

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(t);

    rotation = current + (finalRotation - current) * eased;
    drawWheel();

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      const idx = getSelectedIndex();
      const value = options[idx];

      resultText.textContent = value === "Bund"
        ? "Resultat: BUND!"
        : `Resultat: Drik ${value} tår${value === "1" ? "" : "er"}!`;

      spinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(animate);
}

// Init
drawWheel();
spinBtn.addEventListener("click", spin);
