/**
 * @Pomodoro Task Tracker
 * @version 2.0
 * @author Christopher Lepore <christopher.r.lepore@gmail.com> 
 */

(function($) {
  var methods = {
    init: function(options) {
      options = $.extend({}, $.fn.taskTracker.defaults, options);
      
      return this.each(function() {
        var $this = $(this);
        $this.data('taskTracker', {
          options: options,
          runningTimer: null
        });  
        methods.setup.call($this); 
      });
    }

  , setup: function() {
      if (!functions.hasLocalStorage()) {
        alert('Please use a browser that supports localstorage or this is useless.');
        return false;
      }

      var $self = $(this);   
      var data = $self.data('taskTracker');

      data.options.$addButton.click(function(e) {
        e.preventDefault();
        var newTask = functions.createTaskObj.call($self);
        if (newTask) {
          functions.saveTask.call($self, newTask);
          $('#taskName').val('');
        }
      });

      data.options.$taskList.on('click', data.$startButton, function(e) {
        if (data.runningTimer !== null) {
          alert('Finish the current task first!');
          return false;
        }
      
        var $btn;
        if (e.target.nodeName === 'I') {
          $btn = $(e.target).parent(); // get btn
        } else {
          $btn = $(e.target); // is button
        }
        $btn.css('visibility', 'hidden');
        var $row = $btn.closest('tr');
        var task = functions.getTask(data.options.existingTasks, $row.data('id'));

        $row.addClass('success');
        functions.startTimer.call($self, task, data.options.timerDecrement);
      });
      
      var storedTasks = functions.getLocalList();
      if (storedTasks.length > 0) {
        // Update existingTasks to the localstorage ones
        data.options.existingTasks = storedTasks;
        
        // Add only stored tasks to html
        for (var i = 0, len = storedTasks.length; i < len; i++) {
          data.options.$taskList.prepend(functions.createTableRow(storedTasks[i]));
        }
      } else {
        // Add default tasks to localstorage AND html
        for (var i = 0, len = data.options.existingTasks.length; i < len; i++) {
          data.options.$taskList.prepend(functions.createTableRow(data.options.existingTasks[i]));
        }
        functions.updateLocalList.call($self, data.options.existingTasks);
      }
    }
  };
    
  var functions = {

    getTask: function(objArr, id) {
      var foundObj = $.grep(objArr, function(obj, i) {
        return (obj.id == id);
      });
      if (foundObj.length > 0) {
        return foundObj[0];
      }
      return {};
    }
  
    // Save tasks to dom and local storage
 ,  saveTask: function(taskObj) {
      var $this = $(this);         
      var data = $this.data('taskTracker');

      data.options.$taskList.prepend(functions.createTableRow(taskObj));
      data.options.existingTasks.push(taskObj);

      functions.updateLocalList(data.options.existingTasks);
    }

    // Create a task obj from form inputs
  , createTaskObj: function() {
      var $this = $(this);
      var data = $this.data('taskTracker');

      var newTaskName = $.trim($('#taskName').val());

      if (newTaskName === '') {
        alert('Task name has to be longer than 0 chars.');
        return false;
      } 

      var d = new Date();
      
      var task = {
        id: d.getTime(),
        name: newTaskName,
        date: functions.getReadableDate(d),
        remaining: data.options.timerLength,
      };
      return task;
    }

    // Create the markup for new table row
  , createTableRow: function(obj) {
      var $tr = $('<tr data-id="' + obj['id'] + '">');
      for (var prop in obj) {
        if (prop !== 'id') {
          $tr.append('<td class="task-' + prop + '">' + obj[prop] + '</td>');
        }
      }
      if (obj.remaining === 0) {
        $tr.append('<td/>');
      } else {
        $tr.append('<td><button type="button" class="btn btn-success" title="Start this task"><i class="icon-play icon-white"></i></button></td>');
      }
      return $tr;
    }
    
    // Store the list of objects in localstorage
  , updateLocalList: function(obj) {
      localStorage.setItem('taskTracker', JSON.stringify(obj));
    }
    
    // Get the list of objects from localstorage
  , getLocalList: function(id) {
      var item = localStorage.getItem('taskTracker');
      if (item !== '' && item !== null) {
        return jQuery.parseJSON(item);
      }
      return [];
    }
    
    // Check for browser localstorage support
  , hasLocalStorage: function() {
      try {
        return 'localStorage' in window && window['localStorage'] !== null;
      } catch (e) {
        return false;
      }
    }

  , getReadableDate: function(d) {
      var curDate = d.getDate();
      var curMonth = d.getMonth() + 1; //Months are zero based
      var curYear = d.getFullYear();
      return curMonth + "/" + curDate + "/" + curYear;
    }

  , startTimer: function(task, decrement) {
      var $self = $(this);
      var data = $self.data('taskTracker');

      data.options.$countDown.html(task.remaining);

      data.runningTimer = setInterval(function() { 
        if (task.remaining === 0) {
          clearInterval(data.runningTimer);
          data.runningTimer = null;
          functions.timeExpired.call($self, task);
        } else {
          task.remaining -= decrement;
          data.options.$countDown.html(task.remaining);
        }
      }, decrement * 1000);
    }

  , timeExpired: function(task) {
      var data = $(this).data('taskTracker');

      $('tr[data-id=' + task.id + ']')
        .removeClass('success')
        .find('td.task-remaining').text(task.remaining);

      alert('Time for a break!');
      functions.updateLocalList(data.options.existingTasks);
    }

  };
  
  /**
   * <p>Add a task to the task list</p>
   *
   * @param options An optional options object.
   * @param options.addButton Add task object.
   * @param options.taskList The table to prepend the task to.
   * @param options.existingTasks An array of existing task objects.
   *
   */
  jQuery.fn.taskTracker = function(method) {
    // Method calling logic
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || ! method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' +  method + ' does not exist');
    }
  };

  jQuery.fn.taskTracker.defaults = {
    $addButton: $(),
    $taskList: $(),
    $startButton: $(),
    $countDown: $(),
    timerLength: 1500,  // 1500 seconds = 25 minutes
    timerDecrement: 1,  // 1 second
    existingTasks: []
  };
})(jQuery);