function league(s) {
  return `<div class="panel"><div class="panel-label">THE RACE FOR TALENT <span>16 FRANCHISES</span></div><p class="intro">Worst record earns the first pick. Equal records use a fixed league-order tiebreaker. The top six teams by wins, then point differential, enter the playoffs.</p><div class="table-wrap"><table><thead><tr><th>PICK</th><th>FRANCHISE</th><th>W–L</th><th>OVR</th><th>OUTLOOK</th></tr></thead><tbody>${Game.draftOrder(
    s,
  )
    .map(
      (t, i) =>
        `<tr class="${!t.id ? "you" : ""}"><td>#${i + 1}</td><td>${t.name}${!t.id ? " <small>YOU</small>" : ""}</td><td>${t.w}–${t.l}</td><td>${round(t.id ? t.rating : Game.units(s).overall)}</td><td>${t.mode}</td></tr>`,
    )
    .join("")}</tbody></table></div></div>`;
}
