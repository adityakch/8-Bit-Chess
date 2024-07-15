const board = document.getElementById('chessboard');
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('reset');
let selectedPiece = null;
let currentPlayer = 'white';
const pieces = {
    'R': '♜', 'N': '♞', 'B': '♝', 'Q': '♛', 'K': '♚', 'P': '♟',
    'r': '♖', 'n': '♘', 'b': '♗', 'q': '♕', 'k': '♔', 'p': '♙'
};
let gameBoard = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

function createBoard() {
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            square.dataset.row = row;
            square.dataset.col = col;
            square.textContent = pieces[gameBoard[row][col]] || '';
            square.addEventListener('click', handleClick);
            board.appendChild(square);
        }
    }
}

function handleClick(event) {
    const square = event.target;
    const row = parseInt(square.dataset.row);
    const col = parseInt(square.dataset.col);

    if (selectedPiece) {
        const fromRow = parseInt(selectedPiece.dataset.row);
        const fromCol = parseInt(selectedPiece.dataset.col);
        if (isValidMove(fromRow, fromCol, row, col)) {
            movePiece(selectedPiece, square);
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            statusDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
        }
        clearHighlights();
        selectedPiece = null;
    } else if (square.textContent && isPieceOfCurrentPlayer(row, col)) {
        square.classList.add('selected');
        selectedPiece = square;
        highlightValidMoves(row, col);
    }

    checkGameState();
}

function isPieceOfCurrentPlayer(row, col) {
    const piece = gameBoard[row][col];
    return (currentPlayer === 'white' && piece === piece.toUpperCase()) ||
           (currentPlayer === 'black' && piece === piece.toLowerCase());
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = gameBoard[fromRow][fromCol].toLowerCase();
    const dx = Math.abs(toCol - fromCol);
    const dy = Math.abs(toRow - fromRow);

    // Check if the destination square has a piece of the same color
    if (gameBoard[toRow][toCol] && !isEnemyPiece(fromRow, fromCol, toRow, toCol)) {
        return false;
    }

    switch (piece) {
        case 'p':
            return isValidPawnMove(fromRow, fromCol, toRow, toCol);
        case 'r':
            return (fromRow === toRow || fromCol === toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
        case 'n':
            return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
        case 'b':
            return dx === dy && isPathClear(fromRow, fromCol, toRow, toCol);
        case 'q':
            return ((fromRow === toRow || fromCol === toCol) || (dx === dy)) && isPathClear(fromRow, fromCol, toRow, toCol);
        case 'k':
            return dx <= 1 && dy <= 1;
        default:
            return false;
    }
}

function isValidPawnMove(fromRow, fromCol, toRow, toCol) {
    const dx = Math.abs(toCol - fromCol);
    const dy = toRow - fromRow;
    const direction = currentPlayer === 'white' ? -1 : 1;

    // Move forward
    if (dx === 0 && !gameBoard[toRow][toCol]) {
        if (dy === direction) return true;
        if (dy === 2 * direction && ((currentPlayer === 'white' && fromRow === 6) || (currentPlayer === 'black' && fromRow === 1))) {
            return !gameBoard[fromRow + direction][fromCol];
        }
    }
    // Capture diagonally
    else if (dx === 1 && dy === direction && isEnemyPiece(fromRow, fromCol, toRow, toCol)) {
        return true;
    }
    return false;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const dx = Math.sign(toCol - fromCol);
    const dy = Math.sign(toRow - fromRow);
    let x = fromCol + dx;
    let y = fromRow + dy;

    while (x !== toCol || y !== toRow) {
        if (gameBoard[y][x]) return false;
        x += dx;
        y += dy;
    }

    return true;
}

function isEnemyPiece(fromRow, fromCol, toRow, toCol) {
    const fromPiece = gameBoard[fromRow][fromCol];
    const toPiece = gameBoard[toRow][toCol];
    return toPiece && (fromPiece === fromPiece.toUpperCase()) !== (toPiece === toPiece.toUpperCase());
}

function movePiece(from, to) {
    const fromRow = parseInt(from.dataset.row);
    const fromCol = parseInt(from.dataset.col);
    const toRow = parseInt(to.dataset.row);
    const toCol = parseInt(to.dataset.col);

    gameBoard[toRow][toCol] = gameBoard[fromRow][fromCol];
    gameBoard[fromRow][fromCol] = '';

    // Update the DOM
    to.innerHTML = from.innerHTML;
    from.innerHTML = '';

    // Pawn promotion
    if (gameBoard[toRow][toCol].toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
        const promotionPiece = currentPlayer === 'white' ? 'Q' : 'q';
        gameBoard[toRow][toCol] = promotionPiece;
        const pieceElement = to.querySelector('span');
        pieceElement.textContent = pieces[promotionPiece];
        pieceElement.className = currentPlayer === 'white' ? 'white-piece' : 'black-piece';
    }

    playMoveSound();
}

function highlightValidMoves(row, col) {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (isValidMove(row, col, i, j)) {
                document.querySelector(`[data-row="${i}"][data-col="${j}"]`).classList.add('valid-move');
            }
        }
    }
}

function clearHighlights() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('selected', 'valid-move');
    });
}

function checkGameState() {
    if (isCheckmate()) {
        statusDisplay.textContent = `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
    } else if (isStalemate()) {
        statusDisplay.textContent = "Stalemate! The game is a draw.";
    }
}

function isCheckmate() {
    // Simplified checkmate detection
    return false;
}

function isStalemate() {
    // Simplified stalemate detection
    return false;
}

function playMoveSound() {
    const audio = new Audio('assets/move-sound.wav');
    audio.play();
}

function resetGame() {
    gameBoard = [
        ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
        ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
        ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
    ];
    currentPlayer = 'white';
    statusDisplay.textContent = "White's turn";
    createBoard();
}

resetButton.addEventListener('click', resetGame);
createBoard();