angular.module('starter.controllers',['ionic'])


.controller('AppCtrl', ['$scope', function ($scope) {

}])
    
.controller('MainMenuCtrl', function ($scope, $stateParams,$location,$state,$rootScope,$ionicPlatform) {

    $scope.play = function (level) {
        //navigate to new page and pass level
        $state.go('app.game', {"level":level});
    };

    $scope.about = function () {
        $state.go('app.about');
    };
    
    $scope.getScore = function () {
        if (localStorage.getItem("score") !== null && localStorage.getItem("score") !== undefined) {
            $scope.score = JSON.parse(localStorage.getItem("score"));
            return $scope.score;
        }
        else {
            $scope.score = 0;
            return $scope.score;
        }
    }
    console.log('inside mainmenu ctrl');
    $ionicPlatform.registerBackButtonAction(function () {
        console.log('Attempted to exit');
        ionic.Platform.exitApp();
    }, 100);
    
})
    //rootscope for refreshing score on main menu
.controller('GameCtrl', function ($scope, $stateParams, $location, $state, $ionicPopup, $window, $ionicPlatform) {
    console.log('inside game ctrl');
    //get the level for this game
    level = $stateParams["level"];
    $scope.level = level;
    var rows = initRows();
    //setup board
    $scope.initBoard = function () {
        var rows = initRows();
        reflect2(rows);
        superShuffle(rows);
        //keep this to reference later for checkin
        var solution = copy(rows);
        removeNums(level, rows);
        var col_dict = convertToDict(rows);
        var changeables = getNullIndices(col_dict);
        $scope.changeables = changeables;
        $scope.cols = col_dict;
        $scope.col_dict = col_dict;
        $scope.is_changeable = true;
        //for clear all
        var filled = [];
        $scope.filled = filled;
        //default nothing is selected
        $scope.selected = -1;
    }
    
    //shifts numbers
    //http://www.algosome.com/articles/create-a-solved-sudoku.html
    function shift(lst, num) {
        var shuffled = [];
        var counter = 0;
        //do this 9 times
        while (counter < 9) {
            //reset to beginning of list
            if (num >= lst.length) {
                num = 0;
            }
            var current = lst[num++];
            shuffled[counter++] = current;   
        }
        return shuffled;
    }

    //upper right and lower left
    function reflect(rows) {
        //var cpy = copy(rows);
        //console.log("rows before reflect", cpy);
        for (var i = 0; i < 9; i++) {
            for (var j = i+1; j < 9; j++) {
                    var temp = rows[i][j];
                    rows[i][j] = rows[j][i];
                    rows[j][i] = temp;
            }
        }
        //var cpy2 = copy(rows);
        //console.log("rows after reflect", cpy2);
    }

    function reflect2(rows) {
        //var cpy = copy(rows);
        //console.log("before reflect2", cpy);
        for (var i = 0; i < 9; i++) {
            var limit = 8 - i;
            for (var j = 0; j < limit; j++) {
                //should add up to 8
                var temp1 = 8 - i;
                var temp2 = 8 - j;
                //console.log("temp1,temp2", temp1, temp2);

                //but then flip
                var temp = rows[temp2][temp1];
                rows[temp2][temp1] = rows[i][j];
                rows[i][j] = temp;
            }
        }
        //var cpy2 = copy(rows);
        //console.log("after reflect2", cpy2);
    }

    function superShuffle(rows) {
        //var cpy = copy(rows);
        //console.log("rows before reflection", cpy);
       
        //var cpy2 = copy(rows);
        //console.log("rows after reflection", cpy2);

        for (var i = 0; i < random(1, 25) ; i++) {
            reflect(rows);
           
            //shuffle the cols
            makeCols(rows);
            for (var j = 0 ; j < random(0, 51) ; j++) {
                shuffleCols(rows);
                makeRows(rows);
                reflect2(rows);
                makeCols(rows);
            }

            //shuffle the rows
            makeRows(rows);
            for (var j = 0; j < random(0, 50) ; j++) {
                reflect2(rows);
                swapRows(rows);
                reflect(rows);
            }
            reflect(rows);
        }
        makeCols(rows);
    }

    function makeRows(cols) {
        var cpy = copy(cols);
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                cols[i][j] = cpy[j][i];
            }
        }
    }

    function initRows() {
        var empty_rows = [];
        var shuff = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        empty_rows.push(shuff);
        //doesn't shuffle the first row so start with 1
        for (var i = 1; i < 9; i++) {
            if (i % 3 == 0) {
                shuff = shift(shuff, 4);
            }
            else {
                shuff = shift(shuff, 3);
            }
            empty_rows.push(shuff);
        }
        return empty_rows;
    }

    function random(lower, upper){
        return Math.floor(Math.random() * (upper - lower) + lower);
    }
    
    $scope.selectedButton = function (id) {
        //nothing selected
        if ($scope.selected == -1) {
            $scope.selected = id;
            document.getElementById(id).style.background = "#33cd5f";
        }
         //selected a different button then the current one
        else if ($scope.selected !== id) {
            document.getElementById($scope.selected).style.background = '#f8f8f8';
            document.getElementById(id).style.background = "#33cd5f";
            $scope.selected = id;
        }
        else {
            document.getElementById(id).style.background = '#f8f8f8';
            $scope.selected = -1;
        }
        
    }

    function copy(cpy_arry) {
        var result = [];
        for (var i = 0; i < cpy_arry.length; i++) {
            var tmp = [];
            for (var j = 0; j < cpy_arry[i].length; j++) {
                tmp.push(cpy_arry[i][j]);
            }
            result.push(tmp);
        }
        return result;
    }

    //might need work
    function swapRows(rows) {
        //var original = copy(rows);
        var groups = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
        var randNum = random(1, 14);
        for (var j = 0; j <= randNum; j++) {
            for (var i = 0; i < 3; i++) {
                //shuffle the numbers
                shuffle(groups[i]);
                var index1 = groups[i][0];
                var index2 = groups[i][1];
                swap(index2, index1, rows);
            }
        }
        //console.log("rows before swap", original);
        //var cpy = copy(rows);
        //console.log("rows after swap", cpy);
    }
    
    function swap(index1, index2, rows) {
        var temp = rows[index1];
        rows[index1] = rows[index2];
        rows[index2] = temp;
    }

    function swapCols(index2, index1, cols) {
        var cpy = copy(cols);
        cols[index1] = cpy[index2];
        cols[index2] = cpy[index1];
    }

    function makeCols(rows) {
        //make a copy for reference
        var original = copy(rows);
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                rows[j][i] = original[i][j];
            }
        }
    }

    function shuffleCols(cols) {
        var groups = [[0, 1, 2], [3, 4, 5], [6, 7, 8]];
        var randNum = Math.floor(Math.random() * (14 - 1) + 1);
        for (var i = 0; i < randNum; i++) {
            for (var j = 0; j < 3; j++) {
                shuffle(groups[j]);
                var index1 = groups[j][0];
                var index2 = groups[j][1];
                swapCols(index2, index1, cols);

            }
        }
    }
    

    function removeNums(level,cols) {
        switch (level.toLowerCase()){
            case 'easy':
                removeFromArray(45, cols);
                break;
            case 'medium':
                removeFromArray(49, cols);
                break;
            case 'hard':
                removeFromArray(54, cols);
                break;
        }
    }

    function removeFromArray(remCount,cols) {
        var count = 0;
        while (count < remCount) {
            var c = Math.round(Math.random() * (8 - 0) + 0);
            
            var rand = Math.round(Math.random() * (8 - 0) + 0);
            if (cols[c][rand] === 0) {
                rand = Math.round(Math.random() * (8 - 0) + 0);
            }
            cols[c][rand] = null;
            count++;
        }
    }

    //for creating a unique id for each button
    function convertToDict(lst) {
        var conv = [];
        var key = 0;
        for (var i = 0; i < lst.length; i++) {
            var tmp = [];
            for (var j = 0; j < lst[i].length; j++) {
                tmp.push(
                    {
                        id: key,
                        value: lst[i][j]
                    });
                key++;
            }
            conv.push(tmp);
        }
        return conv;
    }

    function getNullIndices(dict) {
        var lst = [];
        for (var i = 0; i < dict.length; i++) {
            for (var j = 0; j < dict[i].length; j++) {
                //don't know how to check if null so here is a hack
                //HACKS!!!
                if (!(dict[i][j].value > 0)) {
                    lst.push(dict[i][j].id);
                }
            }
        }
        return lst;
    }

    //http://dtm.livejournal.com/38725.html
    function shuffle(lst) {
        var i, j, t;
        for (i = 1; i < lst.length; i++) {
            j = Math.floor(Math.random() * (i + 1));
            if (j != i) {
                t = lst[i];
                lst[i] = lst[j];
                lst[j] = t;
            }
        }
    }

    function peek(lst) {
        return lst[lst.length - 1];
    }

    $scope.clear = function () {
        if ($scope.selected !== -1 && $scope.is_changeable) {
            var selected = $scope.selected.substring(1, $scope.selected.length);
            var objindex = Math.floor(selected / 9);
            var index = (selected % 9);
            if (existsIn(selected, $scope.changeables)) {
                $scope.cols[objindex][index].value = null;
                for(var i = 0; i < $scope.filled.length; i++){
                    if ($scope.filled[i].arry == objindex && $scope.filled[i].ind == index) {
                        $scope.filled.splice(i, 1);
                    }
                }
            }   
        }   
    }

    $scope.clear_all = function () {
        //check for continuation
        if ($scope.filled.length > 0 && $scope.is_changeable) {
            var clear_all = $ionicPopup.confirm({
                title: 'Clear the board?',
                template: 'This will clear all your inputs.'

            });

            clear_all.then(function (res) {
                if (res) {
                    for (var i = 0; i < $scope.filled.length; i++) {
                        var arry = $scope.filled[i].arry;
                        var ind = $scope.filled[i].ind;
                        $scope.cols[arry][ind].value = null;
                    }
                    $scope.filled = [];
                    document.getElementById('title').style.background = '#444444';
                }
                
            });
        }
    }
    //making sure we can't delete numbers that shouldn't be 
    function existsIn(num,lst){
        var i = 0;
        while(i < lst.length){
            if(lst[i] == num){
                return true;
            }
            i++;
        }
        return false;
    }

    $scope.fill = function (num) {
        if ($scope.selected !== -1 && $scope.is_changeable) {
            var selected = $scope.selected.substring(1, $scope.selected.length);
            var objindex = Math.floor(selected / 9);
            var index = (selected % 9);
            if(existsIn(selected,$scope.changeables)){
                $scope.cols[objindex][index].value = num;
                document.getElementById($scope.selected).style.fontWeight = "900";
                document.getElementById($scope.selected).style.color = "blue";
                //add to filled for remove all functionality
                var fill_info = {
                    arry: objindex,
                    ind: index
                };
                $scope.filled.push(fill_info);
                console.log($scope.filled)
                
                if (finished()) {
                    if (isValid()) {
                        var points = 0;
                        switch ($scope.level) {
                            case 'Easy':
                                points = 10;
                                break;
                            case 'Medium':
                                points = 20;
                                break;
                            case 'Hard':
                                points = 30;
                                break;
                        }
                        //get and update score
                        if (localStorage.getItem("score") !== null && localStorage.getItem("score") !== undefined) {
                            score = JSON.parse(localStorage.getItem("score"))+ points;
                        }
                        else {
                            score = points;
                        }

                        localStorage.setItem("score", JSON.stringify(score));


                        showWin();
                        document.getElementById('title').style.background = '#33cd5f';
                    }
                    else {
                        showFail();
                        document.getElementById('title').style.background = '#ef473a';
                    }
                }
            }
            
        }
    }

    function showFail() {
        var fail = $ionicPopup.alert({
            title: 'Incorrect',
            template: 'Your solution is inccorect. Keep trying!'

        });
        fail.then(function (res) {
            console.log('you lost');
        });
    }

    function showWin() {
        $scope.is_changeable = false;
        var win = $ionicPopup.confirm({
            title: 'You Got It!',
            template: 'Would you like to play again?'

        });

        win.then(function (res) {
            if (res) {
                document.getElementById('title').style.background = '#444444';
                $scope.initBoard();
            }
        });
    }

    function finished() {
        for (var i = 0; i < $scope.cols.length; i++) {
            for (var j = 0; j < $scope.cols[i].length; j++) {
                if ($scope.cols[i][j].value !== '' && !($scope.cols[i][j].value > 0)) {
                    //not finished still working on the puzzle
                    return false;
                }
            }
        }
        return true;
    }

    function isValid() {
        console.log("checkrows", checkRows());
        console.log("checkcols", checkCols());
        console.log("checkGroups", checkGroups());
        return checkRows() && checkCols() && checkGroups();
    }

    function checkRows() {
        for (var i = 0; i < 9; i++) {
            var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            for (var j = 0; j < 9; j++) {
                var index = nums.indexOf($scope.cols[j][i].value);
                if (index != -1) {
                    nums.splice(index, 1);
                }
                else {
                    return false;
                }
            }
            if (nums.length !== 0) {
                return false;
            }
        }
        return true;
    }

    function checkCols() {
        for(var i = 0; i < 9; i++){
            var nums = [1,2,3,4,5,6,7,8,9];
            for (var j = 0; j < 9; j++) {
                var index = nums.indexOf($scope.cols[i][j].value);
                if (index != -1) {
                    nums.splice(index, 1);
                }
                else {
                    return false;
                }
            }
            if (nums.length !== 0) {
                return false;
            }
        }
        return true;
    }

    function checkGroups() {
        for (var k = 0; k < 3; k++) {
            for (var i = 0; i < 9; i++) {
                if (i % 3 === 0) {
                    var nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                }
                for (var j = 0; j < 3; j++) {
                    var x = i % 9;
                    var y = (j % 9) + (k * 3);
                    var num = $scope.cols[x][y].value;
                    var index = nums.indexOf(num);
                    if (index != -1) {
                        nums.splice(index, 1);
                    }
                    else {
                        return false;
                    }
                }
                if (i % 3 === 0 && nums.length === 0) {
                    return false;
                }
            }
        }
        return true;
    }
    $scope.ask_refresh = function () {
        if ($scope.filled.length > 0 && $scope.is_changeable) {
            var win = $ionicPopup.confirm({
                title: 'Refresh Puzzle?',
                template: 'All your progress will be lost.'

            });

            win.then(function (res) {
                if (res) {
                    document.getElementById('title').style.background = '#444444';
                    $scope.initBoard();
                }
            });
        }
        else {
            $scope.initBoard();
        }
    }

    $ionicPlatform.registerBackButtonAction(function () {
        if ($scope.filled.length > 0 && $state.current.name === 'app.game' && $scope.is_changeable) {
            var stillPlaying = $ionicPopup.confirm({
                title: 'Leave and Lose Progress?',
                template: 'Your board will not be saved.'
            });

            stillPlaying.then(function (res) {
                if (res) {
                    for (var i = 0; i < $scope.filled.length; i++) {
                        var arry = $scope.filled[i].arry;
                        var ind = $scope.filled[i].ind;
                        $scope.cols[arry][ind].value = null;
                    }
                    $scope.filled = [];
                    $scope.initBoard();
                    console.log('going back to main menu from game');
                    $state.go('app.main_menu');
                }
            });
        }
        else if($state.current.name === 'app.game') {
            $scope.initBoard();
            console.log('going back to maien menu from game');
            $state.go('app.main_menu');
        }
        else if ($state.current.name === 'app.main_menu') {
            console.log("exit goes here");
            ionic.Platform.exitApp();
        }

    }, 100);
        
    })

.controller('AboutCtrl', function ($scope,$state,$ionicPlatform) {
    $ionicPlatform.registerBackButtonAction(function () {
        console.log('inside ABout ctrl');
        console.log('going back to main menu from about');

        if ($state.current.name === 'app.about'){
            $state.go('app.main_menu');
        }
        
    else if ($state.current.name === 'app.main_menu') {
            console.log("exit goes here");
            ionic.Platform.exitApp();
        }
    }, 100);

})