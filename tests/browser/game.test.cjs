const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const output =
  process.env.SCREENSHOT_DIR || path.join(__dirname, "../../test-results");
fs.mkdirSync(output, { recursive: true });
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
(async () => {
  const browser = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    headless: true,
    args: ["--no-sandbox"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1100 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("dialog", (d) => d.accept());
    await page.goto(process.env.BASE_URL || "http://127.0.0.1:4173");
    await page.locator("h1").waitFor();
    assert(
      await page
        .getByRole("heading", { name: "Build before kickoff." })
        .isVisible(),
    );
    assert(await page.locator('[data-action="startSeason"]').isDisabled());
    await page.screenshot({
      path: path.join(output, "hot-seat-offseason-desktop.png"),
      fullPage: true,
    });
    await page
      .getByRole("button", { name: "Draft board", exact: true })
      .click();
    assert.equal(await page.locator("[data-prospect-rank]").count(), 44);
    const topName = await page
      .locator('[data-prospect-rank="1"] td b')
      .innerText();
    assert(
      (await page.locator('[data-prospect-rank="1"]').innerText()).includes(
        "Requires earlier pick",
      ),
    );
    assert(
      (await page.locator(".trade-offer").first().innerText()).includes(
        topName,
      ),
    );
    await page.locator('[data-action^="moveUp:"]').click();
    assert.equal(
      await page.locator('[data-prospect-rank="1"] td b').innerText(),
      topName,
    );
    await page.reload();
    await page
      .getByRole("button", { name: "Draft board", exact: true })
      .click();
    assert.equal(
      await page.locator('[data-prospect-rank="1"] td b').innerText(),
      topName,
    );
    assert.equal(await page.locator("[data-prospect-rank]").count(), 44);
    await page.setViewportSize({ width: 390, height: 844 });
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
    await page.screenshot({
      path: path.join(output, "hot-seat-board-mobile.png"),
    });
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.screenshot({
      path: path.join(output, "hot-seat-board-desktop.png"),
    });
    await page.getByRole("button", { name: "Roster & development" }).click();
    await page.locator('[data-action="trade:0"]').click();
    await page
      .getByRole("button", { name: "Free agency", exact: true })
      .click();
    await page.locator('[data-action^="sign:"]:enabled').first().click();
    await page
      .getByRole("button", { name: "Front office", exact: true })
      .click();
    await page.locator('[data-action="startDraft"]').click();
    await page.locator('[data-action^="draft:"]').first().click();
    await page.reload();
    assert(
      (await page.locator("main").innerText()).includes("Selection 2 of 3"),
    );
    await page.getByRole("button", { name: "Roster & development" }).click();
    assert(await page.locator(".roster-list").isVisible());
    await page
      .getByRole("button", { name: "Front office", exact: true })
      .click();
    await page.locator('[data-action^="draft:"]').first().click();
    await page.locator('[data-action^="draft:"]').first().click();
    assert(
      await page
        .getByRole("heading", { name: "Build before kickoff." })
        .isVisible(),
    );
    assert((await page.locator(".season").innerText()).includes("01"));
    assert(await page.locator('[data-action="startSeason"]').isEnabled());
    await page.setViewportSize({ width: 390, height: 844 });
    await page.screenshot({
      path: path.join(output, "hot-seat-offseason-mobile.png"),
      fullPage: true,
    });
    assert(
      !(await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )),
    );
    await page.locator('[data-action="startSeason"]').click();
    assert((await page.locator(".season").innerText()).includes("WEEK 1"));
    await page.locator('[data-action="play"]').click();
    await page.reload();
    assert((await page.locator(".season").innerText()).includes("WEEK 2"));
    // Use a healthy, strong roster to exercise the real full-season UI transition reliably.
    await page.evaluate(() => {
      s.heat = 0;
      s.roster.forEach((p) => {
        p.rating = 95;
        p.potential = 99;
      });
      save();
      render();
    });
    while (await page.locator('[data-action="play"]').count())
      await page.locator('[data-action="play"]').click();
    if (await page.locator('[data-action="playoffs"]').count()) {
      await page.evaluate(() => {
        s.phase = "review";
        save();
        render();
      });
    }
    await page.locator('[data-action="review"]').click();
    assert((await page.locator(".season").innerText()).includes("02"));
    assert(
      await page
        .getByRole("heading", { name: "Build before kickoff." })
        .isVisible(),
    );
    assert(await page.locator('[data-action="startSeason"]').isDisabled());
    await page.locator('[data-action="startDraft"]').click();
    while (await page.locator('[data-action^="draft:"]').count())
      await page.locator('[data-action^="draft:"]').first().click();
    await page.locator('[data-action="startSeason"]').click();
    assert((await page.locator(".season").innerText()).includes("WEEK 1"));
    await page.evaluate(() => {
      s = Game.fresh(91);
      tab = "board";
      save();
      render();
    });
    assert(
      (await page.locator(".trade-down").innerText()).includes("#3 → #7 + #23"),
    );
    await page.locator('[data-action^="moveDown:"]').click();
    await page.reload();
    await page
      .getByRole("button", { name: "Draft board", exact: true })
      .click();
    assert(
      (await page.locator(".draft-board").innerText()).includes(
        "Your picks: #7, #19, #23",
      ),
    );
    assert.equal(await page.locator('[data-action^="moveDown:"]').count(), 1);
    assert(
      (await page.locator('[data-prospect-rank="3"]').innerText()).includes(
        "Requires earlier pick",
      ),
    );
    await page.locator('[data-action="startDraft"]').click();
    for (let i = 0; i < 3; i++)
      await page.locator('[data-action^="draft:"]').first().click();
    assert(
      await page
        .getByRole("heading", { name: "Build before kickoff." })
        .isVisible(),
    );
    assert(await page.locator('[data-action="startSeason"]').isEnabled());
    await page.evaluate(() => {
      s = Game.fresh(95);
      s.cash = 100;
      tab = "board";
      save();
      render();
    });
    await page.locator('[data-action="selectPick:19"]').click();
    assert.equal(await page.locator('[data-action="selectPick:19"]').getAttribute("aria-pressed"), "true");
    assert.equal(await page.locator('[data-action="selectPick:3"]').getAttribute("aria-pressed"), "false");
    assert.match(await page.locator(".offers-heading").innerText(), /Offers for pick #19/);
    assert(
      (await page.locator(".trade-down").innerText()).includes(
        "#19 → #23 + #39",
      ),
    );
    await page.locator('[data-action="moveDown:19"]').click();
    await page.locator('[data-action="selectPick:23"]').click();
    await page.locator('[data-action="moveDown:23"]').click();
    await page.reload();
    await page
      .getByRole("button", { name: "Draft board", exact: true })
      .click();
    assert(
      (await page.locator(".draft-board").innerText()).includes(
        "Your picks: #3, #27, #39, #43",
      ),
    );
    await page.locator('[data-action="startDraft"]').click();
    await page.locator('[data-action="draft:3"]').click();
    assert.equal(
      await page.locator('[data-action="selectPick:3"]').count(),
      0,
    );
    await page.locator('[data-action="selectPick:39"]').click();
    await page.locator('[data-action="moveUp:39"]').click();
    assert((await page.locator(".draft-board").innerText()).includes("#37"));
    while (await page.locator('[data-action^="draft:"]:enabled').count())
      await page.locator('[data-action^="draft:"]:enabled').first().click();
    assert(await page.locator('[data-action="startSeason"]').isEnabled());
    assert.equal(errors.length, 0, errors.join("\n"));
    console.log(
      "PASS: full 44-player board, preview trade targets, stable prospects after trade/reload, mobile board; offseason trade/sign/draft, mid-draft reload and tabs, mobile layout, explicit kickoff, next-year offseason flow",
    );
  } finally {
    await browser.close();
  }
})();
