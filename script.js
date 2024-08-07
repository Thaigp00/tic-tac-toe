const Gameboard = (function() {
    const board = [[null, null, null], 
                   [null, null, null], 
                   [null, null, null]];

    function isFull() {
        for (line of board) {
            for (square of line) {
                if (square === null) return false;
            }
        }
        return true;
    }

    function restart() {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                board[i][j] = null;
            }
        }
    }

    function getWinner() {
        for (let i = 0; i < board.length; i++) {
            if (board[i][0] !== null && board[i][1] !== null && board[i][2] !== null &
                board[i][0].mark === board[i][1].mark && 
                board[i][1].mark === board[i][2].mark)
                    return board[i][0];

            if (board[0][i] !== null && board[1][i] !== null && board[2][i] !== null &
                board[0][i].mark === board[1][i].mark && 
                board[1][i].mark === board[2][i].mark) 
                    return board[0][i];
        }
        if (board[0][0] !== null && board[1][1] !== null && board[2][2] !== null &&
            board[0][0].mark === board[1][1].mark && 
            board[1][1].mark === board[2][2].mark ||
            board[0][2] !== null && board[1][1] !== null && board[2][0] !== null &&
            board[0][2].mark === board[1][1].mark && 
            board[1][1].mark === board[2][0].mark)
                return board[1][1];
        
        
        if (isFull()) return "none";
        return false
    }

    function isOver() {
        if (!getWinner()) return false;
        return true;
    }

    function addMove(move, player) {
        board[move[0]][move[1]] = player;
    }

    return { board, getWinner, isOver, restart, addMove };
})();

function createPlayer(name, mark, number) {
    function setMark(mark) {
        this.mark = mark;
    }

    return { name, mark, setMark, number };
}

const Game = (function() {
    const symbol1 = "✖";
    const symbol2 = "⬤";
    let Player1;
    let Player2;
    let currentPlayer;
    const squares = document.querySelectorAll(".square");

    function getMarks() {
        const mark1 = (Math.random() < 0.5) ? symbol1 : symbol2;
        const mark2 = (mark1 === symbol1) ? symbol2 : symbol1;
        return [mark1, mark2];
    }

    function createPlayers() {
        const dialog = document.querySelector("dialog");
        const submitBtn = document.querySelector("dialog button");
        submitBtn.addEventListener("click", (event) => {
            event.preventDefault();

            const name1 = document.querySelector("dialog input#first");
            const name2 = document.querySelector("dialog input#second");

            if (!name1.value) alert("No Player 1 Name");
            else if (!name2.value) alert("No Player 2 Name");
            else {
                dialog.close();
                dialog.style.display = "none";

                const marks = getMarks();
                Player1 = createPlayer(name1.value, marks[0], 1);
                Player2 = createPlayer(name2.value, marks[1], 2);
                name1.value = "";
                name2.value = "";
                currentPlayer = Player1;
                
                Display.setPlayersInfo(Player1, Player2);
                Display.setMessage(currentPlayer, Gameboard.isOver());
            }
        });
    }

    function getMoves() {
        squares.forEach(square => {
            square.addEventListener("click", event => {
                const move = event.target.attributes.index.value;
                if (!Gameboard.isOver() && isValid(move)) {
                    Gameboard.addMove(move, currentPlayer);

                    currentPlayer = (currentPlayer === Player1) ? Player2 : Player1;
                    Display.update(currentPlayer, square, Gameboard.isOver(), move);

                    if (Gameboard.isOver()) setTimeout(restart, 2000);
                }
            });
        });
    }

    function isValid(move) {
        return !Gameboard.board[move[0]][move[1]];
    }

    function restart() {
        const marks = getMarks();
        Player1.setMark(marks[0]);
        Player2.setMark(marks[1]);
        Display.setPlayersInfo(Player1, Player2);

        Gameboard.restart();
        Display.updateAll(currentPlayer);
    }

    function play() {
        Display.run();
        createPlayers();
        getMoves();        
    }

    return { play, restart };
})();

const Display = (function() {
    const squares = document.querySelectorAll(".square");
    const dialog = document.querySelector("dialog");
    const score1Element = document.querySelector(".player-1 .score");
    const score2Element = document.querySelector(".player-2 .score");
    let score1 = 0;
    let score2 = 0;

    function setPlayersInfo(player1, player2) {
        const player1Info = document.querySelector(".player-1");
        const player2Info = document.querySelector(".player-2");
        const name1Element = document.querySelector(".player-1 .name");
        const name2Element = document.querySelector(".player-2 .name");

        player1Info.setAttribute("mark", player1.mark);
        player2Info.setAttribute("mark", player2.mark);
        name1Element.textContent = player1.name;
        name2Element.textContent = player2.name;
        score1Element.textContent = score1;
        score2Element.textContent = score2;
    }

    function increaseScore(number) {
        if (number === 1) {
            score1++;
            score1Element.textContent = score1;
        }
        else if (number === 2) {
            score2++;
            score2Element.textContent = score2;
        }

    }

    function setMessage(player, isOver=false) {
        const messageElement = document.querySelector(".message");
        if (isOver) {
            const winner = Gameboard.getWinner();
            if (winner === "none") messageElement.textContent = "It's a draw!";
            else {
                messageElement.textContent = `${winner.name} won!!!`;
                increaseScore(winner.number);
            }
        }
        else {
            messageElement.textContent = `It's ${player.name}'s turn.`;
        }
    }  

    function run() {
        dialog.showModal();

        const restartBtn = document.querySelector("button.restart");
        restartBtn.addEventListener("click", () => {
            dialog.showModal();
            dialog.style.display = "grid";

            score1 = 0;
            score2 = 0;
            Game.restart();
        });
    }

    function update(player, square, isOver = false, move = "none") {
        setMessage(player, isOver);

        if (move === "none") {
            square.textContent = "";
            square.setAttribute("mark", "");
        }
        else {
            const mark = Gameboard.board[move[0]][move[1]].mark;
            square.textContent = mark;
            square.setAttribute("mark", mark);
        }
    }

    function updateAll(player) {
        squares.forEach(square => {
            update(player, square);
        });
    }

    return { run, update, updateAll, setPlayersInfo, setMessage };
})();


function main() {
    Game.play();
}

main();