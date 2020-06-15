
let fieldObject = [];
let fieldNode = document.querySelector(".field");
fieldNode.querySelectorAll(".row").forEach(e => {
    let cells = e.querySelectorAll(".cell");
    let row = [];
    cells.forEach(c => {
        row.push(c);
        c.addEventListener("click", CellClickHandler);
    });
    fieldObject.push(row);
});


let players = [
    { name: "cross", className: "ch", plural: "Crosses" },
    { name: "round", className: "r", plural: "Toes" }
];
let winClassesNames = ["horizontal", "vertical", "diagonal-right", "diagonal-left"];
let turns = [];
let cancelledTurns = [];
let fieldSize = fieldObject.length;


let wonTitleElement = document.querySelector(".won-title");
let wonMessageElement = document.querySelector(".won-message");
let undoButton = document.querySelector(".undo-btn");
let redoButton = document.querySelector(".redo-btn");
let restartButton = document.querySelector(".restart-btn");
undoButton.addEventListener("click", Undo);
redoButton.addEventListener("click", Redo);
restartButton.addEventListener("click", ResetGame);

let saved = JSON.parse(localStorage.getItem("ticTacToeMoves"));
if (saved && saved.length > 0) {
    let savedTurns = saved[0];
    let savedCancelledTurns = saved[1];
    savedTurns.forEach(e => Move(FromCellID(e.target), e.player));
    if (savedCancelledTurns && savedCancelledTurns.length > 0) cancelledTurns = savedCancelledTurns;
}

window.addEventListener("storage", function(event) {
    if (event.key === "ticTacToeMoves" && event.oldValue !== event.newValue) {
        let saved = event.newValue;
        resetGame(true);
        let savedCancelledTurns = JSON.parse(saved)[1];
        savedMoves = JSON.parse(saved)[0];
        if (savedTurns) savedTurns.forEach(e => Move(FromCellID(e.target), e.player, true));
        if (savedCancelledTurns && savedCancelledTurns.length > 0) cancelledTurns = savedCancelledTurns;
        ManageButtons();
    }
});


function UpdateLocalStorage() {
    localStorage.setItem("ticTacToeMoves", JSON.stringify([turns, cancelledTurns]));
}


function CellClickHandler(e) {
    if (wonTitleElement.classList.contains("hidden")) {
        let player = players[turns.length % players.length];
        Move(e.target, player);
    }
}

function Move(target, player, copied = false) {
    cancelledTurns = [];
    target.classList.add(player.className);
    turns.push({ target: target.id, player: player });
    ManageButtons();
    CheckForWin(target, fieldObject, player);
    if (!copied) localStorage.setItem("ticTacToeMoves", JSON.stringify([turns, cancelledTurns]));
}

function FromCellID(id) {
    return document.querySelector("#" + id);
}

function CheckForWin(target, field, player) {
    
    let horizontal = field.filter(e => e.includes(target))[0];
    if (horizontal.every(e => e.classList.contains(player.className))) {
        return EndGame(player, [horizontal, "horizontal"]);
    }
    
    let vertical = Array.from(
        document.querySelectorAll(".cell:nth-child(3n+" + ((+target.id.slice(2) % 3) + 1).toString() + ")")
    );
    if (vertical.every(e => e.classList.contains(player.className))) {
        return EndGame(player, [vertical, "vertical"]);
    }
    
    if (+target.id.slice(2) % (fieldSize + 1) === 0) {
        let diagonalMajor = Array.from(document.querySelectorAll(".cell")).filter(
            e => +e.id.slice(2) % (fieldSize + 1) === 0
        );
        if (diagonalMajor.every(e => e.classList.contains(player.className))) {
            return EndGame(player, [diagonalMajor, "diagonal-right"]);
        }
    }
    
    if (+target.id.slice(2) % (fieldSize - 1) === 0) {
        let diagonalMinor = Array.from(document.querySelectorAll(".cell")).filter(
            e =>
                +e.id.slice(2) % (fieldSize - 1) === 0 && +e.id.slice(2) !== 0 && +e.id.slice(2) !== fieldSize * fieldSize - 1
        );
        if (diagonalMinor.every(e => e.classList.contains(player.className))) {
            return EndGame(player, [diagonalMinor, "diagonal-left"]);
        }
    }
    
    if (document.querySelectorAll(".cell:not(.ch):not(.r) ").length === 0) {
        return EndGame(false);
    }

    return false;
}


function EndGame(player = false, cells = null) {
    wonTitleElement.classList.remove("hidden");
    if (player) {
        wonMessageElement.textContent = player.plural + " won!";
        cells[0].forEach(e => {
            e.classList.add(cells[1]);
            e.classList.add("win");
        });
    } else {
        wonMessageElement.textContent = "It's a draw!";
    }
    redoButton.disabled = true;
    undoButton.disabled = true;
    return true;
}


function ResetGame(copied = false) {
    fieldNode.querySelectorAll(".cell").forEach(e => {
        players.forEach(p => e.classList.remove(p.className));
        winClassesNames.forEach(p => e.classList.remove(p));
        e.classList.remove("win");
    });
    undoButton.disabled = true;
    redoButton.disabled = true;
    wonTitleElement.classList.add("hidden");
    turns = [];
    cancelledTurns = [];
    if (copied !== true) localStorage.setItem("ticTacToeMoves", JSON.stringify([]));
}


function ManageButtons() {
    redoButton.disabled = cancelledTurns.length === 0;
    undoButton.disabled = turns.length === 0;
    if (!wonTitleElement.classList.contains("hidden")) {
        redoButton.disabled = undoButton.disabled = true;
    }
}

function Undo() {
    let turn = turns.pop();
    cancelledTurns.push(turn);
    players.forEach(e => {FromCellID(turn.target).classList.remove(e.className);});
    ManageButtons();
    UpdateLocalStorage();
}

function Redo() {
    let turn = cancelledTurns.pop();
    turns.push(turn);
    FromCellID(turn.target).classList.add(turn.player.className);
    ManageButtons();
    UpdateLocalStorage();
}
