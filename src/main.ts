import {makeDeck,createPlayer,createGame,availableReflexes,useReflex,endTurn} from "./engine";
import "./style.css";
const deck=makeDeck();
const game=createGame(createPlayer("Player 1",deck.slice(0,4)),createPlayer("Player 2",deck.slice(26,30)));
const app=document.querySelector<HTMLDivElement>("#app")!;
function render(){
 const player=game.players[game.activePlayer];
 app.replaceChildren();
 const heading=document.createElement("h1");heading.textContent="Cardi — engine playground";app.append(heading);
 const note=document.createElement("p");note.textContent="Early prototype: reflex and turn recovery only. Full combat is not implemented.";app.append(note);
 const turn=document.createElement("h2");turn.textContent=`${player.id}'s turn`;app.append(turn);
 const cards=document.createElement("div");cards.className="cards";
 for(const state of player.cards){const el=document.createElement("article");el.className=state.flipped?"card flipped":"card";el.textContent=`${state.card.rank} of ${state.card.suit}${state.flipped?" (flipped)":""}`;cards.append(el)}
 app.append(cards);
 const reflex=document.createElement("button");reflex.textContent=`Use reflex (${availableReflexes(player)} available)`;reflex.disabled=!availableReflexes(player);reflex.onclick=()=>{useReflex(player);render()};app.append(reflex);
 const next=document.createElement("button");next.textContent="End turn";next.onclick=()=>{endTurn(game);render()};app.append(next);
}
render();
