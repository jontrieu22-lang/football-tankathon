const assert=require('node:assert/strict');const G=require('./dist/engine.js');
function regularFresh(seed){const s=G.fresh(seed);s.phase='regular';s.draftComplete=true;return s;}
function finishDraft(s){if(s.phase==='offseason')assert(G.startDraft(s));while(s.phase==='draft'){assert(s.prospects.length);const best=s.prospects.slice(0,10).sort((a,b)=>(b.rating-s.roster[G.positions.indexOf(b.pos)].rating)-(a.rating-s.roster[G.positions.indexOf(a.pos)].rating))[0];G.draft(s,best.rank);}}
// New run: manage first, draft, finish shopping, explicitly kick off.
let s=G.fresh(10);assert.equal(s.phase,'offseason');assert.equal(s.season,1);assert.equal(s.pick,3);assert.equal(G.rookieReserve(s),6);assert(!G.startSeason(s));G.play(s);assert.equal(s.week,0);
assert(G.trade(s,0));assert.equal(s.draftSlots.length,3);assert.equal(G.rookieReserve(s),9);assert(!G.trade(s,2));
let agent=s.market.find(p=>p.salary<=G.spendable(s));assert(G.sign(s,agent.id));let cash=s.cash;finishDraft(s);assert.equal(s.phase,'offseason');assert.equal(s.season,1);assert.equal(s.cash,cash-9);assert.equal(s.week,0);assert.equal(s.draftComplete,true);assert(!G.startDraft(s));assert(s.roster.some(p=>p.age===21&&p.years===3));assert(G.startSeason(s));assert.equal(s.phase,'regular');assert.equal(s.week,0);assert(!G.startSeason(s));G.play(s);assert.equal(s.week,1);
// Rookie reserves cannot be spent on optional purchases.
s=G.fresh(3);s.cash=6;assert.equal(G.spendable(s),0);assert(!G.sign(s,s.market[0].id));assert(!G.train(s,0));assert(G.startDraft(s));assert(!G.moveUp(s));finishDraft(s);assert.equal(s.cash,0);assert(G.startSeason(s));
// Review funds the new offseason before drafting; last year's earned pick survives standings reset.
s=regularFresh(40);s.phase='review';s.week=10;s.teams.forEach((t,i)=>{t.w=i===0?3:1;t.l=10-t.w;});s.cash=20;s.extraPick=1;const expectedPick=G.draftOrder(s).findIndex(t=>t.id===0)+1;G.review(s);assert.equal(s.phase,'offseason');assert.equal(s.season,2);assert.equal(s.pick,expectedPick);assert.equal(s.week,0);assert.equal(s.draftSlots.length,3);assert.equal(s.history.length,1);assert.equal(s.cash,s.budget-s.roster.reduce((n,p)=>n+p.salary,0)+10);assert.equal(s.teams.reduce((n,t)=>n+t.w,0),0);let budget=s.budget;cash=s.cash;assert(G.startDraft(s));assert(G.moveUp(s));assert.equal(s.pick,expectedPick-2);assert(!G.moveUp(s));finishDraft(s);assert.equal(s.phase,'offseason');assert.equal(s.season,2);assert.equal(s.budget,budget);assert.equal(s.cash,cash-12-9);assert(G.startSeason(s));
// Existing saves: no reset midseason, and no duplicate draft for an already-drafted season.
s=regularFresh(2);delete s.flowVersion;s.week=4;G.migrate(s);assert.equal(s.phase,'regular');assert.equal(s.week,4);
s=regularFresh(2);delete s.flowVersion;G.migrate(s);assert.equal(s.phase,'offseason');assert(!s.draftComplete);let seed=s.seed;G.migrate(s);assert.equal(s.seed,seed);
s=regularFresh(2);s.season=2;delete s.flowVersion;G.migrate(s);assert.equal(s.phase,'offseason');assert(s.draftComplete);assert(G.startSeason(s));
s=G.fresh(9);s.phase='draft';s.week=10;delete s.flowVersion;G.migrate(s);assert(s.legacyDraft);finishDraft(s);assert.equal(s.season,2);assert.equal(s.phase,'offseason');assert(s.draftComplete);
// Full multi-season lifecycle, including budgets and records.
for(let seed=1;seed<=200;seed++){let state=G.fresh(seed),guard=0;while(!['champion','fired'].includes(state.phase)&&state.season<9&&guard++<250){
 if(['regular','offseason'].includes(state.phase)){let best=state.market.filter(p=>G.spendable(state)>=p.salary).sort((a,b)=>(b.rating-state.roster[G.positions.indexOf(b.pos)].rating)-(a.rating-state.roster[G.positions.indexOf(a.pos)].rating))[0];if(best&&best.rating>state.roster[G.positions.indexOf(best.pos)].rating+10)G.sign(state,best.id);}
 if(state.phase==='offseason'){if(state.draftComplete)G.startSeason(state);else G.startDraft(state);}
 else if(state.phase==='regular'){state.plan=state.season===1?'youth':'win';let young=state.roster.findIndex(p=>p.age<26&&p.rating<p.potential);if(young>=0)G.train(state,young);G.play(state);assert.equal(state.teams.reduce((n,t)=>n+t.w,0),state.week*8);assert.equal(state.teams.reduce((n,t)=>n+t.l,0),state.week*8);}
 else if(state.phase==='playoffs')G.playoffs(state);else if(state.phase==='review')G.review(state);else if(state.phase==='draft')finishDraft(state);
 assert(state.cash>=G.rookieReserve(state));assert.equal(state.roster.length,12);assert(state.heat>=0&&state.heat<=100);
 }assert(guard<250);}
console.log('PASS: offseason opening, trade/sign/draft/start flow, rookie reserves, budgets, save migration, 200 multi-season runs');
// Curve landmarks, continuity, monotonicity and saturation.
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(const [season,week,expected]of [[1,0,.2],[1,5,.55],[1,10,.8],[2,0,.8],[2,5,.95],[2,10,1],[3,0,1],[7,5,1]])near(G.scrutiny({season,week}),expected);
for(let games=0,last=0;games<=50;games++){let x=G.scrutiny({season:1+Math.floor(games/10),week:games%10});assert(x>=last&&x<=1);last=x;}
near(G.weightedHeat({season:1,week:5},10),5.5);
// Apply identical seeded outcomes at different tenure checkpoints; wins retain full relief.
let wins=0,losses=0;
for(let seed=1;seed<=100;seed++)for(const week of [0,5,9]){
 const runs=[1,2,3].map(season=>{let state=regularFresh(seed);state.season=season;state.week=week;state.heat=30;G.play(state);return state;});
 const base=runs[2],raw=base.result.reasons.reduce((n,r)=>n+r[1],0);
 runs.forEach(state=>{assert.equal(state.result.us,base.result.us);assert.equal(state.result.them,base.result.them);const expected=G.weightedHeat({season:state.season,week},raw);near(state.heat,30+expected);near(state.result.reasons.reduce((n,r)=>n+r[1],0),expected);});
 if(base.result.win){wins++;near(runs[0].heat,21);}else losses++;
}
assert(wins&&losses);
for(const season of [1,2,3]){
 let state=regularFresh(7);state.season=season;state.week=10;state.phase='review';state.heat=30;state.teams[0].w=0;const expected=G.weightedHeat(state,Math.min(6,season+1)*5);G.review(state);near(state.heat,30+expected);
 state=regularFresh(7);state.season=season;state.week=5;let delta=G.weightedHeat(state,5);G.trade(state,0);near(state.heat,24+delta);
 state=regularFresh(7);state.season=season;state.phase='review';state.week=10;state.heat=30;state.teams[0].w=10;G.review(state);near(state.heat,22);
}
console.log(`PASS: smooth scrutiny landmarks, boundaries, fractional heat, ${losses} losses / ${wins} wins, trades and reviews`);

s=regularFresh(2);delete s.flowVersion;s.cash=0;G.migrate(s);assert(s.draftComplete);assert.equal(s.cash,0);assert(G.startSeason(s));
// Full board persists through scouting, trades, and every selection.
s=G.fresh(63);assert.equal(s.draftBoard.length,44);assert.equal(s.draftBoard[0].rank,1);assert.equal(G.boardStatus(s,s.draftBoard[0]),'Requires earlier pick');let board=JSON.stringify(s.draftBoard),top=JSON.stringify(s.draftBoard[0]);cash=s.cash;assert(G.moveUp(s));assert.equal(s.phase,'offseason');assert.equal(s.cash,cash-12);assert.equal(s.pick,1);assert.equal(JSON.stringify(s.draftBoard),board);assert.equal(JSON.stringify(s.prospects[0]),top);assert(!G.moveUp(s));assert(G.startDraft(s));G.draft(s,1);assert.equal(s.draftBoard.length,44);assert.equal(G.boardStatus(s,s.draftBoard[0]),'Drafted by you');assert.equal(G.boardStatus(s,s.draftBoard[1]),'Taken by rival');cash=s.cash;G.draft(s,2);assert.equal(s.cash,cash);finishDraft(s);assert.equal(s.draftBoard.length,44);
s=G.fresh(64);assert(G.startDraft(s));cash=s.cash;G.draft(s,1);assert.equal(s.cash,cash);assert.equal(s.draftTurn,0);G.draft(s,44);assert.equal(s.draftedRanks[0],44);
s=G.fresh(65);delete s.draftBoard;delete s.draftedRanks;let available=JSON.stringify(s.prospects),rng=s.seed;G.migrate(s);assert.equal(s.draftBoard.length,44);assert.equal(JSON.stringify(s.prospects),available);assert.equal(s.seed,rng);board=JSON.stringify(s.draftBoard);G.migrate(s);assert.equal(JSON.stringify(s.draftBoard),board);
console.log('PASS: all 44 prospects visible, stable trade-up targets, eligibility, taken/drafted statuses, old-save migration');
// Trade down exchanges real draft slots, preserves prospects, and funds the additional rookie.
s=G.fresh(80);const offer=G.tradeDownOffer(s);assert.deepEqual(offer,{from:3,later:7,extra:23,reserve:3});board=JSON.stringify(s.draftBoard);cash=s.cash;assert(G.moveDown(s));assert.equal(s.cash,cash);assert.deepEqual(s.draftSlots,[7,19,23]);assert.equal(G.rookieReserve(s),9);assert.equal(s.pick,7);assert.equal(JSON.stringify(s.draftBoard),board);assert(!G.moveDown(s));assert(!G.moveUp(s));s=G.migrate(JSON.parse(JSON.stringify(s)));assert(s.movedDown);assert.equal(G.tradeDownOffer(s),null);finishDraft(s);assert.equal(s.draftedRanks.length,3);assert.equal(s.cash,cash-9);assert.equal(s.phase,'offseason');
s=G.fresh(81);s.cash=8;assert(!G.moveDown(s));assert.equal(s.pick,3);s.cash=9;G.startDraft(s);assert(G.moveDown(s));finishDraft(s);assert.equal(s.cash,0);
s=G.fresh(82);G.startDraft(s);G.draft(s,3);assert.equal(G.tradeDownOffer(s),null);assert(!G.moveDown(s));
s=G.fresh(83);G.moveUp(s);assert(!G.moveDown(s));
s=G.fresh(84);s.draftSlots.push(23);assert.equal(G.tradeDownOffer(s).extra,24);assert(G.moveDown(s));assert.equal(new Set(s.draftSlots).size,s.draftSlots.length);
s=regularFresh(85);s.movedDown=true;s.phase='review';s.week=10;s.heat=0;s.teams[0].w=5;G.review(s);assert(!s.movedDown);assert(G.tradeDownOffer(s));
console.log('PASS: trade-down slots, extra selection, reserve protection, persistence, no repeat/reversal, next-year reset');
