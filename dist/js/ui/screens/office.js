function office(s) {
  let pair = s.schedule[Math.min(s.week, 9)].find((p) => p.includes(0)),
    opp =
      s.phase === "playoffs"
        ? Game.standings(s)
            .filter((t) => t.id !== 0)
            .slice(0, 5)[Math.max(0, 4 - s.playoffRound * 2)]
        : s.teams[pair.find((id) => id !== 0)],
    u = Game.units(s);
  return `<div class="panel matchup"><div class="panel-label">${s.phase === "regular" ? "NEXT MATCHUP" : "POSTSEASON"}<span class="live-dot">● ${s.phase === "regular" ? "GAME DAY" : "SEASON " + s.season}</span></div><div class="versus"><div><div class="team-logo hounds">H</div><h3>RUST CITY</h3><small>HOUNDS · ${s.teams[0].w}–${s.teams[0].l}</small></div><div class="vs">VS<span>${s.phase === "regular" ? "WEEK " + (s.week + 1) : "WIN OR GO HOME"}</span></div><div><div class="team-logo rival">${opp.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join(
      "",
    )}</div><h3>${opp.name.split(" ").slice(0, -1).join(" ").toUpperCase()}</h3><small>${opp.name.split(" ").at(-1).toUpperCase()} · ${opp.w}–${opp.l}</small></div></div><div class="match-note">${s.phase === "regular" ? `${opp.rating > u.overall + 5 ? "UNDERDOG TERRITORY" : "A WINNABLE GAME"} <span>Opponent ${round(opp.rating)} OVR · Your team ${round(u.overall)} OVR</span>` : s.phase === "playoffs" ? "PLAYOFF BERTH SECURED <span>Win three playoff games to become champion.</span>" : "THE SEASON IS IN THE BOOKS <span>Ownership review, then the draft.</span>"}</div></div>${
    s.phase === "regular"
      ? `<div class="panel strategy"><div class="panel-label">YOUR WEEKLY APPROACH <span>CHOOSE ONE</span></div><div class="plans">${[
          [
            "youth",
            "01",
            "Develop youth",
            "−4 game rating",
            "Fast growth. Accept the mistakes.",
          ],
          [
            "balanced",
            "02",
            "Stay balanced",
            "No rating modifier",
            "Steady development and results.",
          ],
          [
            "win",
            "03",
            "Win now",
            "+3 game rating",
            "Protect the job. Slower growth.",
          ],
        ]
          .map(
            ([id, n, title, tag, desc]) =>
              `<button data-action="plan:${id}" class="plan ${s.plan === id ? "selected" : ""}" aria-pressed="${s.plan === id}"><span>${n} <i>${s.plan === id ? "●" : "○"}</i></span><b>${title}</b><em>${tag}</em><small>${desc}</small></button>`,
          )
          .join(
            "",
          )}</div><div class="action-row"><small>A win adds $2M to next year.<br>A loss can move you up the draft.</small>${button("Simulate week " + (s.week + 1) + " <span>→</span>", "play", false, "primary")}</div></div>`
      : `<div class="panel action-row"><p>${s.phase === "playoffs" ? ["Wild card round", "Semifinal", "Championship game"][s.playoffRound] : "Your next chapter begins with the draft."}</p>${button(s.phase === "playoffs" ? "Play postseason →" : "Review & next offseason →", s.phase === "playoffs" ? "playoffs" : "review", false, "primary")}</div>`
  }${resultView(s)}<div class="panel wire"><div class="panel-label">LEAGUE WIRE <span>RECENT ACTIVITY</span></div>${
    s.log.length
      ? s.log
          .slice(0, 5)
          .map((l) => `<p><span>+</span>${l}</p>`)
          .join("")
      : "<p><span>+</span>You inherited a rebuilding team. Ownership asks for two wins and a reason to believe.</p><p><span>+</span>Five rival franchises are also rebuilding. Watch the draft race.</p>"
  }</div>`;
}
