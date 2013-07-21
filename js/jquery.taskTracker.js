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
        functions.saveTask.call($self, newTask);
      });

      data.options.$taskList.on('click', data.$startButton, function(e) {
        var $row = $(e.target).closest('tr');
        var task = functions.getTask(data.options.existingTasks, $row.data('id'));

        $row.addClass('success');
        functions.startTimer.call($self, task, data.options.timerDecrement);
      });
      
      var storedTasks = functions.getLocalList();
      if (storedTasks.length > 0) {
        // Add stored tasks to html only
        for (var i = 0, len = storedTasks.length; i < len; i++) {
          data.options.$taskList.prepend(functions.createTableRow(storedTasks[i]));
        }
      } else {
        // Add default tasks to localstorage AND html
        for (var i = 0, len = data.options.existingTasks.length; i < len; i++) {
          functions.saveTask.call($self, data.options.existingTasks[i]);
        }
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

      var allTasks = functions.getLocalList();
      allTasks.push(taskObj);

      functions.storeLocalList(allTasks);
    }

    // Create a task obj from form inputs
  , createTaskObj: function() {
      var $this = $(this);
      var data = $this.data();
      var task = { 'remaining': data.options.timerLength };
      
      var $inpts = $this.find('input[type=text]');
      $inpts.each(function(i, elem) {
        if (jQuery.trim(elem.value) === '') {
          task[elem.getAttribute('name')] = 'TBA';
        } else {
          task[elem.getAttribute('name')] = elem.value;
        }
      });

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
      $tr.append('<td><button type="button" class="btn btn-success" title="Start this task"><i class="icon-play icon-white"></i></button></td>');
      return $tr;
    }
    
    // Store the list of objects in localstorage
  , storeLocalList: function(obj) {
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

  , startTimer: function(task, decrement) {
      var $self = $(this);
      var data = $self.data('taskTracker');
      data.options.$countDown.html(task.remaining);

      var runningTimer = setInterval(function() { 
        if (task.remaining === 0) {
          clearInterval(runningTimer);
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
      functions.storeLocalList(data.options.existingTasks);
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
    existingTasks: []
  };
})(jQuery);