var app = {
  server: 'http://parse.hrr.hackreactor.com/chatterbox/classes/messages',
  username: 'anonymous',
  roomname: 'lobby',
  lastMessageId: 0,
  messages: [],
  friends: {},

  init: function(){
   //Username
    app.username = window.location.search.substr(10);

    app.$chats = $('#chats');
    // app.$room = $('#room');
    app.$send = $('#send');
    app.$roomSelect = $('#roomSelect');
    app.$message = $('#message');
    


    //Add Listners
    app.$send.on('submit', app.handleSumbit);
    app.$roomSelect.on('change', app.handleRoomChange);
    app.$chats.on('click', '.username', app.handleUsernameClick);

    app.fetch();

    // setInterval(function() {
    //   app.fetch();
    // }, 3000);
  },

  send: function(message){
    
     $.ajax({
      url: app.server,
      type: 'POST',
      data: message,
      success: function () {
        // Clear messages input
        app.$message.val('');

        app.fetch();
      },
      error: function (error) {
        console.error('chatterbox: Failed to send message', error);
      }
    });
  },

  fetch: function(){
    $.ajax({
        url: app.server,
        type: 'GET',
        data: {order: "-createdAt"},
        contentType: 'application/json',
        success: function (data) {
          //Do nothing is no new messages
          if (!data.results || !data.results.length) { return; }
          
          //Store messages for later
          app.messages = data.results;

          var mostRecentMessage = app.messages[app.messages.length - 1];

          if(mostRecentMessage !== app.lastMessageId) {
            app.renderMessages(app.messages);
            app.renderRoomList(app.messages);
            
          }
        },
        error: function (data) {
          console.error('chatterbox: Failed to send message', data);
      }
    });
  },

  clearMessages: function() {
    app.$chats.children().remove();
  },

  renderMessage: (message) => {

    if (!message.roomname) {
      message.roomname = 'lobby';
    }

    // Make a div to hold the chats
    var $chat = $('<div class="chat"/>');

    var $username = $('<span class="username"/>');
    $username
      .text(message.username + ': ')
      .attr('data-roomname', message.roomname)
      .attr('data-username', message.username)
      .attr('style', 'font-weight: bold')
      .appendTo($chat);

    // Add the friend class
    if (app.friends[message.username] === true) {
      $username.addClass('friend');
    }

    var $message = $('<br><span/>');
    $message.text(message.text).appendTo($chat);

    // Add the message to the UI
    app.$chats.append($chat);
  },

  renderMessages: (messages) => {
    //clear chat
     app.clearMessages();

     //render each message in data array
     messages
      .filter(function(message){
        if(app.roomname === 'lobby' && !message.roomname){
          return true;
        } else if(message.roomname === app.roomname) {
          return true;
        } else {
          return false;
        }
      })
      .forEach(app.renderMessage);
  },

  renderRoom: (roomname) => {
    var $option = $('<option/>').val(roomname).text(roomname);

    // Add to select
    app.$roomSelect.append($option);
  },

  renderRoomList: function(messages) {
    app.$roomSelect.html('<option value="_newRoom">New room...</select>');

    if(messages) {
      var rooms = {};

      messages.forEach(function(messages){
        var roomname = messages.roomname;

        if(roomname && !rooms[roomname]) {
          app.renderRoom(roomname);

          rooms[roomname] = true;
        }
      });
    }

    app.$roomSelect.val(app.roomname);
  },

  handleSumbit: function(){
  
    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };
    
    event.preventDefault();

    app.send(message);
  },

  handleRoomChange: function(event){
    var selectIndex = app.$roomSelect.prop('selectedIndex');
    if(selectIndex === 0) {
      //make a new room
      var roomname = prompt('Enter room name');

      if(roomname) {
        app.roomname = roomname;
        app.renderRoom(roomname);
        app.$roomSelect.val(roomname);
      }

    } else {
      app.roomname = app.$roomSelect.val();
    }

    app.renderMessages(app.messages);
  },

  handleUsernameClick: function(event){
    var username = $(event.target).data('username');
    if(username !== undefined) {
      app.friends[username] = !app.friends[username];

      var selector = '[data-username="' + username.replace(/"/g, '\\\"') + '"]';

      var $usernames = $(selector).toggleClass('friend');
    }
  } 
}

