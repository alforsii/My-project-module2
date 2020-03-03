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
    let messageForm = element('messageForm');
    let messages = element('messages');
    let textarea = element('textMessage'); //problem here <-----!
    let sendTo = element('sendTo');
    // let clearBtn = element('clear');
    const messageBoard = element('messageBoard');

    //Connect to socket.io
    //=-=-=-=-===-=-=-=-=-=-= Socket event listener -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // 1.
    let socket = io();
    window.onunload = () => socket.close();
    // 2.Another way of connecting
    // let socket = io.connect(`http://127.0.0.1:${parseInt(port)}`);

    // console.log('Output for: port', parseInt(port));
    const users = document.querySelectorAll('.user');
    let sendBtns = document.querySelectorAll('.send-message');
    let _username;
    let _id;
    //=-=-=-=-===-=-=-=-=-=-= Loop through users list -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // If any user selected by click then display message board

    //1. One way
    // users.forEach(user => {
    //   // console.log('Output for: users', user);
    //   user.addEventListener('click', event => {
    //     event.preventDefault();
    //     messageBoard.style.display = 'block';
    //     messages.innerHTML = '';
    //     //before calling clean(messages.innerHTML = '') the board not to double the messages
    //     //Send the data to socket.io(back end - server)
    //     _id = user.getElementsByTagName('a')[1].getAttribute('_id'); //the selected user id
    //     _username = user.getElementsByTagName('a')[1].getAttribute('_username');
    //     sendTo.value =
    //       'Send to: ' + user.getElementsByTagName('a')[1].innerHTML.trim(); //name of a user
    //     socket.emit('display', [userInSessionID, _id]);
    //   });
    // });

    //2. Another way
    sendBtns.forEach(sendBtn => {
      sendBtn.addEventListener('click', event => {
        event.preventDefault();
        messageBoard.style.display = 'block';
        messages.innerHTML = '';
        _id = sendBtn.getAttribute('user_id');
        _username = sendBtn.getAttribute('_username');
        let fullName = sendBtn.getAttribute('_name');
        console.log('fullName: ', fullName);
        sendTo.value = 'Send to: ' + fullName.trim();
        // sendBtn.parentElement.parentElement.previousElementSibling.children[1].innerHTML.trim(); //name of a user
        socket.emit('display', [userInSessionID, _id]);
      });
    });

    //Receive data from friends.js -> socket.io.js -> socket.js
    socket.on('call-socket', data => {
      console.log("socket.on('call-socket')", data);
      const { id, username, fullName } = data;
      updateSendBtns(id, username, fullName);
      // socket.emit('display', dataFromFriends);//dataFromFriends === [userInSessionID, otherUserId]
    });

    function updateSendBtns(id, username, fullName) {
      // sendBtns = document.querySelectorAll('.send-message');
      // sendBtns.forEach(sendBtn => {
      //   sendBtn.addEventListener('click', event => {
      // event.preventDefault();
      messageBoard.style.display = 'block';
      messages.innerHTML = '';
      _id = id;
      _username = username;
      console.log('fullName: ', fullName);
      sendTo.value = 'Send to: ' + fullName.trim();
      // sendBtn.parentElement.parentElement.previousElementSibling.children[1].innerHTML.trim(); //name of a user
      socket.emit('display', [userInSessionID, _id]);
      // });
      // });
    }

    //Set default status
    //=-=-=-=-===-=-=-=-=-=-= Send Status to the current User -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    //Reusable Send status function
    let setStatus = (s, stop) => {
      let name = sendTo.value;
      sendTo.value = s;
      if (s !== '' && stop == undefined) {
        let delay = setTimeout(() => {
          setStatus(name, 'stop');
          sendTo.style.color = '';
        }, 3000);
      }
    };

    //------- Get status from server ---------
    //'status' that we are calling is a function that we assigned in the socket property back end)
    socket.on('status', data => {
      // data ={ this data will be sent from server when msg is sent
      //   message: 'Message sent',
      //   sent: true,
      // };
      //get message status
      // - here we're passing the status data from back end to the setStatus function that we created earlier
      //if data object then get message property else just send data itself(whatever is)
      setStatus(typeof data === 'object' ? data.message : data);
      //so if message was sent then clear the input field
      if (data.sent) textarea.value = '';
      if (data.color === 'red') sendTo.style.color = 'red';
      if (data.color === 'green') sendTo.style.color = 'green';
    });
    //=-=-=-=-===-=-=-=-=-=-= Send message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    //1.handle input(send msg,info about sender and to whom sending) by enter
    textarea.addEventListener('keydown', event => {
      if (event.which == 13 && event.shiftKey == false) {
        event.preventDefault();
        //Emit to server input
        //Send the data to socket.io(back end - server) if pressed enter key
        socket.emit('input', {
          userInSessionID,
          id: _id, //selected any other user id
          username: _username,
          message: textarea.value,
        });
        textarea.value = '';
      }
    });
    //2.handle input(send msg,info about sender and to whom sending) by click
    messageForm.addEventListener('submit', function(event) {
      event.preventDefault();
      //Emit to server input
      //Send the data to socket.io(back end - server) if clicked
      socket.emit('input', {
        id: _id, //selected any other user id
        userInSessionID,
        username: _username,
        message: textarea.value,
      });
      textarea.value = '';
    });

    //check connection if it's not undefined to avoid getting an error
    //Output All messages that was in DB for selected Chat board
    //=-=-=-=-===-=-=-=-=-=-= Receive back message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socket !== undefined) {
      console.log('Connected to socket..');
      //receive data from socket.io(back end - server)
      //Handle output from 'output' function that we assigned to the socket property in the back end
      socket.on('output', data => {
        //it's from messages collection
        if (data) {
          console.log('Output fromDB: ', data);
          // let arr = data[0].msg;
          for (let i = 0; i < data.length; i++) {
            const { sender, message, _id, author } = data[i];
            if (author._id.toString() === userInSessionID.toString()) {
              say('You', message, (color = 'green'), _id, author); //message._id -ref for current users message(to use for delete msg)
              // say(receiver, message);
            }
            if (author._id.toString() !== userInSessionID.toString()) {
              say(sender, message, (color = 'red'), _id, author);
            }
          }
        }
      });
    }

    //receive data from socket.io(back end - server) live chat
    socket.on('updateOutput', data => {
      // messages.innerHTML = '';
      // socket.emit('display', [userInSessionID, _id]);
      if (data) {
        const { receiver, message, _id, author } = data;
        console.log('Updated Output fromDB: ', data);
        //for test
        if (data.from !== socket.id) {
          // say(data.sender, data.message);
          say('You', message, (color = 'green'), _id, author); //message._id -ref for current users message(to use for delete msg)
        } else {
          say(receiver, message, (color = 'red'), _id, author);
        }
      }
    });

    //helper function to display the message
    function say(name, message, color, messageId, user) {
      if (message !== undefined) {
        if (name === 'You') {
          messages.innerHTML += `
        <div class="chat-message" style="">
            <div  class="user-in-chat">
                <div>
                    <a href="/profile/user-details?user_id=${user._id}" style="color:${color};font-weight:bold;">
                        <img class="chat-users-small chat-users-small2" src="${user.path}" alt="${name}">
                    </a>
                </div> 
            </div>
            <div class="parent-msg-div" style="justify-content: space-between;">
                <div class="msg-div">
                    <span>${message}</span>
                </div> 
                  <span class="deleteMsgBtn" msg_id=${messageId}>Delete</span>
            </div>
        </div>
      `;
        } else {
          messages.innerHTML += `
         <div class="chat-message" >
            <div class="parent-msg-div" style="justify-content: flex-end;">
                <span class="hideBtn" msg_id=${messageId}>Hide</span>
                <div class="msg-div">
                    <span>${message}</span>
                </div>  
            </div>
                <div class="user-in-chat">
                  <div>
                    <a href="/profile/user-details?user_id=${user._id}"  style="color:${color};font-weight:bold;">
                      <img class="chat-users-small chat-users-small2" src="${user.path}" alt="${name}">
                    </a>
                  </div>
                  
                </div>
        </div>
      `;
        }
        // Scroll down to last message
        messages.scrollTop = messages.scrollHeight;
      }
    }

    //Handle Chat clear all messages in DB
    // clearBtn.addEventListener('click', () => socket.emit('clear'));

    //each delete btn event listener
    socket.on('updateDeleteBtnStatus', data => {
      let deleteMsgBtn = document.querySelectorAll('.deleteMsgBtn');
      //addListener for each delete button
      deleteMsgBtn.forEach(btn => {
        btn.addEventListener('click', event => {
          event.preventDefault();
          const msgId = event.target.getAttribute('msg_id');
          socket.emit('requestDeleteMsg', msgId); //remove from DB(sending req to remove)
          event.target.parentElement.remove(); //then remove from screen
          messages.innerHTML = '';
          socket.emit('display', [userInSessionID, _id]); //I had to call back this function to redisplay the messages back, because when I click they all disappearing even if I prevent default
        });
      });
    });

    //Clear all messages on board
    socket.on('cleared', () => (messages.textContent = ''));

    // <-- end of function -->
  }
})();
