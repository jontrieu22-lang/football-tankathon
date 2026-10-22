function renderLayout(s, tab, notice, selectedTradePick) {
  let u = Game.units(s),
    t = s.teams[0],
    pick = ["offseason", "draft"].includes(s.phase)
      ? s.pick
      : Game.draftOrder(s).findIndex((t) => !t.id) + 1,
    status =
      s.heat < 25
        ? "SECURE"
        : s.heat < 50
          ? "WARM"
          : s.heat < 75
            ? "HOT"
            : "CRITICAL";
  return `<header><a class="brand" href="#" aria-label="Tankathon home"><span class="brand-mark" aria-hidden="true">× ○</span>TANKATHON<span class="edition">THE COACH’S BOARD</span></a><div class="header-actions"><span class="saved">● AUTO-SAVED</span>${button("How to play", "help")}${button("New run", "reset")}</div></header><main><div class="title-row"><div><div class="eyebrow">THE REBUILD STARTS HERE</div><h1>Rust City <span>Hounds.</span></h1><p>A bad roster. A short leash. One shot at a championship.</p></div><div class="season">SEASON <b>${String(s.season).padStart(2, "0")}</b><span>${s.phase === "regular" ? `WEEK ${s.week + 1} OF 10` : s.phase.toUpperCase()}</span></div></div><div class="chalk-play" aria-hidden="true"><img src="assets/chalk-play.svg" alt="" /><span>DRAW UP A DYNASTY.</span></div><div class="stats"><div><label>SEASON RECORD</label><strong>${t.w}<i>–</i>${t.l}</strong><small>${Game.standings(s).findIndex((t) => !t.id) + 1} / 16 in the league</small></div><div><label>${["offseason", "draft"].includes(s.phase) ? "OFFSEASON DRAFT PICK" : "PROJECTED DRAFT PICK"}</label><strong>#${pick}</strong><small>${["offseason", "draft"].includes(s.phase) ? (s.draftComplete ? "Draft completed" : "Your earned draft position") : "Worst record picks first"}</small></div><div><label>AVAILABLE BUDGET</label><strong>${money(s.cash)}</strong><small>${money(s.budget)} annual funding</small></div><div><label>TEAM OVERALL</label><strong>${round(u.overall)}<em>/ 99</em></strong><small>OFF ${round(u.off)} <span>·</span> DEF ${round(u.def)}</small></div></div><nav>${[["office", "Front office"], ["roster", "Roster & development"], ["market", "Free agency"], ...(s.draftBoard ? [["board", "Draft board"]] : []), ["league", "League & draft race"]].map(([id, label]) => button(label, "tab:" + id, false, tab === id ? "active" : "")).join("")}</nav>${notice ? `<div class="notice" role="status">${notice}</div>` : ""}<div class="layout"><section>${s.phase === "fired" || s.phase === "champion" ? ending(s) : tab === "office" ? (s.phase === "draft" ? draftView(s, selectedTradePick) : s.phase === "offseason" ? offseason(s) : office(s)) : tab === "roster" ? roster(s) : tab === "market" ? market(s) : tab === "board" ? draftView(s, selectedTradePick) : league(s)}</section><aside><div class="panel seat"><div class="panel-label">JOB SECURITY <span class="pill ${s.heat >= 75 ? "danger" : ""}">${status}</span></div>${chair(s)}<div class="heat-number">${round(s.heat)}<span> / 100 HEAT</span></div><div class="heat-track"><span style="width:${s.heat}%"></span></div><p>${s.heat < 50 ? "You have room to build. Make it count." : s.heat < 75 ? "Ownership needs a reason to believe." : "Your next decisions could cost you the job."}</p><div class="review-note">OWNER EXPECTATION <b>${Math.min(6, s.season + 1)} wins this season</b><small class="grace-note">${Game.scrutiny(s) < 1 ? "PATIENCE GRADUALLY FADING" : "FULL SCRUTINY"}<br>${round(Game.scrutiny(s) * 100)}% of normal heat gains. Wins cool normally.</small><small>100 heat ends your run.</small></div></div><div class="panel pulse"><div class="panel-label">FRANCHISE PULSE</div>${[
    ["Locker room", s.morale],
    ["Fan confidence", s.fans],
  ]
    .map(
      ([n, v]) =>
        `<div class="pulse-row"><span>${n}</span><b>${round(v)}%</b></div><div class="mini-track"><span style="width:${v}%"></span></div>`,
    )
    .join(
      "",
    )}<div class="funding">NEXT YEAR’S FUNDING<b>${money(80 + t.w * 2 + s.bonus + Math.floor(s.fans / 10))}</b><small>$80M base + wins + fans + playoff bonuses</small></div></div></aside></div><footer><span>TANKATHON <b> / </b> LOSE WITH A PURPOSE.</span><span>Local save · Fictional league · MVP 0.1</span></footer></main>`;
}
