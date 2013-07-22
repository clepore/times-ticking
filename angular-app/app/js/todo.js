function TodoCtrl($scope, $http, $timeout) {
  
  var timerLen = 25; // seconds
  var decrement = 1;  // seconds
  var isRunning = false;

  function getReadableDate(d) {
    var curDate = d.getDate();
    var curMonth = d.getMonth() + 1; // Months are zero based
    var curYear = d.getFullYear();
    return curMonth + "/" + curDate + "/" + curYear;
  }

  function hasLocalStorage() {
    try {
      return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
      return false;
    }
  }

  function getLocalList() {
    var item = localStorage.getItem('taskTracker');
    if (item !== '' && item !== null) {
      return JSON.parse(item);
    }
    return [];  
  }

  function updateLocalList(obj) {
    localStorage.setItem('taskTracker', JSON.stringify(obj));
  }

  function getTodoById(arr, id) {
    var len = arr.length;
    for (i = 0; i < len; i++) {
      if (+arr[i].id == +id) {
        return arr[i];
      }
    }
    return {};
  }


  if (!hasLocalStorage()) {
    alert('Please use a browser that supports localstorage or this app is useless.');
    return false;
  }

  // Get existing todos from storage or use sample data
  $scope.todos = getLocalList();
  if ($scope.todos.length === 0) {
    $http.get('todos/todos.json').success(function(data) {
      $scope.todos = data;
      updateLocalList(data);
    });
  }
  $scope.orderProp = 'id';

  // Set countdown to 00
  $scope.countdown = 0;
 
  $scope.addTodo = function() {
    if ($scope.todoText === '' || $scope.todoText === undefined) {
      alert('Task name has to be longer than 0 chars.');
      return false;
    } 

    var d = new Date();
    var todo = {
      id: d.getTime(),
      name: $scope.todoText,
      date: getReadableDate(d),
      remaining: timerLen,
    };

    $scope.todos.push(todo); // Add to view
    $scope.todoText = ''; // Clear the form
    updateLocalList($scope.todos); // Save to localstorage
  };

  
  $scope.startTodoTimer = function(id) {
    if (!isRunning) {
      var todo = getTodoById($scope.todos, id);
      isRunning = true;
      $scope.countdown = todo.remaining;
      $scope.runTimer(todo);
    }
  };

  $scope.runTimer = function(todo) {
    var timr = $timeout(function() {
      if (todo.remaining === 0) {
        $timeout.cancel(timr);
        isRunning = false;
        updateLocalList($scope.todos); // Save to localstorage
        alert('Time for a break!');
      } else {
        todo.remaining -= decrement;
        $scope.countdown = todo.remaining;
        $scope.runTimer(todo);
      }
    }, decrement * 1000);
  }
}