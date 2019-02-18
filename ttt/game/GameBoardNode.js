exports.id = 'game/GameBoardNode';

var Box = require('./GameBoard').Box;
var GameBoard = require('./GameBoard').GameBoard;

// Indices that describe each index of the array returned by getNumLeaves(node)
const WIN_INDEX = 0;
const DRAW_INDEX = 1;
const LOSE_INDEX = 2;
const CONFIG_LEN = 9;
const WINNER_JSON_KEY = "winner";

class GameBoardNode {

    // Variables
    //      GameBoard board
    //      bool isEnd
    //      Box currentTurn, X or O
    //      Box winner, EMPTY if draw
    //      GameBoardNode[] config
    //      GameBoardNode parent
    //      double[] probs
    //      double winProb, loseProb, drawProb

    //      int winLeaves, drawLeaves, loseLeaves

    constructor(board, currentTurn, parent){
        if (currentTurn == Box.EMPTY || board == null)
            throw "GameBoardNode was constructed with illegal parameters.";
        this.board = board;
        this.isEnd = false;
        this.currentTurn = currentTurn;
        this.config = [];
        this.winner = null;
        this.probs = [0.0, 0.0, 0.0];
        this.winProb = 0.0;
        this.loseProb = 0.0;
        this.drawProb = 0.0;
        this.parent = (parent === undefined) ? null : parent;
    }

    get board(){
        return this.boardState;
    }

    set board(boardState){
        this.boardState = boardState;
    }

    get isEnd(){
        return this.isEndVal;
    }

    set isEnd(isEnd){
        this.isEndVal = isEnd;
    }

    get currentTurn(){
        return this.currentTurnVal;
    }

    set currentTurn(currentTurn){
        this.currentTurnVal = currentTurn;
    }

    get winner(){
        return this.winnerVal;
    }

    set winner(winner){
        this.winnerVal = winner;
    }

    get config(){
        return this.configVal;
    }

    set config(config){
        this.configVal = config;
    }

    get winProb(){
        return this.winProbVal;
    }
    
    set winProb(winProb){
        this.winProbVal = winProb;
    }

    get loseProb(){
        return this.loseProbVal;
    }
    
    set loseProb(loseProb){
        this.loseProbVal = loseProb;
    }

    get drawProb(){
        return this.drawProbVal;
    }

    set drawProb(drawProb){
        this.drawProbVal = drawProb;
    }

    get probs(){
        return this.probsVal;
    }

    set probs(probs){
        this.probsVal = probs;
    }

    get parent(){
        return this.parentVal;
    }

    set parent(parent){
        this.parentVal = parent;
    }

    get numChildren(){
        var numChildren = 0;
        for (var i = 0; i < CONFIG_LEN; i++){
            if (i > this.config.length)
                break;
            if (this.config[i] instanceof GameBoardNode)
                numChildren++;
        }
        return numChildren;
    }

    get numMoves(){
        return this.board.numMoves;
    }

    get numPlayerMoves(){
        return this.board.numPlayerMoves(Box.X);
    }

    numLeaves(node, winL, drawL, loseL){
        winL = (winL == undefined) ? 0 : winL;
        drawL = (drawL == undefined) ? 0 : drawL;
        loseL = (loseL == undefined) ? 0 : loseL;
        var leaves = [];
        for (var i = 0; i <= 2; i++){
            if (i == WIN_INDEX)
                leaves.push(winL);
            else if (i == DRAW_INDEX)
                leaves.push(drawL);
            else
                leaves.push(loseL);
        }
        if (node == null)
            return leaves;
        if (node.isEnd){
            if (node.winner == Box.X)
                leaves[WIN_INDEX] += 1;
            else if (node.winner == Box.EMPTY)
                leaves[DRAW_INDEX] += 1;
            else
                leaves[LOSE_INDEX] += 1;
        }
        else {
            for (var i = 0; i < node.config.length; i++){
                var child = node.config[i];
                if (child instanceof GameBoardNode){
                    var childLeaves = child.numLeaves(child,winL,drawL,loseL);
                    for (var j = 0; j < childLeaves.length; j++){
                        leaves[j] += childLeaves[j];
                    }
                }
            }
        }
        return leaves;
    }

    calcProbs(){
        // get the total # of leaves of each type
        var leaves = this.numLeaves(this);
        var winLeaves = leaves[WIN_INDEX];
        var drawLeaves = leaves[DRAW_INDEX];
        var loseLeaves = leaves[LOSE_INDEX];
        var totalLeaves = winLeaves + drawLeaves + loseLeaves;

        // (type) prob = (type) leaves / total leaves
        this.winProb = winLeaves / totalLeaves;
        this.drawProb = drawLeaves / totalLeaves;
        this.loseProb = loseLeaves / totalLeaves;
        this.probs[WIN_INDEX] = this.winProb;
        this.probs[DRAW_INDEX] = this.drawProb;
        this.probs[LOSE_INDEX] = this.loseProb;
    }

    buildConfig(){
        var nextTurn = ((this.currentTurn == Box.X) ? Box.O : Box.X);
        var boxBoard = this.board.board;
        for (var i = 0; i < boxBoard.length; i++){
            if (boxBoard[i] == Box.EMPTY){
                var configBoard = this.board.clone();
                configBoard.setMove(i,this.currentTurn);
                var configNode = new GameBoardNode(configBoard,nextTurn,this);
                configNode.checkWinner();
                this.config[i] = configNode;
            }
        }
    }

    checkWinner(){
        var winnerReturned = null;
        var boardArray = this.board.board;

        // check horizontal
        for (var horizontalPos = 1; horizontalPos < boardArray.length; horizontalPos += 3){
            var boxAtHPos = boardArray[horizontalPos];
            if ((boxAtHPos != Box.EMPTY) && (boardArray[horizontalPos-1] == boardArray[horizontalPos+1]) && (boardArray[horizontalPos-1] == boxAtHPos))
                winnerReturned = boxAtHPos;
        }

        // check vertical
        for (var verticalPos = 3; verticalPos < boardArray.length-3; verticalPos++){
            var boxAtVPos = boardArray[verticalPos];
            if ((boxAtVPos != Box.EMPTY) && (boardArray[verticalPos-3] == boardArray[verticalPos+3]) && (boardArray[verticalPos-3] == boxAtVPos))
                winnerReturned = boxAtVPos;
        }

        // check diagonal
        var centerPos = 4;
        var boxAtCPos = boardArray[centerPos];
        if (boxAtCPos != Box.EMPTY){
            if ((boardArray[centerPos-2] == boardArray[centerPos+2]) && (boardArray[centerPos-2] == boxAtCPos))
                winnerReturned = boxAtCPos;
            if ((boardArray[centerPos-4] == boardArray[centerPos+4]) && (boardArray[centerPos-4] == boxAtCPos))
                winnerReturned = boxAtCPos;
        }

        // if board is full and no previous cases were true, then its a draw
        if ((this.numMoves == 9) && (winnerReturned == null)){
            winnerReturned = Box.EMPTY;
        }

        this.winner = winnerReturned;

        if (winnerReturned != null){
            this.isEnd = true;
        }

        return winnerReturned;
    }

    equals(otherNode){
        return this.board.equals(otherNode.board);
    }

    get cacheID(){
        return this.board.cacheID;
    }

    toJSON(){
        var dict = this.board.toJSON();
        var val = '';
        if (this.winner != null){
            switch (this.winner){
                case Box.X:
                    val = 'X';
                    break;
                case Box.O:
                    val = 'O';
                    break;
                case Box.EMPTY:
                    val = ' ';
                    break;
            }
        }
        dict[WINNER_JSON_KEY] = val;
        return dict;
    }
}

GameBoardNode.prototype.toString = function GameBoardNodeToString(){
    return this.board.toString();
}

module.exports.GameBoardNode = GameBoardNode;
module.exports.WIN_INDEX = WIN_INDEX;
module.exports.DRAW_INDEX = DRAW_INDEX;
module.exports.LOSE_INDEX = LOSE_INDEX;
module.exports.CONFIG_LEN = CONFIG_LEN;
module.exports.WINNER_JSON_KEY = WINNER_JSON_KEY;