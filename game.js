function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

class Card {
    constructor(rider, value, image) {
        this.rider = rider;
        this.value = value;
        this.image = image;
    }

    toString() {
        return this.value;
    }
}

const exhaustionValue = 2;
const standardDraw = 4;


function move(fromArr, toArr, num) {
    for (let i = 0; i < num; i++) {
        toArr.push(fromArr.shift());
    }
}

function drawCards(rider, num) {
    let riderData = gameData[rider];
    let remainingDeck = riderData.deck.length;

    if (remainingDeck === 0) {
        riderData.hand = [new Card(rider, exhaustionValue, riderData.exhaustionImage)];
    } else if (remainingDeck < num) {
        // Draw what you can
        move(riderData.deck, riderData.hand, remainingDeck);
        let stillToDraw = num - remainingDeck;
        // Reshuffle discard
        shuffle(riderData.discard);
        // discard becomes deck
        move(riderData.discard, riderData.deck, riderData.discard.length);
        // Check if enough cards to draw the missing
        remainingDeck = riderData.deck.length;
        if (remainingDeck < stillToDraw) {
            // Draw what you can
            move(riderData.deck, riderData.hand, remainingDeck);
        } else {
            // Draw the missing
            move(riderData.deck, riderData.hand, stillToDraw);
        }
    } else {
        move(riderData.deck, riderData.hand, num);
    }
}

let initialGameData = {
    'chosen': '',
    's': {
        'deck': [
            new Card('s', 2, ''),
            new Card('s', 2, ''),
            new Card('s', 2, ''),
            new Card('s', 3, ''),
            new Card('s', 3, ''),
            new Card('s', 3, ''),
            new Card('s', 4, ''),
            new Card('s', 4, ''),
            new Card('s', 4, ''),
            new Card('s', 5, ''),
            new Card('s', 5, ''),
            new Card('s', 5, ''),
            new Card('s', 9, ''),
            new Card('s', 9, ''),
            new Card('s', 9, '')],
        'discard': [],
        'choice': null,
        'hand': [],
        'exhaustionImage': '',
        'hadExhaustionThisRound': false,
    },
    'r': {
        'deck': [
            new Card('r', 3, ''),
            new Card('r', 3, ''),
            new Card('r', 3, ''),
            new Card('r', 4, ''),
            new Card('r', 4, ''),
            new Card('r', 4, ''),
            new Card('r', 5, ''),
            new Card('r', 5, ''),
            new Card('r', 5, ''),
            new Card('r', 6, ''),
            new Card('r', 6, ''),
            new Card('r', 6, ''),
            new Card('r', 7, ''),
            new Card('r', 7, ''),
            new Card('r', 7, '')
        ],
        'discard': [],
        'choice': null,
        'hand': [],
        'exhaustionImage': '',
        'hadExhaustionThisRound': false,
    },
};

let gameData;

let statesObject = {
    'PHASE0': {
        setup: function () {
            gameData = initialGameData;
            shuffle(gameData.s.deck);
            shuffle(gameData.r.deck);
            console.log("PICK A RIDER?");
            return this.PHASE1A;
        }
    },
    'PHASE1A': {
        chooseRider: function (rider) {
            console.log("CHOSEN " + rider);
            gameData.chosen = rider;
            drawCards(rider, standardDraw);
            console.log(gameData[rider].hand);
            return this.PHASE1B;
        },
    },
    'PHASE1B': {
        pickCard: function (cardID) {
            console.log("PICKED CARD " + cardID)
            let riderData = gameData[gameData.chosen];
            // Pick Chosen
            riderData.choice = riderData.hand.splice(cardID, 1);
            // Discard Remaining
            move(riderData.hand, riderData.discard, riderData.hand.length);
            // Have both riders been selected?
            if (gameData.s.choice === null) {
                return this.PHASE1A.chooseRider.call(this, 's');
            }
            if (gameData.r.choice === null) {
                return this.PHASE1A.chooseRider.call(this, 'r');
            }
            gameData.chosen = '';
            return this.PHASE2;
        },
    },
    'PHASE2': {
        reveal: function () {
            console.log("SPRINTEUR: " + gameData.s.choice);
            console.log("ROULEUR: " + gameData.r.choice);
            gameData.s.choice = null;
            gameData.r.choice = null;
            return this.PHASE3;
        }
    },
    'PHASE3': {
        addExhaustion: function (rider) {
            let riderData = gameData[rider];
            if (riderData.hadExhaustionThisRound) {
                console.log("Already applied exhaustion");
            } else {
                riderData.discard.push(new Card(rider, exhaustionValue, riderData.exhaustionImage));
                riderData.hadExhaustionThisRound = true;
            }
        },
        nextRound: function () {
            gameData.s.hadExhaustionThisRound = false;
            gameData.r.hadExhaustionThisRound = false;
            console.log("PICK A RIDER?");
            return this.PHASE1A;
        }
    }
};


let game = new Stately(statesObject, 'choose_rider');
