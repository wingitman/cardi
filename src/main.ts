import {makeDeck,createPlayer,createGame,attackCard,endTurn,rankValue,type Game,type Card,type Player,type Suit} from "./engine";
import "./style.css";

type Mode="bot"|"local";
type Match={game:Game;mode:Mode;deck:Card[];message:string;winner:number|null;selected:Suit|null;budget:number|null;spent:number;hits:string[];round:number};
const app=document.querySelector<HTMLDivElement>("#app")!;
let match:Match|null=null;
const suits:Suit[]=["hearts","spades","clubs","diamonds"];
function shuffle<T>(items:T[]):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function d6(){return Math.floor(Math.random()*6)+1}
function stack(player:Player,suit:Suit){return player.cards.filter(c=>c.card.suit===suit&&!c.flipped)}
function value(player:Player,suit:Suit){return stack(player,suit).reduce((sum,c)=>sum+rankValue(c.card.rank),0)}
function start(mode:Mode){const deck=shuffle(makeDeck());const a=createPlayer("Player 1",deck.splice(0,4)),b=createPlayer(mode==="bot"?"Bot":"Player 2",deck.splice(0,4));const rolls=[d6()+value(a,"diamonds"),d6()+value(b,"diamonds")];while(rolls[0]===rolls[1]){rolls[0]=d6()+value(a,"diamonds");rolls[1]=d6()+value(b,"diamonds")}
 const game=createGame(a,b);game.activePlayer=rolls[0]>rolls[1]?0:1;match={game,mode,deck,message:`Initiative: ${a.id} ${rolls[0]}, ${b.id} ${rolls[1]}. ${game.players[game.activePlayer].id} goes first.`,winner:null,selected:null,budget:null,spent:0,hits:[],round:0};render();scheduleBot()}
function scheduleBot(){if(match?.mode==="bot"&&match.game.activePlayer===1&&match.winner===null){const current=match;window.setTimeout(()=>{if(match===current)botMove()},550)}}
function finishTurn(){if(!match)return;const m=match;m.selected=null;m.budget=null;m.spent=0;m.hits=[];endTurn(m.game);m.round++;render();scheduleBot()}
function canDraw(player:Player){return player.cards.length>0&&!player.cards.some(c=>!c.flipped)}
function emergencyDraw(){if(!match||match.winner!==null)return;const m=match,player=m.game.players[m.game.activePlayer];if(!canDraw(player))return;if(m.deck.length){const card=m.deck.shift()!;player.cards.push({card,flipped:false,recoveryTurn:null});m.message=`${player.id} drew ${card.rank} of ${card.suit} and ended their turn.`}else m.message="Draw pile empty; turn ended.";finishTurn()}
function beginAttack(suit:Suit){if(!match||match.winner!==null)return;const m=match,player=m.game.players[m.game.activePlayer];if(!stack(player,suit).length)return;m.selected=suit;m.spent=0;m.hits=[];const roll=d6();m.budget=value(player,suit)+roll;m.message=`${player.id} attacks with ${suit}: stack ${value(player,suit)} + d6 ${roll} = ${m.budget}. Select enemy cards, then finish attack.`;render()}
function eligible(player:Player,id:string){const index=player.cards.findIndex(c=>c.card.id===id);if(index<0)return false;const state=player.cards[index];return state.flipped||player.cards.findLastIndex(c=>c.card.suit===state.card.suit)===index}
function hit(id:string){if(!match||match.budget===null)return;const m=match;const budget=m.budget;if(budget===null)return;const defender=m.game.players[1-m.game.activePlayer],state=defender.cards.find(c=>c.card.id===id);if(!state||!eligible(defender,id)||m.hits.includes(id))return;const cost=rankValue(state.card.rank);if(cost>budget-m.spent)return;const result=attackCard(defender,id);m.spent+=cost;m.hits.push(id);m.message=`${id} ${result}. ${budget-m.spent} attack points remain.`;if(defender.cards.length===0){m.winner=m.game.activePlayer;m.message=`${m.game.players[m.winner].id} wins — opponent has no cards left!`;render();return}render()}
function finishAttack(){if(!match||match.budget===null)return;const m=match;m.message=`${m.game.players[m.game.activePlayer].id} finished attacking (${m.spent}/${m.budget} points spent).`;finishTurn()}
function botMove(){if(!match||match.mode!=="bot"||match.game.activePlayer!==1||match.winner!==null)return;const m=match,bot=m.game.players[1];if(canDraw(bot)){emergencyDraw();return}const options=suits.filter(s=>stack(bot,s).length);if(!options.length){m.message="Bot passes.";finishTurn();return}const best=options.sort((a,b)=>value(bot,b)-value(bot,a))[0];beginAttack(best);if(!match)return;const targets=[...m.game.players[0].cards].filter(c=>eligible(m.game.players[0],c.card.id)).sort((a,b)=>rankValue(a.card.rank)-rankValue(b.card.rank));for(const t of targets){if(match?.winner!==null)break;if(match&&rankValue(t.card.rank)<=((match.budget??0)-match.spent))hit(t.card.id)}if(match?.winner===null)finishAttack()}
function button(label:string,action:()=>void,disabled=false){const b=document.createElement("button");b.textContent=label;b.disabled=disabled;b.onclick=action;return b}

const symbols:Record<Suit,string>={hearts:"♥",spades:"♠",clubs:"♣",diamonds:"♦"};
const labels:Record<string,string>={jack:"J",queen:"Q",king:"K",ace:"A"};
function displayRank(card:Card){return typeof card.rank==="number"?String(card.rank):labels[card.rank]}
function cardButton(state:Player["cards"][number],onClick:()=>void,enabled:boolean,selected=false){
 const b=document.createElement("button");b.type="button";b.className=`playing-card ${state.card.suit} ${state.flipped?"is-flipped":""} ${enabled?"is-actionable":""} ${selected?"is-selected":""}`;b.disabled=!enabled;
 b.setAttribute("aria-label",`${state.card.rank} of ${state.card.suit}${state.flipped?", flipped":""}`);
 const corner=document.createElement("span");corner.className="card-corner";corner.textContent=`${displayRank(state.card)} ${symbols[state.card.suit]}`;
 const middle=document.createElement("span");middle.className="card-symbol";middle.textContent=state.flipped?"✦":symbols[state.card.suit];
 const bottom=document.createElement("span");bottom.className="card-corner card-corner-bottom";bottom.textContent=`${displayRank(state.card)} ${symbols[state.card.suit]}`;
 b.append(corner,middle,bottom);b.onclick=onClick;return b;
}
function render(){
 app.replaceChildren();
 const m=match;
 const header=document.createElement("header");header.className="game-header";
 const heading=document.createElement("h1");heading.textContent="Cardi";header.append(heading);
 const controls=document.createElement("div");controls.className="game-controls";controls.append(button("New vs bot",()=>start("bot")),button("Two players",()=>start("local")));header.append(controls);app.append(header);
 if(!m){const welcome=document.createElement("div");welcome.className="welcome";welcome.textContent="Cards are your health. Choose a game to begin.";app.append(welcome);return}
 const active=m.game.activePlayer,actor=m.game.players[active],human=!(m.mode==="bot"&&active===1);
 const table=document.createElement("div");table.className="game-table";
 function playerArea(index:number,current:Match){
  const player=current.game.players[index];const area=document.createElement("section");area.className=`player-area ${index===active?"active-player":""}`;
  const title=document.createElement("div");title.className="player-title";title.textContent=`${player.id} · ${player.cards.length} cards${index===active?" · TURN":""}`;area.append(title);
  const row=document.createElement("div");row.className="card-row";
  for(const suit of suits){
   const column=document.createElement("div");column.className="suit-column";
   const name=document.createElement("div");name.className="suit-name";name.textContent=`${symbols[suit]} ${suit} · ${value(player,suit)}`;column.append(name);
   const pile=document.createElement("div");pile.className="card-pile";
   for(const state of player.cards.filter(c=>c.card.suit===suit)){
    const isOwn=index===active;const canSelect=human&&isOwn&&current.budget===null&&!canDraw(actor)&&!state.flipped;
    const canTarget=human&&!isOwn&&current.budget!==null&&eligible(player,state.card.id)&&!current.hits.includes(state.card.id)&&rankValue(state.card.rank)<=current.budget-current.spent;
    const card=cardButton(state,()=>{if(canSelect)beginAttack(suit);else if(canTarget)hit(state.card.id)},canSelect||canTarget,isOwn&&current.selected===suit);
    pile.append(card);
   }
   column.append(pile);row.append(column);
  }
  area.append(row);return area;
 }
 table.append(playerArea(1-active,m));
 const center=document.createElement("div");center.className="table-center";
 const status=document.createElement("div");status.className="turn-status";status.textContent=m.winner!==null?`${m.game.players[m.winner].id} wins!`:`${actor.id}'s turn`;center.append(status);
 const points=document.createElement("div");points.className="attack-points";points.textContent=m.budget===null?"Select a card to attack":`${m.budget-m.spent} / ${m.budget} attack points left`;center.append(points);
 const info=document.createElement("p");info.className="game-message";info.setAttribute("role","status");info.textContent=m.message;center.append(info);
 const actions=document.createElement("div");actions.className="center-actions";
 if(m.winner===null&&human){
  if(m.budget!==null)actions.append(button("Finish attack",finishAttack));
  else if(canDraw(actor))actions.append(button(m.deck.length?"Draw a card & end turn":"End turn (deck empty)",emergencyDraw));
 }
 center.append(actions);table.append(center);table.append(playerArea(active,m));
 const footer=document.createElement("div");footer.className="table-footer";footer.textContent=`Draw pile: ${m.deck.length} · First hit flips · Second hit discards`;table.append(footer);app.append(table);
}
render();
