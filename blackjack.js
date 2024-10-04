// blackjack
// last updated: 4/10/2024

const debug = true;

const hand = new Map();
const aceCount = new Map();
const cardSfx = new Audio("assets/sfx/new_card.mp3");
const gameOverSfx = new Audio("assets/sfx/card_game_over.wav");

var hiddenCard;
var deck = [];
var canHit = true;
var canStay = true;
var firstTime = true;

window.onload = function()
{
    document.getElementById("hit-btn").addEventListener("click", hit);
    document.getElementById("stay-btn").addEventListener("click", stay);
    document.getElementById("play-again-btn").addEventListener("click", playAgain);
    document.getElementById("play-again-btn").style.visibility = "hidden";


    buildDeck();
    shuffleDeck();
    startGame();
}

function buildDeck()
{
    let suits = ["C", "D", "H", "S"];
    let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];

    for(i = 0; i < suits.length; i++)
    {
        for(j = 0; j < values.length; j++)
        {
            deck.push(values[j] + "-" + suits[i]);
        }
    }

}

function shuffleDeck()
{
    let currentIndex = deck.length;

    while (currentIndex != 0) {

        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // swapping cards
        [deck[currentIndex], deck[randomIndex]] = [deck[randomIndex], deck[currentIndex]];
    }

}

async function startGame()
{
    let ms = firstTime ? 0 : 500;

    hand.set("dealer", 0);
    hand.set("player", 0);
    aceCount.set("dealer", 0);
    aceCount.set("player", 0);

    addHiddenCard();
    await wait(ms);
    addCardTo("dealer");
    await wait(ms);

    addCardTo("player");
    await wait(ms);
    addCardTo("player");
    
    canHit = true;
    canStay = true;
    firstTime = false;
}

async function hit()
{
    if(!canHit)
    {
        return;
    }

    addCardTo("player");

    if(getHand("player") > 21)
    {
        await wait(500);
        await stay();
    }
}

function getHand(subject)
{
    while(hand.get(subject) > 21 && aceCount.get(subject) > 0)
    {
        addValueToHand(-10, subject);
        adjustAceCount(-1, subject);
    }

    return hand.get(subject);
}

function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function stay() {
    if(!canStay)
    {
        return;
    }

    canStay = false;
    canHit = false;

    while (hand.get("dealer") < 17) {
        addCardTo("dealer");
        await wait(750);
    }

    await wait(150);
    revealCard();
    await wait(500);
    checkWinner();
}

function addHiddenCard()
{
    hiddenCard = document.createElement("img");
    hiddenCard.src = "assets/cards/hidden.png";

    spawnCard(hiddenCard, "dealer");
}

function spawnCard(card, subject)
{
    cardSfx.play();
    document.getElementById(subject+"-hand").appendChild(card);
}

function revealCard()
{
    let card = deck.pop();
    hiddenCard.src = createCard(card).src;

    addValueToHand(getCardValue(card), "dealer");
    cardSfx.play();
}

function checkWinner()
{
    let status = document.getElementById("game-status");
    let dealer = getHand("dealer");
    let player = getHand("player");

    if (player > 21) {
        status.innerText = "Dealer won!\nPlayer busted";
    } else if (dealer > 21) {
        status.innerText = "Player won!\nDealer busted";
    } else if (player === dealer) {
        status.innerText = "Draw!";
    } else {
        status.innerText = player > dealer ? "Player won!" : "Dealer won!";
    }

    gameOverSfx.play();
    endGame();
}

function endGame() {
    document.getElementById("play-again-btn").style.visibility = "visible";
    document.getElementById("play-again-btn").focus(); 
    document.getElementById("hit-btn").style.visibility = "hidden";
    document.getElementById("stay-btn").style.visibility = "hidden";
    
}


function clearHands() {
    document.getElementById("dealer-hand").innerHTML = '';
    document.getElementById("player-hand").innerHTML = '';
}

function playAgain() {
    document.getElementById("play-again-btn").style.visibility = "hidden";
    document.getElementById("hit-btn").style.visibility = "visible";
    document.getElementById("stay-btn").style.visibility = "visible";
    document.getElementById("game-status").innerText = "";
    clearHands();
    startGame();
}

function addCardTo(subject)
{
    let card = deck.pop();
    let value = getCardValue(card);
    
    addValueToHand(value, subject);
    spawnCard(createCard(card), subject);
}

function createCard(card)
{
    let img = document.createElement("img");

    img.src = "assets/cards/" + card + ".png";

    return img;
}

function addValueToHand(value, subject)
{
    let currentValue = hand.get(subject);
    let newValue = currentValue + value;

    hand.set(subject, newValue);

    log("adding " + value + " to " + subject);

    if(value == 11)
    {
        adjustAceCount(1, subject);
    }
}

function adjustAceCount(increment, subject)
{
    aceCount.set(subject, aceCount.get(subject) + increment);
}

function getCardValue(card)
{
    let data = card.split("-");

    if(isNaN(data[0]))
    {
        if(data[0] == "A")
        {
            return 11;
        }

        return 10;
    }

    return parseInt(data[0]);
}

function log(message)
{
    if(!debug)
    {
        return;
    }

    console.log(message);
}