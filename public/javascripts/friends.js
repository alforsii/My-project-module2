(function() {
  if (
    document.getElementById('friends-list') ||
    document.getElementById('messageBoard')
  ) {
    // Here is the current user from back end I passed to layout inside html tag as attribute to use in front end
    let userInSessionID = document
      .getElementsByTagName('html')[0]
      .getAttribute('userInSession');

    let deleteEachFriend = document.querySelectorAll('.delete-friend');
    // let statusOutput = document.getElementById('status-output');
    // statusOutput.value = 'hello world!';
    //Connect to socket.io
    //=-=-=-=-===-=-=-=-=-=-= Socket event listener -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    // 1.
    let socket = io();
    window.onunload = () => socket.close();

    //=-=-=-=-===-=-=-=-=-=-= Add and remove new friends -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    const addBtns = document.querySelectorAll('.add-friend');
    // =================== Add friends
    addBtns.forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        const user_id = btn.getAttribute('user_id');
        socket.emit('create-friend', [userInSessionID, user_id]);
      });
    });

    // -----------get response from DB that new friend was added to DB
    socket.on('friend-created', newlyCreatedFriend => {
      location.reload();
    });

    // =================== Request friends deletion
    deleteEachFriend.forEach(btn => {
      btn.addEventListener('click', event => {
        event.preventDefault();
        const friendsID = btn.getAttribute('friendId');
        socket.emit('req-delete-friend', [userInSessionID, friendsID]);
      });
    });

    // 2.Friends deleted from DB - if true reload page.
    socket.on('removed-user', deletedUsers => {
      location.reload();
    });
    // <-- end of function -->
  }
})();
