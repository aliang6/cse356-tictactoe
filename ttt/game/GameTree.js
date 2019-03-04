exports.id = 'game/GameTree';
var gbModule = require('./GameBoard');
var gbnModule = require('./GameBoardNode');
var Box = gbModule.Box;
var GameBoard = gbModule.GameBoard;
var GameBoardNode = gbnModule.GameBoardNode;


const PLAYERS_TURN = Box.X;
const AI_TURN = Box.O;
const DRAW_TURN = Box.EMPTY;
const WIN_INDEX = gbnModule.WIN_INDEX;
const DRAW_INDEX = gbnModule.DRAW_INDEX;
const LOSE_INDEX = gbnModule.LOSE_INDEX;

class GameTree {

    constructor(){
        this.root = new GameBoardNode(new GameBoard(), PLAYERS_TURN);
        this.dict = {}
    }

    // Getters and Setters
    get root(){
        return this.rootVal;
    }

    set root(root){
        this.rootVal = root;
    }

    /**
     * Finds the GameBoardNode corresponding to the current board.
     * 
     * Uses the board's cacheID to search the cache.
     * @param {GameBoard} board the current board
     */
    findNode(board){
        if (board == null)
            return null;
        var node = (this.dict[board.cacheID] == undefined) ? null : this.dict[board.cacheID];
        return node;
    }

    /**
     * Finds the GameBoardNode corresponding to a board's cache ID.
     * 
     * Uses the board's cacheID to search the cache.
     * @param {GameBoard} board the current board
     */
    findNodeByID(cacheID){
        if (cacheID == null)
            return null;
        var node = (this.dict[cacheID] == undefined) ? null : this.dict[cacheID];
        return node;
    }
    
    /**
     * Checks if the board is legal.
     * 
     * Not used if the cache is used, as cache will always contain all
     * valid board states. If findNode(board) returns null, the board is invalid.
     * @param {GameBoard} board the current board
     */
    isLegalBoard(board){
        var numPlayerMoves = board.numPlayerMoves(PLAYERS_TURN);
        var numMoves = board.numMoves;
        var numAIMoves = numMoves - numPlayerMoves;
        return (Math.abs(numPlayerMoves - numAIMoves) <= 1);
    }

    /**
     * Returns the positions of the player's moves.
     * @param {GameBoardNode} node the state of the game
     */
    getPlayerMoves(node){
        var playerMovePos = [];
        for (var i = 0; i < node.board.board.length; i++){
            if (node.board.board[i] == PLAYERS_TURN){
                playerMovePos.push(i);
            }
        }
        return playerMovePos;
    }

    /**
     * Makes a move and returns the next node representing the new state of the game.
     * @param {GameBoardNode} node  the state of the game
     * @param {int} position        the position to make a move
     */
    makeMove(node, position){
        var currentBoard = node.board;

        if (!currentBoard.checkSpot(position))
            return null;
            // throw `"Illegal Move to ${position}"`;
        
        var nextNode = node.config[position];
        nextNode.calcProbs();
        return nextNode;
    }

    /**
     * Builds the GameTree starting at root with the turn specified.
     * @param {Box} turn            the current turn
     * @param {GameBoardNode} root  the root of the GameTree
     */
    buildTree(turn, root){
        root = (root == null) ? this.root : root;
        var found = (this.dict[root.cacheID] != undefined);
        if (!found){
            this.dict[root.cacheID] = root;
        }
        if (root.isEnd)
            return;
        else {
            // NOTE: we HAVE to build every part of the tree, even if some nodes are identical
            // REASONING: given two board game nodes (states) X and Y s.t. X.equals(Y),
            //              if X != Y then X.parent != Y.parent and the probabilities are different.
            //              If we do not build the whole tree, the whole calculation of probabilities
            //              will be thrown off by error that propagates from branches that are cut short.
            root.buildConfig();
            var nextTurn = ((turn == PLAYERS_TURN) ? AI_TURN : PLAYERS_TURN);
            for (var child in root.config){
                this.buildTree(nextTurn,root.config[child]);
            }
            return;  
        }
    }

    /**
     * Returns a list of the GameBoardNodes that correspond to the list of moves specified.
     * If invalid, returns null.
     * 
     * @param {int[]} moves a list of the moves that have been made for a specific game
     */
    gameHistory(moves){
        let currentNode = this.root;
        var history = [];
        for (var index in moves){
            let move = moves[index];
            if (currentNode.config[move] == null){
                return null;
            }
            currentNode = currentNode.config[move];
            history.push(currentNode);
        }
        return history;
    }

    /**
     * Returns the number of times number appears in array.
     * @param {int} number      number to search for
     * @param {int[]} array     array to look through
     */
    static findOccurrences(number, array){
        var occurrences = 0;
        for (var i = 0; i < array.length; i++){
            if (array[i] == number)
                occurrences++;
        }
        return occurrences;
    }

    /**
     * Returns the indices that number appears in in array.
     * @param {int} number      number to search for
     * @param {int[]} array     array to look through
     */
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

    /**
     * Returns the new state of the game by calculating probabilities.
     * @param {GameBoard} board     the GameBoard representing the current state of the game
     * @param {int} playerMove      the position the player wishes to move
     */
    AIPlayGame(board, playerMove){
        var node = this.findNode(board);

        // Check if board is legal.
        if (node == null)
            return null;

        // Check if the board specified has already ended.
        if (node.isEnd)
            return node;

        // If the player did not specify a move, return the current node.
        if (playerMove == undefined){
            return node;
        }

        // If the player specified a move but it is not his turn, then return null.
        if (node.currentTurn != PLAYERS_TURN)
            return null;

        // Attempt to make the player's move.
        node = this.makeMove(node, playerMove);
        
        // If the player specified an invalid move or if the game has reached the end,
        //      then return the node.
        if (node == null || node.isEnd)
            return node;

        // Calculate which move to make and return the new node.
        if (!node.isEnd && node.currentTurn == AI_TURN){
            var playerMovePos = this.getPlayerMoves(node);
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
                nonNullChildren.push(i);
                winProbs.push(node.config[i].probs[WIN_INDEX]);
                loseProbs.push(node.config[i].probs[LOSE_INDEX]);
            }

            // loop through to find the smallest win prob and highest lose prob and respective indices
            var smallestWinChanceIndex = -1;
            var smallestWinChance = 1.0;
            var highestLoseChanceIndex = -1;
            var highestLoseChance = 0.0;
            for (var i = 0; i < nonNullChildren.length; i++){
                if (winProbs[i] < smallestWinChance){
                    smallestWinChance = winProbs[i];
                    smallestWinChanceIndex = i;
                }
                if (loseProbs[i] > highestLoseChance){
                    highestLoseChance = loseProbs[i];
                    highestLoseChanceIndex = i;
                }
            }

            // find the number of times each one occurs
            var smallestWinChanceRep = GameTree.findOccurrences(smallestWinChance, winProbs);
            var highestLoseChanceRep = GameTree.findOccurrences(highestLoseChance, loseProbs);

            // console.log("hi3.2");
            // console.log("winprobs = " + winProbs);
            // console.log("loseprobs = " + loseProbs);
            // console.log("nonnullchildren = " + nonNullChildren);
            // console.log("smallestwinchance = " + smallestWinChance);
            // console.log("smallestwinchanceindex = " + smallestWinChanceIndex);
            // console.log("highestlosechance = " + highestLoseChance);
            // console.log("highestlosechanceindex = " + highestLoseChanceIndex);
            // console.log("smallestwinchancerep = " + smallestWinChanceRep);
            // console.log("highestlosechancerep = " + highestLoseChanceRep);

            // if there are multiple nodes with the same probabilities, move to a random one
            // var multiple = false;
            // var sameWinProbs = GameTree.findOccurrencesPositions(smallestWinChance,winProbs);
            // var sameLoseProbs = GameTree.findOccurrencesPositions(highestLoseChance,loseProbs);
            // var sameProbs = [];
            // for (var i = 0; i < sameWinProbs.length; i++){
            //     for (var j = 0; j < sameLoseProbs.length; j++){
            //         if (sameWinProbs[i] == sameLoseProbs[j]) {
            //             sameProbs.push(sameWinProbs[i]);
            //         }
            //     }
            // }

            // console.log("hi3.5");
            
            // if (sameProbs.length > 0){

            //     let random = Math.random() * sameProbs.length;
            //     console.log("sameprobs len = " + sameProbs.length + "random = " + parseInt(random));
            //     console.log("sameprobs = " + sameProbs);
                
            //     return this.makeMove(node, sameProbs[parseInt(random)]);
            // }

            // if smallest win chance occurs only once, go to that child
            if (smallestWinChanceRep == 1 || (smallestWinChance == 0.0 && loseProbs[smallestWinChanceIndex] == 1.0)){
                return this.makeMove(node, nonNullChildren[smallestWinChanceIndex]);
            }
            else {
                // else go to the child with the smallest win chance and highest lose chance
                var smallestWHighestLChanceIndex = smallestWinChanceIndex;
                var smallestWHighestLChance = loseProbs[smallestWinChanceIndex];
                var indicesOfSWinChance = GameTree.findOccurrencesPositions(smallestWinChance,winProbs);
                // console.log("indicesofswinchance = " + indicesOfSWinChance);
                for (var i = 0; i < indicesOfSWinChance.length; i++){
                    if (loseProbs[indicesOfSWinChance[i]] >= smallestWHighestLChance){
                        smallestWHighestLChanceIndex = indicesOfSWinChance[i];
                        smallestWHighestLChance = loseProbs[indicesOfSWinChance[i]];
                    }
                }
                // console.log("smallestwhighestlchanceindex = " + smallestWHighestLChanceIndex);
                // console.log("smallestwhighestlchance = " + smallestWHighestLChance);
                return this.makeMove(node, nonNullChildren[smallestWHighestLChanceIndex]);
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
module.exports.DRAW_TURN = DRAW_TURN;