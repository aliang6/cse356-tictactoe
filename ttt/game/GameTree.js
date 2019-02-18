exports.id = 'game/GameTree';
var gbModule = require('./GameBoard');
var gbnModule = require('./GameBoardNode');
var Box = gbModule.Box;
var GameBoard = gbModule.GameBoard;
var GameBoardNode = gbnModule.GameBoardNode;


const PLAYERS_TURN = Box.X;
const AI_TURN = Box.O;
const WIN_INDEX = gbnModule.WIN_INDEX;
const DRAW_INDEX = gbnModule.DRAW_INDEX;
const LOSE_INDEX = gbnModule.LOSE_INDEX;

class GameTree {

    // Variables
    //      GameBoardNode root

    constructor(){
        this.root = new GameBoardNode(new GameBoard(), PLAYERS_TURN);
        this.dict = {}
    }

    get root(){
        return this.rootVal;
    }

    set root(root){
        this.rootVal = root;
    }

    findNode(board){
        if (board == null)
            return null;
        var node = (this.dict[board.cacheID] === undefined) ? null : this.dict[board.cacheID];
        return node;
    }

    makeMove(node, position){
        var currentBoard = node.board;

        if (!currentBoard.checkSpot(position))
            throw `"Illegal Move to ${position}"`;
        
        var nextNode = node.config[position];
        nextNode.calcProbs();
        return nextNode;
    }

    checkDoubleTrap(node){
        var playerMovePos = [];
        for (var i = 0; i < node.board.board.length; i++){
            if (node.board.board[i] == PLAYERS_TURN){
                playerMovePos.push(i);
            }
        }
        return playerMovePos;
    }

    buildTree(turn, root){
        // builds the tree starting from root and the current turn
        root = (root == null) ? this.root : root;
        var found = (this.dict[root.cacheID] != undefined);
        if (!found){
            this.dict[root.cacheID] = root;
        }
        if (root.isEnd)
            return;
        else {
            // only build this branch of the tree if we haven't built it yet
            // if (!found){
            //     root.buildConfig();
            //     var nextTurn = ((turn == PLAYERS_TURN) ? AI_TURN : PLAYERS_TURN);
            //     for (var child in root.config){
            //         this.buildTree(nextTurn,root.config[child]);
            //     }
            //     return;    
            // }
            root.buildConfig();
            var nextTurn = ((turn == PLAYERS_TURN) ? AI_TURN : PLAYERS_TURN);
            for (var child in root.config){
                this.buildTree(nextTurn,root.config[child]);
            }
            return;  
        }
    }

    static findOccurrences(number, array){
        var occurrences = 0;
        for (var i = 0; i < array.length; i++){
            if (array[i] == number)
                occurrences++;
        }
        return occurrences;
    }

    static findOccurrencesPositions(number, array){
        var occurrencesPos = [];
        for (var i = 0; i < array.length; i++){
            if (array[i] == number){
                occurrencesPos.push(i);
            }
        }
        if (occurrencesPos.length == 0)
            return null;
        return occurrencesPos;
    }

    indicesOfRep(board, number, array){
        // find indices of repeated elements in an array
        var occurrences = findOccurrences(number,array);
        var indices = [];
        var node = this.findNode(board);
        for (var i = 0; i < array.length; i++){
            if (node.config[i] instanceof GameBoardNode){
                if (array[i] == number){
                    indices.push(i);
                }
            }
        }
        return indices;
    }

    isLegalBoard(node){
        var numPlayerMoves = node.board.numPlayerMoves(PLAYERS_TURN);
        var numMoves = node.board.numMoves;
        var numAIMoves = numMoves - numPlayerMoves;
        return (Math.abs(numPlayerMoves - numAIMoves) <= 1);
    }

    AIPlayGame(board){
        var node = this.findNode(board);
        if (!this.isLegalBoard(node))
            return null;
        if (node == null)
            return null;
        if (node.isEnd)
            return node;
        if (!node.isEnd && node.currentTurn == AI_TURN){
            var playerMovePos = this.checkDoubleTrap(node);
            if (playerMovePos.length == 2){
                // check for double trap
                if (playerMovePos[0] == 0 && playerMovePos[1] == 8 && node.board.board[1] == Box.EMPTY) {
                    return this.makeMove(node, 1);
                }
                if (playerMovePos[0] == 2 && playerMovePos[1] == 6 && node.board.board[7] == Box.EMPTY) {
                    return this.makeMove(node, 7);
                }
                if (playerMovePos[0] == 4 || playerMovePos[1] == 4){
                    if (playerMovePos[0] == 4){
                        if (node.board.board[playerMovePos[0] - (playerMovePos[1] - playerMovePos[0])] == Box.EMPTY) {
                            return this.makeMove(node, playerMovePos[0] - (playerMovePos[1] - playerMovePos[0]));
                        }
                    }
                    else if (node.board.board[playerMovePos[1] + (playerMovePos[1] - playerMovePos[0])] == Box.EMPTY) {
                        return this.makeMove(node, playerMovePos[1] + (playerMovePos[1] - playerMovePos[0]));
                    }
                }
            }

            // arrays that hold only win and lose probs
            var winProbs = [];
            var loseProbs = [];

            // an array of the indices of the non-null elements in the cursor's config
            var nonNullChildren = [];

            // fill up the arrays accordingly
            for (var i in node.config){
                node.config[i].calcProbs();
                if (node.config[i] instanceof GameBoardNode){
                    nonNullChildren.push(i);
                }
                winProbs.push(node.config[i].probs[WIN_INDEX]);
                loseProbs.push(node.config[i].probs[LOSE_INDEX]);
            }

            // loop through to find the smallest win prob and highest lose prob and respective indices
            var smallestWinChanceIndex = -1;
            var smallestWinChance = 1.0;
            var highestLoseChanceIndex = -1;
            var highestLoseChance = 0.0;
            for (var i = 0; i < nonNullChildren.length; i++){
                if (winProbs[nonNullChildren[i]] < smallestWinChance){
                    smallestWinChance = winProbs[nonNullChildren[i]];
                    smallestWinChanceIndex = i;
                }
                if (loseProbs[nonNullChildren[i]] > highestLoseChance){
                    highestLoseChance = loseProbs[nonNullChildren[i]];
                    highestLoseChanceIndex = i;
                }
            }

            // find the number of times each one occurs
            var smallestWinChanceRep = GameTree.findOccurrences(smallestWinChance, winProbs);
            var highestLoseChanceRep = GameTree.findOccurrences(highestLoseChance, loseProbs);

            // if there are multiple nodes with the same probabilities, move to a random one
            var multiple = false;
            var sameWinProbs = GameTree.findOccurrencesPositions(smallestWinChance,winProbs);
            var sameLoseProbs = GameTree.findOccurrencesPositions(highestLoseChance,loseProbs);
            var sameProbs = [];
            for (var i = 0; i < sameWinProbs.length; i++){
                for (var j = 0; j < sameLoseProbs.length; j++){
                    if (sameWinProbs[i] == sameLoseProbs[j]) {
                        sameProbs.push(sameWinProbs[i]);
                    }
                }
            }
            
            if (sameProbs.length > 0){
                return this.makeMove(node, sameProbs[parseInt(Math.random()*sameProbs.length)]);
            }

            // if smallest win chance occurs only once, go to that child
            if (smallestWinChanceRep == 1 || (smallestWinChance == 0.0 && loseProbs[nonNullChildren[smallestWinChanceIndex]] == 1.0))
                return this.makeMove(node, nonNullChildren[smallestWinChanceIndex]);
            else {
                // else go to the child with the smallest win chance and highest lose chance
                var smallestWHighestLChanceIndex = nonNullChildren[smallestWinChanceIndex];
                var smallestWHighestLChance = loseProbs[nonNullChildren[smallestWinChanceIndex]];
                var indicesOfWinChance = indicesOfRep(smallestWinChance,winProbs);
                for (var i = 0; i < indicesOfWinChance.length; i++){
                    if (loseProbs[indicesOfWinChance[i]] >= smallestWHighestLChance){
                        smallestWHighestLChanceIndex = indicesOfWinChance[i];
                        smallestWHighestLChance = loseProbs[indicesOfWinChance[i]];
                    }
                }
                return this.makeMove(node, smallestWHighestLChanceIndex);
            }
        }
        else {
            return null;
        }
    }

}


module.exports.GameTree = GameTree;
module.exports.PLAYERS_TURN = PLAYERS_TURN;
module.exports.AI_TURN = AI_TURN;