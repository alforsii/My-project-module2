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
    let friendsList = element('friends-list');

    //Connect to socket.io
    //=-=-=-=-===-=-=-=-=-=-= Socket event listener -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // 1.
    let socket = io();
    window.onunload = () => socket.close();
    // 2.Another way of connecting
    // let socket = io.connect(`http://127.0.0.1:${parseInt(port)}`);

    // console.log('Output for: port', parseInt(port));
    const users = document.querySelectorAll('.user');
    const addBtns = document.querySelectorAll('.add-friend');
    let _username;
    let _id;
    //=-=-=-=-===-=-=-=-=-=-= Loop through users list -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // If any user selected by click then display message board

    addBtns.forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        // console.log('Clicked', btn.getAttribute('user_id'));
        const user_id =  btn.getAttribute('user_id');
        socket.emit('display-user', [userInSessionID, user_id]);
      })
    })
    users.forEach(user => {
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
    });

    // Send current user id to get current user's friends list from DB 
    socket.emit('redisplay-friends-list', {
      userId: userInSessionID
    });

    // Receive back current user's friends list and display
    socket.on('output-friends', friendsFromDB => {
      for(let i = 0; i < friendsFromDB.length; i++) {
        createFriend(friendsFromDB[i]);
      }
    });

    //check connection if it's not undefined to avoid getting an error
    //Output All messages that was in DB for selected Chat board
    //=-=-=-=-===-=-=-=-=-=-= Receive back newlyCreatedFriend -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socket !== undefined) {
      console.log('Connected to socket..');
      socket.on('display-added-friend', newlyCreatedFriend => {
        createFriend(newlyCreatedFriend);
      });
    }

    // Create new friend
    function createFriend(newlyCreatedFriend) {
      const { 
        _id,
        username,
        firstName,
        lastName,
        email,
        path,
        imageName,
        friends, 
      } = newlyCreatedFriend;
      const newFriend = document.createElement('div');
      newFriend.setAttribute('class', 'each-friend');
        newFriend.innerHTML = `
          <a href="">
            <img class="chat-users-small" src="${path}" alt="${username}">
          </a>
          <a class="username" href="" _id="${_id}" _username="${username}">
            ${firstName} ${lastName}
          </a>
        `;
        friendsList.appendChild(newFriend);
    }

    // <-- end of function -->
  }
})();
