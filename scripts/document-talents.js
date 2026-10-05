/* Export player-facing descriptions from the shipped catalogue, not the proposal. */
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const {createGame}=require("./game-test-harness");
const root=path.resolve(__dirname,".."),context={Arcade:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,"src/rogue-data.js"),"utf8"),context);
const g=createGame(),talents=JSON.parse(g.run('JSON.stringify(talentDefinitions.map(t=>({id:t.id,name:t.name,classKey:t.classKey,branch:t.branch})))'));
const lookup=new Map(talents.map(t=>[t.id,t]));
const rows=context.Arcade.rogueData.nodes.map(([id,tier,effect])=>({...lookup.get(id),tier,cost:context.Arcade.rogueData.tiers[tier],effect}));
fs.writeFileSync(path.join(root,"docs/implemented-talents.json"),JSON.stringify({status:context.Arcade.rogueData.status,version:2,nodes:rows},null,2)+"\n");
let md="# Implemented permanent talents\n\nAll 150 stable talent IDs have gameplay handlers and a baseline-versus-upgraded regression. Values are the starting balance, subject to playtesting. Buy between runs; equip four support talents and one keystone. Costs are 2 / 4 / 8 Marks. Three owned support talents in a class unlock its keystones.\n\nA means equipped base attack damage before conditional multipliers. Bonus attacks cannot recursively trigger another bonus attack.\n";
for(const cls of ["melee","ranger","mage","rogue","paladin","bard"]){md+="\n## "+(cls==="melee"?"Warrior":cls[0].toUpperCase()+cls.slice(1))+"\n\n| Talent | Branch | Tier / Marks | Implemented effect |\n| --- | --- | --- | --- |\n";for(const n of rows.filter(n=>n.classKey===cls))md+=`| ${n.name} | ${n.branch} | ${n.tier} / ${n.cost} | ${n.effect.replace(/\|/g,"\\|")} |\n`;}
fs.writeFileSync(path.join(root,"docs/IMPLEMENTED_TALENTS.md"),md);
console.log("Exported all 150 implemented talent descriptions.");
