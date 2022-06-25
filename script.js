const gameContainer = document.getElementById("game"); //this div houses all the 'card' divs
const startButton = document.getElementById("start-button"); //this form's input initializes and begins the game
const endButton = document.querySelector('#end-button'); //this span will contain a reset form once the game ends
const scoreCounter = document.querySelector('#score-value'); //this span contains the value of the current score
const highScoreCounter = document.querySelector('#highscore-value'); //this span contains the value of the high score
const cardInput = document.querySelector('input'); //this input determines how many cards are generated
let numCards = 0; //the number of cards the game is played with
let clickedCards = 2; //how many cards have been clicked, resets after 2 have been clicked on
let prevCard = {}; //the previously clicked on card, resets once 2 cards have been clicked on, is an html object
let gameStarted = false; //has the game begun yet?
let score = 0; //the current score
let highScore = 10000; //the current highscore, initiliazes as some obscure very high number, since game uses golf scoring

startButton.addEventListener('submit', function (e) { //listen for the start form being submitted
  e.preventDefault();
  if (!gameStarted) { //ensure we only start the game once
    startGame(); //initialize everything inside the game
  }
})

function startGame() {
  gameStarted = true; //ensure we only start the game once
  if (cardInput.value < 6 || isNaN(cardInput.value)) { //if the card input was invalid
    createEnd(false, true);
    return; //prevents the game from continuing to initialize
  } //otherwise go ahead initializing
  numCards = cardInput.value;
  cardInput.value = ''; //clean up the form a little
  createDivsForColors(shuffle(makeRandomColors())); //creates our cards using a randomized color array based on numCards
  if (localStorage.getItem('highScore') != null) { //checks if we have a stored highscore
    highScore = parseInt(localStorage.getItem('highScore'));
    highScoreCounter.innerText = highScore + " "; //updates our highscore
    addHighScoreReset(); //adds a button to reset our highscore
  }
  scoreCounter.innerText = score; //initializes our current score
  const cards = document.querySelectorAll('#card'); //grabs all of our cards
  for (let card of cards) { //and reveals their color one by one
    card.style.backgroundColor = card.className;
  }
  setTimeout(function () { //after one second of all cards being revealed, flip them over and begin the game
    for (let card of cards) {
      card.style.backgroundColor = 'white';
    }
    clickedCards = 0; //game cannot accept new card clicks until clickedCards == 0
  }, 1000)
}

//creates the form to reset the game once the game ends
//accepts two booleans, newScore is whether a new highscore was achieved, invalidInput is whether the game was invalid to begin with
function createEnd(newScore, invalidInput) {
  const endForm = document.createElement('form');
  const endLabel = document.createElement('label');
  const resetButton = document.createElement('button');
  resetButton.innerText = 'Reset';
  if (!invalidInput) {
    if (newScore) {
      endLabel.innerText = "Congratulations! You scored new record: " + highScore + " ";
    }
    else {
      endLabel.innerText = 'Congratulations! You Won: '
    }
  }
  else {
    endLabel.innerText = "Invalid Input, Please Reset ";
  }
  endForm.append(endLabel);
  endForm.append(resetButton);
  endButton.append(endForm);
}

//I did not write these comments or this function
// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
  let counter = array.length;

  // While there are elements in the array
  while (counter > 0) {
    // Pick a random index
    let index = Math.floor(Math.random() * counter);

    // Decrease counter by 1
    counter--;

    // And swap the last element with it
    let temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
}

//this function creates and then returns an array of random rgb color values,
function makeRandomColors() {
  let tempArr = [];
  for (let i = 0; i < numCards / 2; i++) {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    tempArr.push("rgb(" + r + "," + g + ',' + b + ")");
  }
  return tempArr.concat(tempArr); //it actually returns that array twice
}

//I did not write this function or these comments but I did make a modification on line: 118
// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
  for (let color of colorArray) {
    // create a new div
    const newDiv = document.createElement("div");

    // give it a class attribute for the value we are looping over
    newDiv.classList.add(color);
    newDiv.id = 'card'; //I added an id to these cards so I could find the divs that were cards specifically

    // call a function handleCardClick when a div is clicked on
    newDiv.addEventListener("click", handleCardClick);

    // append the div to the element with an id of game
    gameContainer.append(newDiv);
  }
}

function handleCardClick(event) {
  if (gameStarted) { //only handle clicks if the game started
    //if we have a prev card and our current card is not said prev card and our card hasn't been removed from the game
    if (clickedCards === 1 && event.target != prevCard && event.target.id =='card') {
      score++; //we've made a card comparison so increase the score
      scoreCounter.innerText = score;
      clickedCards = 2; //set clickedCards so no new clicks can be processed until this comparison is resolved
      event.target.style.backgroundColor = event.target.className; //reveal our newly clicked card
      if (event.target.className === prevCard.className) { //if the cards match
        event.target.id = "flipped"; //remove flipped cards from clickable cards
        prevCard.id = "flipped";
        clickedCards = 0; //allow new clicks to process
        prevCard = {}; //reset prevCard
        if (detectEnd()) { //check if the game has ended
          scroll(0, 0); //if it has scroll to the top
          const newScore = score < highScore; //check if we have a new high score
          if (newScore) { //if we do
            highScore = score; //update our highscore, writing it both to the page and localStorage
            highScoreCounter.innerText = highScore + " ";
            localStorage.setItem('highScore', highScore);
          }
          createEnd(newScore, false); //create an end form that acknowledges our newScore
        }
      } else { //if the game didn't end
        resetCards(event.target, prevCard); //reset the cards in play
      }
      return; //prevents this click from being processed further
    }
    if (clickedCards === 0 && event.target.id == 'card') { //if this is the first card clicked on
      event.target.style.backgroundColor = event.target.className; //reveal our card
      clickedCards = 1;
      prevCard = event.target; //save our card
      return; //prevents this click from being processed further
    }
  }
}

//resets two cards in play after one second has passed and then allows new cards to be processed
function resetCards(card1, card2) { 
  setTimeout(function () {
    card1.style.backgroundColor = "white";
    card2.style.backgroundColor = "white";
    clickedCards = 0;
    prevCard = {};
  }, 1000);
}

//checks if the game has ended by making sure not all cards have been flipped
function detectEnd() {
  return document.querySelectorAll('#card').length == 0;
}

//creates a button to reset the high score
function addHighScoreReset() {
  const rhsbtn = document.createElement('button');
  rhsbtn.innerText = "Reset"
  rhsbtn.addEventListener('click', function () {
    rhsbtn.remove();
    highScore = 10000;
    highScoreCounter.innerText = "";
    localStorage.removeItem('highScore');
  });
  highScoreCounter.append(rhsbtn);
}