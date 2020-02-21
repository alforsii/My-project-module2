(function() {
  if (document.getElementById('messageBoard')) {
    // Get port (we're not using it since I figure out another way without using port, but just keeping for ref: to  know that we can do with port too)
    // let port = document.getElementsByTagName('html')[0].getAttribute('port');

    // Here is the current user from back end I passed to layout html as attribute to use in front end
    let userInSessionID = document
      .getElementsByTagName('html')[0]
      .getAttribute('userInSession');
    // console.log('Output for: userInSessionID', userInSessionID);
    // console.log('Output for: port', port);

    // Gets elem by id helper function
    let element = id => document.getElementById(id);

    // Get message board elements that we need
    let status = element('status');
    let messageForm = element('messageForm');
    let messages = element('messages');
    let textarea = element('textarea');
    let sendTo = element('sendTo');
    let clearBtn = element('clear');
    const messageBoard = element('messageBoard');

    //Connect to socket.io
    //=-=-=-=-===-=-=-=-=-=-= Socket event listener -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // 1.
    let socketIO = io();
    window.onunload = () => socket.close();
    // 2.Another way of connecting
    // let socketIO = io.connect(`http://127.0.0.1:${parseInt(port)}`);

    // console.log('Output for: port', parseInt(port));
    const users = document.querySelectorAll('.user');
    let _username;
    let _id;
    //=-=-=-=-===-=-=-=-=-=-= Loop through users list -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // If any user selected by click then display message board

    users.forEach(user => {
      // console.log('Output for: users', user);
      user.addEventListener('click', event => {
        event.preventDefault();
        messageBoard.style.display = 'block';
        messages.innerHTML = '';
        //before calling clean(messages.innerHTML = '') the board not to double the messages
        //Send the data to socket.io(back end - server)
        _id = user.getElementsByTagName('a')[1].getAttribute('_id'); //the selected user id
        _username = user.getElementsByTagName('a')[1].getAttribute('_username');
        sendTo.value =
          'Send to: ' + user.getElementsByTagName('a')[1].innerHTML.trim();
        socketIO.emit('start', [userInSessionID, _id]);
      });
    });

    //Set default status
    let statusDefault = status.textContent;
    //=-=-=-=-===-=-=-=-=-=-= Send Status to the current User -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    //Reusable Send status function
    let setStatus = s => {
      status.textContent = s;
      if (s !== statusDefault) {
        let delay = setTimeout(() => {
          setStatus(statusDefault);
        }, 3000);
      }
    };

    //------- Get status from server ---------
    //'status' that we are calling is a function that we assigned in the socket property back end)
    socketIO.on('status', data => {
      //get message status
      // - here we're passing the status data from back end to the setStatus function that we created earlier
      //if data object then get message property else just send data itself(whatever is)
      setStatus(typeof data === 'object' ? data.message : data);
      //if status clear === true which we assigned in the socket.io.js(back end) then clear the message board
      if (data.clear) textarea.value = '';
    });
    //=-=-=-=-===-=-=-=-=-=-= Send message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    //1.handle input(send msg,info about sender and to whom sending) by enter
    textarea.addEventListener('keydown', event => {
      event.preventDefault();
      if (event.which == 13 && event.shiftKey == false) {
        //Emit to server input
        //Send the data to socket.io(back end - server) if pressed enter key
        socketIO.emit('input', {
          userInSessionID,
          id: _id, //selected any other user id
          username: _username,
          message: textarea.value,
        });
      }
    });
    //2.handle input(send msg,info about sender and to whom sending) by click
    messageForm.addEventListener('submit', function(event) {
      event.preventDefault();
      //Emit to server input
      //Send the data to socket.io(back end - server) if clicked
      socketIO.emit('input', {
        id: _id, //selected any other user id
        userInSessionID,
        username: _username,
        message: textarea.value,
      });
      textarea.value = '';
      // socketIO.emit('output', message);
    });

    //check connection if it's not undefined to avoid getting an error
    //=-=-=-=-===-=-=-=-=-=-= Receive back message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socketIO !== undefined) {
      console.log('Connected to socket..');
      //receive data from socket.io(back end - server)
      //Handle output from 'output' function that we assigned to the socket property in the back end
      socketIO.on('output', data => {
        if (data) {
          console.log('Output fromDB: ', data);
          // let arr = data[0].msg;
          for (let i = 0; i < data.length; i++) {
            if (data.from !== socketIO.id) {
              say(data[i].sender, data[i].message);
            } else {
              say(data[i].receiver, data[i].message);
            }
          }
        }
      });
    }

    //receive data from socket.io(back end - server)
    socketIO.on('updateOutput', data => {
      if (data) {
        console.log('Updated Output fromDB: ', data);
        //for test
        if (data.from !== socketIO.id) {
          say(data.sender, data.message);
        } else {
          say(data.receiver, data.message);
        }
      }
    });

    //helper function to display the message
    function say(name, message) {
      if (message !== undefined) {
        messages.innerHTML += `<div class="chat-message">
      <span style="color: red; font-weight: bold;">${name}:</span> ${message}
  </div>`;
        // Scroll down to last message
        messages.scrollTop = messages.scrollHeight;
      }
    }

    //Handle Chat clear
    clearBtn.addEventListener('click', () => socketIO.emit('clear'));

    //Clear message
    socketIO.on('cleared', () => (messages.textContent = ''));

    // <-- end of function -->
  }
})();
