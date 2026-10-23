function draftView(s, selectedTradePick) {
  let active = ["offseason", "draft"].includes(s.phase) && !s.draftComplete,
    slot = active ? s.draftSlots[s.draftTurn] : null,
    remaining = Game.remainingPicks(s);
  if (!remaining.includes(selectedTradePick)) selectedTradePick = slot;
  let up = active ? Game.tradeUpOffer(s, selectedTradePick) : null,
    down = active ? Game.tradeDownOffer(s, selectedTradePick) : null,
    targets = up
      ? s.draftBoard.filter((p) => p.rank >= up.target && p.rank < up.from)
      : [];
  return `<div class="panel draft-board"><div class="eyebrow">ALL ${s.draftBoard.length} PROSPECTS · FULL DRAFT BOARD</div><h2>${s.phase === "draft" ? "You’re on the clock." : s.draftComplete ? "Your draft class, in context." : "Build your draft strategy."}</h2><p>${active ? `Selection ${s.draftTurn + 1} of ${s.draftSlots.length} · Pick #${slot}. Your picks: ${s.draftSlots.map((n) => "#" + n).join(", ")}.` : "Draft complete. Your selections remain highlighted below."} Compare position, overall rating, potential, and your current starter across the entire class. Earlier prospects remain visible.</p>${active ? '<p class="intro">Before your first selection, availability is projected by board rank. Rivals take earlier-ranked prospects between your selections. Rookie contracts cost $3M per year for three years; the first year is reserved and paid on selection.</p>' : ""}${active ? `<div class="trade-picker"><h3 id="your-picks-title">Your picks</h3><p>Select a pick to field trade offers. You can trade any unspent pick, including picks you just acquired.</p><div class="pick-cards" role="group" aria-labelledby="your-picks-title">${remaining.map((n) => `<button type="button" class="pick-card${n === selectedTradePick ? " selected" : ""}" data-action="selectPick:${n}" aria-pressed="${n === selectedTradePick}"><span>PICK</span><strong>#${n}</strong><small>${n === slot ? "Next selection" : "Available to trade"}</small></button>`).join("")}</div></div><div class="offers-heading"><h3>Field offers</h3><p>Offers for pick #${selectedTradePick}</p></div>` : ""}${up ? `<div class="trade-offer"><b>#${up.from} → #${up.target} · $${up.cost}M · ${s.teams[up.partner].name}</b><p>Move this selection ahead of ${targets.map((p) => `#${p.rank} ${p.name} (${p.pos}, ${p.rating} OVR)`).join(", ")}. Your other picks stay yours.</p>${button("Trade up · " + money(up.cost), "moveUp:" + up.from, Game.spendable(s) < up.cost)}</div>` : ""}${
    down
      ? `<div class="trade-offer trade-down"><b>Trade down: #${down.from} → #${down.later} + #${down.extra} · ${s.teams[down.partner].name}</b><p>Gain another selection. Prospects projected between the outgoing and later pick: ${s.draftBoard
          .filter((p) => p.rank >= down.from && p.rank < down.later)
          .map((p) => `#${p.rank} ${p.name} (${p.pos})`)
          .join(
            ", ",
          )}. You may still target them with an earlier pick you own.</p><p>No cash fee. Reserve $3M for the extra rookie. Both acquired picks can be traded again.</p>${button("Trade down · gain a pick", "moveDown:" + down.from, Game.spendable(s) < down.reserve)}</div>`
      : ""
  }${active && !up && !down ? "<p>No rival offer is available for this pick within the remaining draft slots.</p>" : ""}${active && s.phase === "offseason" ? `<div class="action-row"><p>Scout and trade up or down before starting. No players are selected until you enter the draft.</p>${button("Enter draft →", "startDraft", false, "primary")}</div>` : ""}<div class="table-wrap"><table><thead><tr><th>RANK</th><th>PROSPECT / POSITION</th><th>OVR</th><th>POTENTIAL</th><th>YOUR STARTER</th><th>STATUS</th></tr></thead><tbody>${s.draftBoard
    .map((p) => {
      const status = Game.boardStatus(s, p),
        eligible =
          s.phase === "draft" && s.prospects.some((x) => x.rank === p.rank),
        starter = s.roster[Game.positions.indexOf(p.pos)];
      return `<tr data-prospect-rank="${p.rank}" class="${status === "Drafted by you" ? "you" : p.rank === slot ? "on-clock" : ""}"><td>#${p.rank}</td><td><b>${p.name}</b><small class="board-position">${p.pos} · AGE ${p.age}</small></td><td>${p.rating}</td><td class="green">${p.potential}</td><td>${round(starter.rating)} <small>${starter.pos}</small></td><td>${eligible ? button("Draft →", "draft:" + p.rank, !Game.canDraft(s, p.rank), "primary") : `<span class="board-status">${status}</span>`}</td></tr>`;
    })
    .join("")}</tbody></table></div></div>`;
}
