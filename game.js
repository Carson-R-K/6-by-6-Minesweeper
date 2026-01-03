const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const rows = 6;
const cols = 6;
const totalMines = 6; // adjust as you like
let cellSize = 50; // will be updated by resizeCanvas

// Board representation
// { mine: boolean, revealed: boolean, flagged: boolean, adjacent: number }
let board = [];

// Initialize empty board
function initBoard() {
  board = Array(rows).fill().map(() => Array(cols).fill().map(() => ({
    mine: false,
    revealed: false,
    flagged: false,
    adjacent: 0
  })));

  placeMines();
  calculateAdjacent();
}

// Randomly place mines
function placeMines() {
  let placed = 0;
  while (placed < totalMines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!board[r][c].mine) {
      board[r][c].mine = true;
      placed++;
    }
  }
}

// Calculate numbers for each cell
function calculateAdjacent() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (board[nr][nc].mine) count++;
          }
        }
      }
      board[r][c].adjacent = count;
    }
  }
}

// Resize canvas and redraw
function resizeCanvas() {
  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.9;
  cellSize = Math.min(width / cols, height / rows);
  canvas.width = cellSize * cols;
  canvas.height = cellSize * rows;
  drawBoard();
}

// Draw the board
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      const x = c * cellSize;
      const y = r * cellSize;

      // Background
      ctx.fillStyle = cell.revealed ? '#ddd' : '#3498db';
      ctx.fillRect(x, y, cellSize, cellSize);

      // Draw number or mine
      if (cell.revealed) {
        if (cell.mine) {
          ctx.fillStyle = 'red';
          ctx.beginPath();
          ctx.arc(x + cellSize/2, y + cellSize/2, cellSize/4, 0, 2*Math.PI);
          ctx.fill();
        } else if (cell.adjacent > 0) {
          ctx.fillStyle = 'black';
          ctx.font = `${cellSize/2}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(cell.adjacent, x + cellSize/2, y + cellSize/2);
        }
      }

      // Draw flag
      if (cell.flagged && !cell.revealed) {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.moveTo(x + cellSize*0.25, y + cellSize*0.75);
        ctx.lineTo(x + cellSize*0.75, y + cellSize*0.5);
        ctx.lineTo(x + cellSize*0.25, y + cellSize*0.25);
        ctx.closePath();
        ctx.fill();
      }

      // Grid border
      ctx.strokeStyle = 'black';
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }
}

// Reveal cell (recursive for zeros)
function reveal(r, c) {
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;

  if (cell.mine) {
    alert('Game Over!');
    initBoard();
    drawBoard();
    return;
  }

  if (cell.adjacent === 0) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          reveal(nr, nc);
        }
      }
    }
  }

  checkWin();
}

// Check if all non-mine cells revealed
function checkWin() {
  let won = true;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if (!cell.mine && !cell.revealed) won = false;
    }
  }
  if (won) {
    alert('You Win!');
    initBoard();
  }
}

// Mouse click handling
canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);
  reveal(r, c);
  drawBoard();
});

// Right-click for flags
canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const c = Math.floor(x / cellSize);
  const r = Math.floor(y / cellSize);
  const cell = board[r][c];
  if (!cell.revealed) cell.flagged = !cell.flagged;
  drawBoard();
});

window.addEventListener('resize', resizeCanvas);

initBoard();
resizeCanvas();
