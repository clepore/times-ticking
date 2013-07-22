function TodoCtrl($scope, $http) {
  var timerLength = 25000;
  var decrement = 1000;

  $http.get('todos/todos.json').success(function(data) {
    $scope.todos = data;
  });
  $scope.orderProp = 'id';
  
  $scope.addTodo = function() {

    if ($scope.todoText === '') {
      alert('Task name has to be longer than 0 chars.');
      return false;
    } 

    var d = new Date();
    var todo = {
      id: d.getTime(),
      name: $scope.todoText,
      date: getReadableDate(d),
      remaining: (timerLength / 1000),
    };

    $scope.todos.push(todo);
    $scope.todoText = '';
  };
 
  $scope.remaining = function() {
    var count = 0;
    angular.forEach($scope.todos, function(todo) {
      count += todo.done ? 0 : 1;
    });
    return count;
  };
 
  $scope.archive = function() {
    var oldTodos = $scope.todos;
    $scope.todos = [];
    angular.forEach(oldTodos, function(todo) {
      if (!todo.done) $scope.todos.push(todo);
    });
  };
}

function getReadableDate(d) {
  var curDate = d.getDate();
  var curMonth = d.getMonth() + 1; //Months are zero based
  var curYear = d.getFullYear();
  return curMonth + "/" + curDate + "/" + curYear;
}