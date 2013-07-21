$(function() {
  var $form = $('#taskForm');

  $form.taskTracker({
    $addButton: $form.find('button[type=submit]'),
    $taskList: $('.task-container'),
    $startButton: $('.task-container .start-btn'),
    $countDown: $('.countdown'),
    timerLength: 25,  // 25 seconds
    timerDecrement: 1,  // One second
    existingTasks: [
      {"id": 1374438506412, "name": "Test Task #1", "date": "12/01/2012", 'remaining': 5},
      {"id": 1374438506411, "name": "Test Task #2", "date": "12/02/2012", 'remaining': 5},
      {"id": 1374438506410, "name": "Test Task #3", "date": "12/03/2012", 'remaining': 5}
    ]
  }); 
});