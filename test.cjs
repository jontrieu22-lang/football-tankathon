const assert=require('node:assert/strict');const G=require('./dist/engine.js');
for(let seed=1;seed<=200;seed++){let s=G.fresh(seed),guard=0;while(!['champion','fired'].includes(s.phase)&&s.season<9&&guard++<180){if(s.phase==='regular'){s.plan=s.season===1?'youth':'win';let best=s.market.filter(p=>s.cash>=p.salary).sort((a,b)=>(b.rating-s.roster[G.positions.indexOf(b.pos)].rating)-(a.rating-s.roster[G.positions.indexOf(a.pos)].rating))[0];if(best&&best.rating>s.roster[G.positions.indexOf(best.pos)].rating+10)G.sign(s,best.id);let young=s.roster.findIndex(p=>p.age<26&&p.rating<p.potential);if(young>=0)G.train(s,young);G.play(s);assert.equal(s.teams.reduce((n,t)=>n+t.w,0),s.week*8);assert.equal(s.teams.reduce((n,t)=>n+t.l,0),s.week*8);}else if(s.phase==='playoffs')G.playoffs(s);else if(s.phase==='review')G.review(s);else if(s.phase==='draft'){assert(s.prospects.length);const best=s.prospects.slice(0,10).sort((a,b)=>(b.rating-s.roster[G.positions.indexOf(b.pos)].rating)-(a.rating-s.roster[G.positions.indexOf(a.pos)].rating))[0];G.draft(s,best.rank);}assert(s.cash>=0);assert(s.roster.length===12);assert(s.heat>=0&&s.heat<=100);}assert(guard<180);}
let s=G.fresh(10),cash=s.cash,r=s.roster[0].rating;assert(G.train(s,0));assert(!G.train(s,0));assert.equal(s.cash,cash-3);assert.equal(s.roster[0].rating,r+2);assert(G.trade(s,0));assert(!G.trade(s,2));console.log('PASS: 200 multi-season runs, league records, budgets, draft progression, training and trade limits');
s=G.fresh(22);s.heat=0;s.roster.forEach(p=>{p.rating=90;p.potential=97;});for(let i=0;i<10;i++){G.play(s);if(s.phase==='fired')throw Error('Strong team fired unexpectedly');}if(s.phase==='playoffs')while(s.phase==='playoffs')G.playoffs(s);if(s.phase==='champion')s.phase='review';G.review(s);assert.equal(s.phase,'draft');const oldSeason=s.season;while(s.phase==='draft')G.draft(s,s.prospects[0].rank);assert.equal(s.season,oldSeason+1);assert.equal(s.week,0);assert.equal(s.teams.reduce((n,t)=>n+t.w,0),0);assert.equal(s.cash,s.budget-s.roster.reduce((n,p)=>n+p.salary,0)+10);
s=G.fresh(40);s.phase='review';s.week=10;s.teams.forEach((t,i)=>{t.w=i===0?3:1;t.l=10-t.w;});s.cash=20;G.review(s);let oldPick=s.pick;assert(G.moveUp(s));assert.equal(s.pick,oldPick-2);assert.equal(s.cash,8);assert(!G.moveUp(s));
for(let i=0;i<100;i++){s=G.fresh(i);s.phase='playoffs';s.playoffRound=0;s.roster.forEach(p=>p.rating=99);s.teams.forEach(t=>{if(t.id)t.rating=40;});while(s.phase==='playoffs')G.playoffs(s);if(s.phase==='champion')break;}assert.equal(s.phase,'champion');console.log('PASS: offseason salaries, reset records, cash trade-up and championship completion');
// Identical game outcomes must receive tenure-specific scrutiny, without reducing win relief.
let losses=0,wins=0;
for(let seed=1;seed<=100;seed++){
 const runs=[1,2,3,4].map(year=>{let state=G.fresh(seed);state.season=year;state.heat=30;G.play(state);return state;});
 const base=runs[2],raw=base.result.reasons.reduce((n,r)=>n+r[1],0);
 runs.forEach((state,i)=>{assert.equal(state.result.us,base.result.us);assert.equal(state.result.them,base.result.them);let expected=raw>0?Math.round(raw*[.4,.8,1,1][i]):raw;assert.equal(state.heat,30+expected);assert.equal(state.result.reasons.reduce((n,r)=>n+r[1],0),expected);});
 if(base.result.win){wins++;assert.equal(runs[0].heat,21);}else losses++;
}
assert(losses>0&&wins>0);
for(const year of [1,2,3,4]){
 let state=G.fresh(7);state.season=year;state.phase='review';state.heat=30;state.teams[0].w=0;let expected=Math.round(Math.min(6,year+1)*5*([.4,.8][year-1]||1));G.review(state);assert.equal(state.heat,30+expected);
 state=G.fresh(7);state.season=year;state.phase='review';state.heat=30;state.teams[0].w=10;G.review(state);assert.equal(state.heat,22);
 state=G.fresh(7);state.season=year;G.trade(state,0);assert.equal(state.heat,24+Math.round(5*([.4,.8][year-1]||1)));
}
let firstYearFirings=0;
for(let seed=1;seed<=100;seed++){let state=G.fresh(seed);state.plan='youth';while(state.phase==='regular')G.play(state);if(state.phase==='review')G.review(state);if(state.phase==='fired')firstYearFirings++;}
assert.equal(firstYearFirings,0);
console.log(`PASS: tenure weights across ${losses} losses and ${wins} wins; review/trade weights; 100 year-one rebuilds survive to offseason`);
