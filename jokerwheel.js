const canvas = document.getElementById("jokerWheel");
const ctx = canvas.getContext("2d");

const spinBtn = document.getElementById("jokerSpinBtn");
const resultEl = document.getElementById("jokerResult");

// 12 felter: 6 røde (TAG), 6 blå (GIV)
const values = [1,2,3,4,5,6, 1,2,3,4,5,6];
const types  = ["TAG","TAG","TAG","TAG","TAG","KLAUS TAGER", "GIV","GIV","GIV","GIV","GIV","KLAUS TAGER"];

const slices = values.length;
const sliceAngle = (2 * Math.PI) / slices;

let rotation = 0;
let spinning = false;

function colorFor(i){
  return types[i] === "TAG" ? "#d81f1f" : "#1e55d8";
}

function drawWheel(){
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = Math.min(cx, cy) - 6;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for(let i = 0; i < slices; i++){
    const start = i * sliceAngle + rotation;
    const end = (i + 1) * sliceAngle + rotation;

    // Slice
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.fillStyle = colorFor(i);
    ctx.arc(cx, cy, radius, start, end);
    ctx.closePath();
    ctx.fill();

    // Text
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(start + sliceAngle / 2);

    ctx.textAlign = "right";
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Georgia";
    ctx.fillText(`${types[i]} ${values[i]}`, radius - 14, 8);

    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.fillStyle = "#fff";
  ctx.arc(cx, cy, 18, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function getSelectedIndex(){
  // Pointer peger opad (-90°)
  const normalized = (rotation - (-Math.PI / 2)) % (2 * Math.PI);
  const positive = (normalized + 2 * Math.PI) % (2 * Math.PI);
  const index = Math.floor((2 * Math.PI - positive) / sliceAngle) % slices;
  return index;
}

function spin(){
  if(spinning) return;

  spinning = true;
  spinBtn.disabled = true;
  resultEl.textContent = "";

  const extraSpins = 6 + Math.random() * 4; // 6-10 omgange
  const targetIndex = Math.floor(Math.random() * slices);

  // ønsket slutvinkel så target lander under pointer
  const targetAngle = (slices - targetIndex) * sliceAngle - sliceAngle / 2;
  const current = rotation % (2 * Math.PI);
  const finalRotation = (extraSpins * 2 * Math.PI) + targetAngle;

  const duration = 7000;
  const startTime = performance.now();

  function easeOutCubic(t){
    return 1 - Math.pow(1 - t, 3);
  }

  function animate(now){
    const t = Math.min((now - startTime) / duration, 1);
    const eased = easeOutCubic(t);

    rotation = current + (finalRotation - current) * eased;
    drawWheel();

    if(t < 1){
      requestAnimationFrame(animate);
    } else {
      const idx = getSelectedIndex();
      const type = types[idx];
      const val = values[idx];

      resultEl.textContent =
        type === "TAG"
          ? `🔴 TAG: Drik ${val} tår${val === 1 ? "" : "er"}!`
          : `🔵 GIV: Giv ${val} tår${val === 1 ? "" : "er"} ud!`;

      spinning = false;
      spinBtn.disabled = false;
    }
  }

  requestAnimationFrame(animate);
}

// Init
drawWheel();
spinBtn.addEventListener("click", spin);
