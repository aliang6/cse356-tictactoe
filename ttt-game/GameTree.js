const PLAYERS_TURN = Box.X;
const AI_TURN = Box.O;

class GameTree {

    // Variables
    //      GameBoardNode root

    constructor(){
        this.root = new GameBoardNode(new GameBoard(), PLAYERS_TURN);
    }

    get root(){
        return this.root;
    }

    findNode(board, cursor){
        cursor = (cursor === undefined) ? this.root : cursor;
        if (cursor.equals(board))
            return cursor;
        if (cursor.numMoves >= board.numMoves)
            return null;
        
        var node = null;
        for (var config in cursor.config){
            node = node(board,config);
            if (node != null){
                break;
            }
        }
        return node;
    }

    makeMove(board, position){
        var node = findNode(board, root);
        var currentBoard = node.board;

        if (!currentBoard.checkSpot(position))
            throw `"Illegal Move to ${position}"`;
        
        var nextNode = node.config[position];
        nextNode.setProbabilities();
    }

    checkDoubleTrap(board){
        var node = findNode(board, root);
        var numPlayerMoves = node.numPlayerMoves;
        var playerMovePos = [];
        for (var i = 0; i < node.board.board.length; i++){
            if (node.board.board[i] == PLAYERS_TURN){
                playerMovePos[playerMovePosCounter] = i;
                playerMovePosCounter++;
            }
        }
        return playerMovePos;
    }

    static buildTree(root, turn){
        // builds the tree starting from root and the current turn
        if ((root == null) || (root.getIsEnd()))
            return root;
        else {
            root.buildConfig();
            var nextTurn = ((turn == PLAYERS_TURN) ? AI_TURN : PLAYERS_TURN);
            for (var child in root.config){
                GameTree.buildTree(child,nextTurn);
            }
            return root;
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
        var node = findNode(board);
        for (var i = 0; i < array.length; i++){
            if (node.config[i] instanceof GameBoardNode){
                if (array[i] == number){
                    indices.push(i);
                }
            }
        }
        return indices;
    }

    AIPlayGame(board){
        var node = findNode(board);
        if (!node.isEnd && node.currentTurn == AI_TURN){
            var playerMovePos = checkDoubleTrap();
            if (playerMovePos.length == 2){
                // check for double trap
                if (playerMovePos[0] == 0 && playerMovePos[1] == 8 && node.board.board[1] == Box.EMPTY) {
                    this.makeMove(1);
                    return true;
                }
                if (playerMovePos[0] == 2 && playerMovePos[1] == 6 && node.board.board[7] == Box.EMPTY) {
                    this.makeMove(7);
                    return true;
                }
                if (playerMovePos[0] == 4 || playerMovePos[1] == 4){
                    if (playerMovePos[0] == 4){
                        if (node.board.board[playerMovePos[0] - (playerMovePos[1] - playerMovePos[0])] == Box.EMPTY) {
                            makeMove(playerMovePos[0] - (playerMovePos[1] - playerMovePos[0]));
                            return true;
                        }
                    }
                    else if (node.board.board[playerMovePos[1] + (playerMovePos[1] - playerMovePos[0])] == Box.EMPTY) {
                        makeMove(playerMovePos[1] + (playerMovePos[1] - playerMovePos[0]));
                        return true;
                    }
                }
            }

            // arrays that hold only win and lose probs
            var winProbs = new [];
            var loseProbs = new [];

            // an array of the indices of the non-null elements in the cursor's config
            var nonNullChildren = [];

            // fill up the arrays accordingly
            for (var i = 0; i < node.config.length; i++){
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
            for (var i = 0; i < nonNullChildrenSize; i++){
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
                makeMove(sameProbs[(int)(Math.random()*sameProbsLen)]);
                return true;
            }

            // if smallest win chance occurs only once, go to that child
            if (smallestWinChanceRep == 1 || (smallestWinChance == 0.0 && loseProbs[nonNullChildren[smallestWinChanceIndex]] == 1.0))
                makeMove(nonNullChildren[smallestWinChanceIndex]);
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
                makeMove(smallestWHighestLChanceIndex);
            }

            return true;
        }
        else {
            return false;
        }
    }

}