// Indices that describe each index of the array returned by getNumLeaves(node)
const WIN_INDEX = 0;
const DRAW_INDEX = 1;
const LOSE_INDEX = 2;
const CONFIG_LEN = 9;

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
        this.currentTurn = currentTurn;
        this.config = [];
        this.winner = null;
        this.probs = [0.0, 0.0, 0.0];
        this.winProb = 0.0;
        this.loseProb = 0.0;
        this.drawProb = 0.0;
        this.parent = (parent === undefined) ? null : parent;
        this.isEnd = false;
        checkWinner();
    }

    get board(){
        return this.board;
    }

    get isEnd(){
        return this.isEnd;
    }

    get currentTurn(){
        return this.currentTurn;
    }

    get winner(){
        return this.winner;
    }

    get config(){
        return this.config;
    }

    get winProb(){
        return this.winProb;
    }

    get loseProb(){
        return this.loseProb;
    }

    get drawProb(){
        return this.drawProb;
    }

    get probs(){
        return this.probs;
    }

    get parent(){
        return this.parent;
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
        var numMoves = 0;
        for (var i = 0; i < this.board.board.length; i++){
            if (board.board[i] != Box.EMPTY)
                numMoves++;
        }
        return numMoves;
    }

    get numPlayerMoves(){
        var numPlayerMoves = 0;
        for (var i = 0; i < board.board.length; i++){
            if (board.board[i] == Box.X)
                numPlayerMoves++;
        }
        return numPlayerMoves;
    }

    get numLeaves(node, winL, drawL, loseL){
        winL = (winL === undefined) ? 0 : winL;
        drawL = (drawL === undefined) ? 0 : drawL;
        loseL = (loseL === undefined) ? 0 : loseL;
        var leaves = [];
        for (var i = 0; i < 2; i++){
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
            for (var i = 0; i < node.config().length; i++){
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

    set probs(){
        // get the total # of leaves of each type
        var leaves = numLeaves(this);
        this.winLeaves = leaves[WIN_INDEX];
        this.drawLeaves = leaves[DRAW_INDEX];
        this.loseLeaves = leaves[LOSE_INDEX];
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
                configBoard.setMove(i,currentTurn);
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
}

GameBoardNode.prototype.toString = function GameBoardNodeToString(){
    var boardStr = "";
    for (var i = 0; i < board.boardSize; i++){
        boardStr += "|";
        if (board.board[i] == Box.EMPTY)
            boardStr += " ";
        else
            boardStr += board.board[i];
        if (i % 3 == 2)
            boardStr += "|\n";
    }
    return boardStr;
}