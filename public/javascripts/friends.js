(function () {
  if (document.getElementById('messageBoard')) {
    // Here is the current user from back end I passed to layout inside html tag as attribute to use in front end
    let userInSessionID = document
      .getElementsByTagName('html')[0]
      .getAttribute('userInSession');

    // Gets elem by id with helper function
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


    //=-=-=-=-===-=-=-=-=-=-= Loop through users list -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // If any user selected by click then display message board

    // =================== Add friends
    addBtns.forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        // console.log(btn.getAttribute('user_id'));
        const user_id = btn.getAttribute('user_id');
        socket.emit('display-user', [userInSessionID, user_id]);
      });
    });


    // =================== Request friends deletion
    function updateDeleteBtn() {
      const deleteEachFriend = document.querySelectorAll('.delete-friend');
      deleteEachFriend.forEach(btn => {
        btn.addEventListener('click', event => {
          event.preventDefault();
          // console.log(btn.parentElement);
          const eachFriend = btn.parentElement;
          console.log(eachFriend.children[1].getAttribute('_id'));
          const friendsID = eachFriend.children[1].getAttribute('_id');

          //1. Send data (_id) to delete the friend from DB
          socket.emit('req-delete-friend', [userInSessionID, friendsID]);
        });
      });
    }

    // Friends deleted from DB
    socket.on('removed-user', deletedUser => {
      document.querySelectorAll('.each-friend').forEach(friend => {
        const idOfUser = friend.children[1].getAttribute('_id');
        if (idOfUser.toString() === deletedUser.toString()) {
          friend.remove();
        };
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

    //Send current user id to get current user friends list from DB
    window.onload = () => {
      socket.emit('redisplay-friends-list', {
        userId: userInSessionID,
      });
    };
    //Receive back current users friends list and display
    socket.on('output-friends', friendsFromDB => {
      for (let i = 0; i < friendsFromDB.length; i++) {
        createFriend(friendsFromDB[i]);
      }
      updateDeleteBtn();
    });

    //check connection if it's not undefined to avoid getting an error
    //=-=-=-=-===-=-=-=-=-=-= Receive back newlyCreatedFriend -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socket !== undefined) {
      console.log('Connected to socket to friend.js..');
      socket.on('display-added-friend', newlyCreatedFriend => {
        createFriend(newlyCreatedFriend);
        updateDeleteBtn()
      });
    }

    //Create newFriend helper function
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

             <span class="delete-friend">Delete</span>

        `;
      friendsList.appendChild(newFriend);
    }



    // <-- end of function -->
  }
})();