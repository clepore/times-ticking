'use strict';

/* Controllers */

function TodoListCntrl($scope, $http) {
  $http.get('todos/todos.json').success(function(data) {
    $scope.todos = data;
  });

  $scope.orderProp = 'id';
}

//PhoneListCtrl.$inject = ['$scope', '$http'];
