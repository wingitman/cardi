import {makeDeck,createPlayer,createGame,attackCard,endTurn,rankValue,type Game,type Card,type Player} from "./engine";
import "./style.css";

type Mode="bot"|"local";
type Match={game:Game;mode:Mode;hp:[number,number];message:string;winner:number|null;deck:Card[]};
const app=document.querySelector<HTMLDivElement>("#app")!;
let match:Match|null=null;
function shuffle<T>(a:T[]):T[]{const copy=[...a];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function start(mode:Mode){const deck=shuffle(makeDeck());match={game:createGame(createPlayer("Player 1",deck.splice(0,4)),createPlayer(mode==="bot"?"Bot":"Player 2",deck.splice(0,4))),mode,hp:[30,30],message:"Choose a club to attack, or end your turn.",winner:null,deck};render()}
function draw(player:Player){if(match?.deck.length&&player.cards.length<4)player.cards.push({card:match.deck.shift()!,flipped:false,recoveryTurn:null})}
function attack(cardId:string,targetId:string|null){if(!match||match.winner!==null)return;const m=match;const actor=m.game.activePlayer;const attacker=m.game.players[actor],defender=m.game.players[1-actor];const card=attacker.cards.find(s=>s.card.id===cardId);if(!card||card.flipped||card.card.suit!=="clubs")return;
 const attack=rankValue(card.card.rank);
 const defense=defender.cards.filter(s=>s.card.suit==="spades"&&!s.flipped).reduce((sum,s)=>sum+rankValue(s.card.rank),0);
 const hit=attack>defense;
 if(hit){if(targetId){try{const result=attackCard(defender,targetId);m.message=`${attacker.id} hit ${targetId}: ${result}.`}catch(e){m.message=String(e);render();return}}else{m.hp[1-actor]=Math.max(0,m.hp[1-actor]-Math.max(1,attack-defense));m.message=`${attacker.id} dealt ${Math.max(1,attack-defense)} damage.`}}
 else m.message=`${attacker.id}'s attack was blocked by armour (${defense}).`;
 attacker.discard.push(card.card);attacker.cards.splice(attacker.cards.indexOf(card),1);
 if(m.hp[1-actor]===0){m.winner=actor;m.message=`${attacker.id} wins!`;}
 else nextTurn();render();
}
function nextTurn(){if(!match)return;const m=match;const current=m.game.players[m.game.activePlayer];draw(current);endTurn(m.game);if(m.mode==="bot"&&m.game.activePlayer===1&&m.winner===null){window.setTimeout(botMove,400)}}
function botMove(){if(!match||match.mode!=="bot"||match.game.activePlayer!==1||match.winner!==null)return;const bot=match.game.players[1];const club=bot.cards.find(s=>s.card.suit==="clubs"&&!s.flipped);if(!club){match.message="Bot passes.";nextTurn();render();return}attack(club.card.id,null)}
function button(label:string,action:()=>void,disabled=false){const b=document.createElement("button");b.textContent=label;b.disabled=disabled;b.onclick=action;return b}
function render(){app.replaceChildren();const title=document.createElement("h1");title.textContent="Cardi";app.append(title);const intro=document.createElement("p");intro.textContent="Playable rules prototype — provisional combat: clubs attack, spades block, hearts are targets, 30 starting health. Face-card powers and full combat rules are still to come.";app.append(intro);
 const controls=document.createElement("div");controls.append(button("New game vs bot",()=>start("bot")),button("New two-player game",()=>start("local")));app.append(controls);if(!match)return;
 const m=match,active=m.game.activePlayer,actor=m.game.players[active],opponent=m.game.players[1-active];const status=document.createElement("h2");status.textContent=m.winner===null?`${actor.id}'s turn — ${m.mode==="bot"?"vs bot":"local two-player"}`:`${m.game.players[m.winner].id} wins!`;app.append(status);
 const scores=document.createElement("p");scores.textContent=`${m.game.players[0].id}: ${m.hp[0]} HP · ${m.game.players[1].id}: ${m.hp[1]} HP · Draw pile: ${m.deck.length}`;app.append(scores);
 const msg=document.createElement("p");msg.textContent=m.message;app.append(msg);
 for(let p=0;p<2;p++){const player=m.game.players[p];const heading=document.createElement("h3");heading.textContent=`${player.id} — equipped cards`;app.append(heading);const row=document.createElement("div");row.className="cards";for(const state of player.cards){const el=document.createElement("article");el.className=state.flipped?"card flipped":"card";el.textContent=`${state.card.rank} of ${state.card.suit}${state.flipped?" (flipped)":""}`;row.append(el)}app.append(row)}
 if(m.winner!==null)return;
 if(m.mode==="bot"&&active===1){const wait=document.createElement("p");wait.textContent="Bot is thinking…";app.append(wait);return}
 const clubs=actor.cards.filter(s=>s.card.suit==="clubs"&&!s.flipped);
 const targetHeading=document.createElement("h3");targetHeading.textContent="Attack";app.append(targetHeading);
 for(const club of clubs){const group=document.createElement("div");group.className="actions";group.append(button(`Attack health with ${club.card.rank} of clubs`,()=>attack(club.card.id,null)));for(const target of opponent.cards.filter(s=>s.card.suit==="hearts"||s.card.suit==="spades"||s.card.suit==="clubs"||s.card.suit==="diamonds")){const top=opponent.cards.findLastIndex(s=>s.card.suit===target.card.suit);const index=opponent.cards.indexOf(target);if(target.flipped||top===index)group.append(button(`Hit ${target.card.rank} of ${target.card.suit}`,()=>attack(club.card.id,target.card.id)))}app.append(group)}
 app.append(button("End turn / pass",()=>{m.message=`${actor.id} passes.`;nextTurn();render()}));
}
render();
