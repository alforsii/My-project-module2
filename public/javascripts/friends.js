(function() {
  if (document.getElementById("friends-list")) {
    // Here is the current user from back end I passed to layout inside html tag as attribute to use in front end
    let userInSessionID = document
      .getElementsByTagName("html")[0]
      .getAttribute("userInSession");

    // Gets elem by id with helper function
    let element = id => document.getElementById(id);

    // Get message board elements that we need
    let friendsList = element("friends-list");

    //Connect to socket.io
    //=-=-=-=-===-=-=-=-=-=-= Socket event listener -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // 1.
    let socket = io();
    window.onunload = () => socket.close();
    // 2.Another way of connecting
    // let socket = io.connect(`http://127.0.0.1:${parseInt(port)}`);

    // console.log('Output for: port', parseInt(port));
    const users = document.querySelectorAll(".user");
    const addBtns = document.querySelectorAll(".add-friend");

    //=-=-=-=-===-=-=-=-=-=-= Add and remove new friends -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // =================== Add friends
    addBtns.forEach(btn => {
      btn.addEventListener("click", event => {
        event.preventDefault();
        console.log(btn.getAttribute('user_id'));
        const user_id = btn.getAttribute('user_id');
        socket.emit('create-friend', [userInSessionID, user_id]);
        btn.disabled = true;
        btn.innerHTML = "Already friends";
      });
    });

    // =================== Request friends deletion
    function updateDeleteBtn() {
      //1.update delete button
      let deleteEachFriend = document.querySelectorAll(".delete-friend");
      deleteEachFriend.forEach(btn => {
        btn.addEventListener("click", event => {
          event.preventDefault();
          // console.log(btn.parentElement);
          const eachFriend =
            btn.parentElement.parentElement.previousElementSibling;
          // console.log('eachFriend: ', eachFriend);
          const friendsID = eachFriend.children[1].getAttribute("friendId");
          // console.log('friendsID: ', friendsID);

          //1. Send data (_id) to delete the friend from DB
          socket.emit("req-delete-friend", [userInSessionID, friendsID]);
          // eachFriend.parentElement.remove();
        });
      });

      //Get clicked user id to Send message
      // const sendBtns = document.querySelectorAll('.send-message');
      // sendBtns.forEach(sendBtn => {
      //   sendBtn.addEventListener('click', event => {
      //     event.preventDefault();
      //     const userDiv =
      //       sendBtn.parentElement.parentElement.previousElementSibling;
      //     const otherUserId = userDiv.children[1].getAttribute('_id');
      //     console.log('otherUserId: ', otherUserId);

      //     socket.io.emit('display', [userInSessionID, otherUserId]);
      //   });
      // });
    }

    // 2.Friends deleted from DB
    socket.on("removed-user", deletedUsers => {
      document.querySelectorAll(".each-friend").forEach(friend => {
        const idOfUser = friend.children[0].children[1].getAttribute(
          "friendId"
        );
        //if deleted user found - which has index (is not -1) of >= 0
        if (deletedUsers.indexOf(idOfUser.toString()) > -1) {
          friend.remove(); //if found then remove it from browser, because it removed from DB already.
        }
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
    socket.on("status", data => {
      // data ={ this data will be sent from server when msg is sent
      //   message: 'Message sent',
      //   sent: true,
      // };
      //get message status
      // - here we're passing the status data from back end to the setStatus function that we created earlier
      //if data object then get message property else just send data itself(whatever is)
      setStatus(typeof data === "object" ? data.message : data);
      //so if message was sent then clear the input field
      if (data.sent) textarea.value = "";
    });

    //Send current user id to get current user friends list from DB

    socket.emit("redisplay-friends-list", {
      userId: userInSessionID
    });

    //Receive back current users friends list and display
    socket.on("output-friends", friendsFromDB => {
      for (let i = 0; i < friendsFromDB.length; i++) {
        displayFriend(friendsFromDB[i]);
      }
      updateDeleteBtn();
    });

    //check connection if it's not undefined to avoid getting an error
    //=-=-=-=-===-=-=-=-=-=-= Receive back newlyCreatedFriend -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socket !== undefined) {
      console.log("Connected to socket to friend.js..");
      socket.on("display-added-friend", newlyCreatedFriend => {
        // socket.emit('redisplay-friends-list', {
        //   userId: userInSessionID,
        // });
        displayFriend(newlyCreatedFriend);
        updateDeleteBtn();
      });
    }

    //Create newFriend helper function
    function displayFriend(newlyCreatedFriend) {
      const {
        _id,
        userId,
        username,
        firstName,
        lastName,
        path
      } = newlyCreatedFriend;
      console.log("other userId: ", userId);
      const newFriend = document.createElement("div");
      newFriend.setAttribute("class", "each-friend");
      //<a href="/profile/user-details?user_id={{userId}}">{{username}}</a> this is user profile details page
      newFriend.innerHTML = `
          <div class="user">
              <a href="/profile/user-details?user_id=${userId}">
                <img class="chat-users-small" src="${path}" alt="${username}">
              </a>
              <a href="/profile/user-details?user_id=${userId}" class="username" _id="${userId}" friendId="${_id}" _username="${username}">
                ${firstName} ${lastName}
              </a>
          </div>

          <div class="btn-group1" role="group">
              <button id="btnGroupDrop1" class="dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true"
                aria-expanded="false"></button>
              <div class="dropdown-menu" aria-labelledby="btnGroupDrop1">
                  <a href="" class="send-message text-center" user_id=${userId} _username=${username}
                  _name="${firstName} ${lastName}">Send message</a>
                  <a href="" class="delete-friend text-center"> Delete </a>
              </div>
           </div>
        `;
      friendsList.appendChild(newFriend);
    }

    // <-- end of function -->
  }
})();
