var Box = {"EMPTY": 0, "X": 1, "O": 2,}
const BOARD_SIZE = 9;

class GameBoard {

    // Variables
    //      Box[] board

    constructor(boardState){
        if (boardState !== undefined)
            this.board = boardState;
        else {
            this.board = [];
            for (var i = 0; i < BOARD_SIZE; i++){
                this.board.push(Box.EMPTY);
            }
        }
    }
    get board(){
        return this.board;
    }
    get boardSize(){
        return BOARD_SIZE;
    }
    set board(boardState){
        this.board = boardState;
    }

    checkSpot(position){
        if (position < 0 || position >= BOARD_SIZE)
            throw `"Position ${position} is invalid."`;
        return ((board[position] != Box.EMPTY || position < 0 || position >= BOARD_SIZE) ? false : true);
    }

    setMove(position, turn){
        if (!(turn == Box.EMPTY || turn == Box.X || turn == Box.O))
            throw `"Move ${turn} is invalid."`;
        if (checkSpot(position))
            board[position] = turn;
    }

    clone(){
        copyBoard = [];
        for (var box in this.board){
            copyBoard.push(box);
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

}