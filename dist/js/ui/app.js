function render() {
  $("#app").innerHTML = renderLayout(s, tab, notice, selectedTradePick);
}
let s;
try {
  s = JSON.parse(localStorage.getItem("hotseat-v1"));
  if (s?.version !== 1) s = null;
} catch {}
s = s ? Game.migrate(s) : Game.fresh();
let tab = "office",
  notice = "",
  selectedTradePick = null;
function save() {
  try {
    localStorage.setItem("hotseat-v1", JSON.stringify(s));
  } catch {
    notice =
      "Browser storage unavailable. Keep this tab open to preserve your run.";
  }
}

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-action]");
  if (!b) return;
  let [a, v] = b.dataset.action.split(":");
  notice = "";
  if (a === "help") {
    $("#help").showModal();
    return;
  }
  if (a === "reset") {
    if (
      !confirm("Start a new run? Your current saved tenure will be replaced.")
    )
      return;
    s = Game.fresh();
    tab = "office";
  } else if (a === "tab") tab = v;
  else if (a === "plan") s.plan = v;
  else if (a === "startDraft") {
    Game.startDraft(s);
    tab = "office";
  } else if (a === "startSeason") {
    Game.startSeason(s);
    tab = "office";
  } else if (a === "play") Game.play(s);
  else if (a === "playoffs") Game.playoffs(s);
  else if (a === "review") Game.review(s);
  else if (a === "moveDown") {
    notice = Game.moveDown(s, Number(v))
      ? "Trade accepted. You moved back and gained an extra selection in this draft."
      : "This trade is unavailable or needs $3M of unreserved budget.";
  } else if (a === "moveUp") {
    notice = Game.moveUp(s, Number(v))
      ? "Trade accepted. Your selected pick moved earlier; the board is updated."
      : "This trade is no longer available.";
  } else if (["train", "sign", "trade"].includes(a)) {
    if (
      a === "trade" &&
      !confirm(
        `Trade this player for $5M and an extra draft selection? A 43 OVR replacement joins; heat rises by ${Game.weightedHeat(s, 5)}.`,
      )
    )
      return;
    let ok = Game[a](s, Number(v));
    notice = ok
      ? {
          train: "Training complete. Your player improved by up to 2 OVR.",
          sign: "Contract signed. Your new player is in the starting lineup.",
          trade: "Trade accepted. Future talent, at a cost today.",
        }[a]
      : "This move is no longer available.";
  } else if (a === "draft") {
    Game.draft(s, Number(v));
    tab = "office";
  }
  save();
  render();
});
save();
render();

document.addEventListener("change", (e) => {
  if (e.target.id === "trade-pick") {
    selectedTradePick = Number(e.target.value);
    render();
  }
});
