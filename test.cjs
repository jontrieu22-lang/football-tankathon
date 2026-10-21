const assert=require('node:assert/strict');const G=require('./dist/engine.js');
for(let seed=1;seed<=200;seed++){let s=G.fresh(seed),guard=0;while(!['champion','fired'].includes(s.phase)&&s.season<9&&guard++<180){if(s.phase==='regular'){s.plan=s.season===1?'youth':'win';let best=s.market.filter(p=>s.cash>=p.salary).sort((a,b)=>(b.rating-s.roster[G.positions.indexOf(b.pos)].rating)-(a.rating-s.roster[G.positions.indexOf(a.pos)].rating))[0];if(best&&best.rating>s.roster[G.positions.indexOf(best.pos)].rating+10)G.sign(s,best.id);let young=s.roster.findIndex(p=>p.age<26&&p.rating<p.potential);if(young>=0)G.train(s,young);G.play(s);assert.equal(s.teams.reduce((n,t)=>n+t.w,0),s.week*8);assert.equal(s.teams.reduce((n,t)=>n+t.l,0),s.week*8);}else if(s.phase==='playoffs')G.playoffs(s);else if(s.phase==='review')G.review(s);else if(s.phase==='draft'){assert(s.prospects.length);const best=s.prospects.slice(0,10).sort((a,b)=>(b.rating-s.roster[G.positions.indexOf(b.pos)].rating)-(a.rating-s.roster[G.positions.indexOf(a.pos)].rating))[0];G.draft(s,best.rank);}assert(s.cash>=0);assert(s.roster.length===12);assert(s.heat>=0&&s.heat<=100);}assert(guard<180);}
let s=G.fresh(10),cash=s.cash,r=s.roster[0].rating;assert(G.train(s,0));assert(!G.train(s,0));assert.equal(s.cash,cash-3);assert.equal(s.roster[0].rating,r+2);assert(G.trade(s,0));assert(!G.trade(s,2));console.log('PASS: 200 multi-season runs, league records, budgets, draft progression, training and trade limits');
s=G.fresh(22);s.heat=0;s.roster.forEach(p=>{p.rating=90;p.potential=97;});for(let i=0;i<10;i++){G.play(s);if(s.phase==='fired')throw Error('Strong team fired unexpectedly');}if(s.phase==='playoffs')while(s.phase==='playoffs')G.playoffs(s);if(s.phase==='champion')s.phase='review';G.review(s);assert.equal(s.phase,'draft');const oldSeason=s.season;while(s.phase==='draft')G.draft(s,s.prospects[0].rank);assert.equal(s.season,oldSeason+1);assert.equal(s.week,0);assert.equal(s.teams.reduce((n,t)=>n+t.w,0),0);assert.equal(s.cash,s.budget-s.roster.reduce((n,p)=>n+p.salary,0)+10);
s=G.fresh(40);s.phase='review';s.week=10;s.teams.forEach((t,i)=>{t.w=i===0?3:1;t.l=10-t.w;});s.cash=20;G.review(s);let oldPick=s.pick;assert(G.moveUp(s));assert.equal(s.pick,oldPick-2);assert.equal(s.cash,8);assert(!G.moveUp(s));
for(let i=0;i<100;i++){s=G.fresh(i);s.phase='playoffs';s.playoffRound=0;s.roster.forEach(p=>p.rating=99);s.teams.forEach(t=>{if(t.id)t.rating=40;});while(s.phase==='playoffs')G.playoffs(s);if(s.phase==='champion')break;}assert.equal(s.phase,'champion');console.log('PASS: offseason salaries, reset records, cash trade-up and championship completion');
// Curve landmarks, continuity, monotonicity and saturation.
const near=(a,b)=>assert(Math.abs(a-b)<1e-9,`${a} != ${b}`);
for(const [season,week,expected]of [[1,0,.2],[1,5,.55],[1,10,.8],[2,0,.8],[2,5,.95],[2,10,1],[3,0,1],[7,5,1]])near(G.scrutiny({season,week}),expected);
for(let games=0,last=0;games<=50;games++){let x=G.scrutiny({season:1+Math.floor(games/10),week:games%10});assert(x>=last&&x<=1);last=x;}
near(G.weightedHeat({season:1,week:5},10),5.5);
// Apply identical seeded outcomes at different tenure checkpoints; wins retain full relief.
let wins=0,losses=0;
for(let seed=1;seed<=100;seed++)for(const week of [0,5,9]){
 const runs=[1,2,3].map(season=>{let state=G.fresh(seed);state.season=season;state.week=week;state.heat=30;G.play(state);return state;});
 const base=runs[2],raw=base.result.reasons.reduce((n,r)=>n+r[1],0);
 runs.forEach(state=>{assert.equal(state.result.us,base.result.us);assert.equal(state.result.them,base.result.them);const expected=G.weightedHeat({season:state.season,week},raw);near(state.heat,30+expected);near(state.result.reasons.reduce((n,r)=>n+r[1],0),expected);});
 if(base.result.win){wins++;near(runs[0].heat,21);}else losses++;
}
assert(wins&&losses);
for(const season of [1,2,3]){
 let state=G.fresh(7);state.season=season;state.week=10;state.phase='review';state.heat=30;state.teams[0].w=0;const expected=G.weightedHeat(state,Math.min(6,season+1)*5);G.review(state);near(state.heat,30+expected);
 state=G.fresh(7);state.season=season;state.week=5;let delta=G.weightedHeat(state,5);G.trade(state,0);near(state.heat,24+delta);
 state=G.fresh(7);state.season=season;state.phase='review';state.week=10;state.heat=30;state.teams[0].w=10;G.review(state);near(state.heat,22);
}
console.log(`PASS: smooth scrutiny landmarks, boundaries, fractional heat, ${losses} losses / ${wins} wins, trades and reviews`);
