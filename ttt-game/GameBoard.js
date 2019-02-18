var Box = {"EMPTY": 3, "X": 1, "O": 2}
const BOARD_SIZE = 9;

class GameBoard {

    // Variables
    //      Box[] board

    constructor(boardState){
        if (boardState !== undefined)
            this.boardState = boardState;
        else {
            this.boardState = [];
            for (var i = 0; i < BOARD_SIZE; i++){
                this.boardState.push(Box.EMPTY);
            }
        }
    }
    get board(){
        return this.boardState;
    }
    get boardSize(){
        return BOARD_SIZE;
    }
    set board(boardState){
        this.boardState = boardState;
    }

    checkSpot(position){
        if (position < 0 || position >= BOARD_SIZE)
            throw `"Position ${position} is invalid."`;
        return ((this.board[position] != Box.EMPTY || position < 0 || position >= BOARD_SIZE) ? false : true);
    }

    setMove(position, turn){
        if (!(turn == Box.EMPTY || turn == Box.X || turn == Box.O))
            throw `"Move ${turn} is invalid."`;
        if (this.checkSpot(position))
            this.board[position] = turn;
    }

    clone(){
        var copyBoard = [];
        for (var i in this.board){
            copyBoard.push(this.board[i]);
        }
        return new GameBoard(copyBoard);
    }

    equals(otherBoard){
        if (otherBoard instanceof GameBoard){
            for (var i = 0; i < BOARD_SIZE; i++){
                if (this.board[i] != otherBoard.board[i]){
                    return false;
                }
            }
            return true;
        }
        return false;
    }

    get numMoves(){
        var numMoves = 0;
        for (var i = 0; i < BOARD_SIZE; i++){
            if (this.board[i] != Box.EMPTY)
                numMoves++;
        }
        return numMoves;
    }

    numPlayerMoves(playerTurn){
        var numPlayerMoves = 0;
        for (var i = 0; i < BOARD_SIZE; i++){
            if (this.board[i] == playerTurn)
                numPlayerMoves++;
        }
        return numPlayerMoves;
    }

    get cacheID(){
        var id = "";
        for (var i in this.board){
            id += this.board[i];
        }
        return id;
    }

}

GameBoard.prototype.toString = function GameBoardToString(){
    var boardStr = "";
    for (var i = 0; i < BOARD_SIZE; i++){
        boardStr += "|";
        if (this.board[i] == Box.EMPTY)
            boardStr += " ";
        else {
            boardStr += (this.board[i] == Box.X) ? "X" : "O";
        }
        if (i % 3 == 2)
            boardStr += "|\n";
    }
    return boardStr;
}