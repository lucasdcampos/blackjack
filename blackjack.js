// blackjack
// last updated: 4/10/2024

const debug = true;

const hand = new Map();
const aceCount = new Map();

var deck = [];

var canHit = true;
var canStay = true;

window.onload = function()
{
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

function startGame()
{
    hand.set("dealer", 0);
    hand.set("player", 0);
    aceCount.set("dealer", 0);
    aceCount.set("player", 0);

    addCardTo("dealer");

    addCardTo("player");
    addCardTo("player");

    document.getElementById("hit-btn").addEventListener("click", hit);
    document.getElementById("stay-btn").addEventListener("click", stay);
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
        canHit = false;
        await wait(500);
        stay();
    }
}

function getHand(subject)
{
    while(hand.get(subject) > 21 && aceCount.get(subject) > 0)
    {
        addValueToHand(-10, subject);
        unregisterAceTo(subject);
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

    canHit = false;

    while (hand.get("dealer") < 17) {
        addCardTo("dealer");
        await wait(750);
    }

    await wait(100);
    let hidden = document.getElementById("hidden-card");
    let card = deck.pop();
    hidden.src = createCard(card).src;

    addValueToHand(getCardValue(card), "dealer");
    checkWinner();
}

function checkWinner()
{
    let status = document.getElementById("game-status");
    let dealer = getHand("dealer");
    let player = getHand("player");

    if(player > 21)
    {
        status.innerText = "Dealer won!\nPlayer busted";
    }
    else if(dealer > 21)
    {
        status.innerText = "Player won!\nDealer busted";
    }
    else if(player > dealer)
    {
        status.innerText = "Player won!";
    }
    else if (dealer > player)
    {
        status.innerText = "Dealer won!";
    }
    else
    {
        status.innerText = "Draw!";
    }
}

function addCardTo(subject)
{
    let card = deck.pop();
    let value = getCardValue(card);
    
    addValueToHand(value, subject);

    document.getElementById(subject+"-hand").appendChild(createCard(card));
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
        registerAceTo(subject);
    }
}

function registerAceTo(subject)
{
    aceCount.set(subject, aceCount.get(subject) + 1);
}

function unregisterAceTo(subject)
{
    aceCount.set(subject, aceCount.get(subject) - 1);
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