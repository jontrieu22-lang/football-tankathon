function resultView(s) {
  let r = s.result;
  if (!r) return "";
  return `<div class="panel result"><div class="panel-label">LAST RESULT <span class="${r.win ? "green" : "orange"}">${r.win ? "WIN" : "LOSS"}</span></div><div class="result-line"><strong>${r.us}<span>–</span>${r.them}</strong><div><h3>${r.headline}</h3><small>vs ${r.opp}</small></div></div><div class="quarter-row">${r.quarters.map((q, i) => `<span>Q${i + 1} <b>${q[0]}–${q[1]}</b></span>`).join("")}<span>FINAL <b>${r.us}–${r.them}</b></span></div><div class="reasons">${r.reasons
    .filter((r) => r[1])
    .map(
      ([n, v]) =>
        `<span>${n} <b class="${v < 0 ? "green" : "orange"}">${v > 0 ? "+" : ""}${v} heat</b></span>`,
    )
    .join("")}</div></div>`;
}
