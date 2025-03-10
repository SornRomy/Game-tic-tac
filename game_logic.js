let playerText = document.getElementById('playerText');
let restartBtn = document.getElementById('restartBtn');
let startBtn = document.getElementById('startBtn');
let gameboard = document.getElementById('gameboard');
let modeModal = document.getElementById('modeModal');
let timeoutId = null;  // To store the timeout ID for bot moves


const O_TEXT = "O";
const X_TEXT = "X";
let currentPlayer = X_TEXT;
let boardSize = 3;  // Fixed to 10x10
let winLength = 3;   // Win condition: 3 in a row
let spaces = Array(boardSize * boardSize).fill(null);
let gameMode = ""; // Will store the selected game mode

const CELL_SIZE = 50; // Cell size remains fixed

const createBoard = () => {
    gameboard.innerHTML = ''; 
    gameboard.style.gridTemplateColumns = `repeat(${boardSize}, 1fr)`;
    gameboard.style.width = `${boardSize * CELL_SIZE}px`;

    for (let i = 0; i < boardSize * boardSize; i++) {
        let box = document.createElement('div');
        box.classList.add('box');
        box.style.width = `${CELL_SIZE}px`;
        box.style.height = `${CELL_SIZE}px`;
        box.setAttribute('id', i);
        box.addEventListener('click', boxClicked);
        gameboard.appendChild(box);
    }
};

function boxClicked(e) {
    const id = parseInt(e.target.id);

    if (!spaces[id] && gameMode !== "botVsBot") {
        spaces[id] = currentPlayer;
        e.target.innerText = currentPlayer;

        // Check if the current player has won
        if (playerHasWon(id)) {
            playerText.innerHTML = `${currentPlayer} has won!`;
            setTimeout(() => {
                alertify.alert(`${currentPlayer} Wins!`, function() {
                    goBackToStart();
                });
            }, 100); // Delay alert display
            return;
        }

        // Check for draw (if no winner and all spaces are filled)
        if (spaces.every(space => space !== null)) {
            playerText.innerHTML = "It's a Draw!";
            setTimeout(() => {
                alertify.alert("Draw!", function() {
                    goBackToStart();
                });
            }, 100); // Delay alert display
            return;
        }

        // Switch to the other player's turn
        currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;

        // If Player vs Bot or Bot vs Bot, make the bot move
        if (gameMode === "playerVsBot" && currentPlayer === O_TEXT) {
            botMove();
        }
        if (gameMode === "botVsBot" && currentPlayer === O_TEXT) {
            botMove();
        }
    }
}


function playerHasWon(index) {
    let row = Math.floor(index / boardSize);
    let col = index % boardSize;

    return (
        checkDirection(row, col, 1, 0) || // Horizontal
        checkDirection(row, col, 0, 1) || // Vertical
        checkDirection(row, col, 1, 1) || // Diagonal ↘
        checkDirection(row, col, 1, -1)   // Diagonal ↙
    );
}

function checkDirection(row, col, rowDir, colDir) {
    let count = 1;

    count += countMarks(row, col, rowDir, colDir);   // Forward check
    count += countMarks(row, col, -rowDir, -colDir); // Backward check

    return count >= winLength; // Win if marks match `winLength`
}

function countMarks(row, col, rowDir, colDir) {
    let count = 0;
    let r = row + rowDir;
    let c = col + colDir;

    while (r >= 0 && r < boardSize && c >= 0 && c < boardSize && spaces[r * boardSize + c] === currentPlayer) {
        count++;
        r += rowDir;
        c += colDir;
    }
    return count;
}

function restart() {
    if (timeoutId !== null) {
        clearTimeout(timeoutId);  // Clear the timeout to stop bot moves
    }

    spaces.fill(null);  // Reset the board state
    currentPlayer = X_TEXT;  // Reset the starting player
    createBoard();  // Create a fresh gameboard
    playerText.innerHTML = "Tic Tac Toe";  // Reset the title
    restartBtn.style.display = 'none';  // Hide the restart button again
    gameboard.style.display = 'none';  // Hide the gameboard until the user starts the next game
    startBtn.style.display = 'inline-block';  // Show the start button to start a new game
}

function goBackToStart() {
    // Hide the gameboard, restart button, and game-related UI elements
    gameboard.style.display = 'none';  // Hide the gameboard
    restartBtn.style.display = 'none';  // Hide the restart button
    startBtn.style.display = 'inline-block';  // Show the start button

    // Reset the player text to initial state
    playerText.innerHTML = "Tic Tac Toe";  

    // Clear the board and game state
    spaces.fill(null);  // Reset board state
    currentPlayer = X_TEXT;  // Reset player to X

    // Clear any timeout for bot moves if it's a Bot vs Bot game
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }
}



document.getElementById('Back').addEventListener('click', () => {
    goBackToStart();  // Hide the gameboard, show the start button, and reset the game state
    modeModal.style.display = 'none';  // Hide the game mode selection modal
});


startBtn.addEventListener('click', showGameModeModal);

function showGameModeModal() {
    modeModal.style.display = 'flex';  // Show the modal
}

document.getElementById('playerVsPlayer').addEventListener('click', () => {
    gameMode = 'playerVsPlayer';
    modeModal.style.display = 'none';
    startGame();
});

document.getElementById('playerVsBot').addEventListener('click', () => {
    gameMode = 'playerVsBot';
    modeModal.style.display = 'none';
    startGame();
});

document.getElementById('botVsBot').addEventListener('click', () => {
    gameMode = 'botVsBot';
    modeModal.style.display = 'none';
    startGame();
});

function startGame() {
    startBtn.style.display = 'none';  // Hide Start button
    gameboard.style.display = 'grid'; // Show Gameboard
    restartBtn.style.display = 'inline-block'; // Show Restart button
    spaces.fill(null); // Reset the board state at the start of the game
    currentPlayer = X_TEXT;  // Start the game with Player X
    createBoard();  // Create a fresh gameboard
    playerText.innerHTML = "X's Turn";  // Indicate that it's X's turn

    if (gameMode === "botVsBot") {
        setTimeout(() => botMove(), 500);  // Start Bot 1's move (X)
    }
}
document.addEventListener('DOMContentLoaded', () => {
    restartBtn.addEventListener('click', restart);
});






function botMove() {
    // Check for available spaces (the bot will only play on these)
    let availableSpaces = spaces.map((space, index) => space === null ? index : -1).filter(index => index !== -1);

    if (availableSpaces.length === 0) return; // No available spaces, exit

    // Select a random available space for the bot
    let botMoveIndex = availableSpaces[Math.floor(Math.random() * availableSpaces.length)];

    // Make the bot's move
    spaces[botMoveIndex] = currentPlayer;
    document.getElementById(botMoveIndex).innerText = currentPlayer;

    // Check if the current bot has won
    if (playerHasWon(botMoveIndex)) {
        playerText.innerHTML = `${currentPlayer} has won!`;
        setTimeout(() => {
            alertify.alert(`${currentPlayer} Wins!`, function() {
                goBackToStart();
            });
        }, 100); // Delay alert display
        return;
    }

    // Check for draw (if no winner and all spaces are filled)
    if (spaces.every(space => space !== null)) {
        playerText.innerHTML = "It's a Draw!";
        setTimeout(() => {
            alertify.alert("Draw!", function() {
                goBackToStart();
            });
        }, 100); // Delay alert display
        return;
    }

    // Switch to the other bot's turn
    currentPlayer = currentPlayer === X_TEXT ? O_TEXT : X_TEXT;

    // If it's Bot vs Bot mode, switch to the other bot's turn after a small delay
    if (gameMode === "botVsBot") {
        setTimeout(() => botMove(), 500);  // Bot O's turn after a delay
    }
}



