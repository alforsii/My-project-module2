module.exports = client => {
  const User = require('../../models/User.model');
  const Friend = require('../../models/Friend.model');
  //---------------- socket.io connection to the Server(through configs/server.js) ----------------------------------
  client.on('connection', socketIO => {
    // console.log('new connection: ' + socketIO.id);

    //------------Create a new friend----------------------
    //================================================================
    socketIO.on('create-friend', usersData => {
      // usersData[0] - userInSession(current user) id.
      // usersData[1] - other user id.
      User.findById(usersData[0])
        .populate('friends')
        .then(userFromDB => {
          // checking if the user exist in current(me) user friends list
          const isFriend = userFromDB.friends.filter(
            friend => friend.userId.toString() === usersData[1].toString()
          );
          if (isFriend.length == 0) {
            //if this user is not a friend yet then call createFriend() to make a new friends
            createFriend(usersData);
          }
        })
        .catch(err => console.log(`Error while${err}`));
    });
    //end socketIO.on('redisplay-friends-list')

    //---------- createFriend() callback/helper function --------------
    //================================================================
    function createFriend(usersData) {
      //1.Current user in session
      //Create current user(ourself) as a new friend to other User friends list
      Friend.create({ userId: usersData[0] })
        .then(newlyCreatedFriend => {
          console.log('newlyCreatedFriend');
          //call addToFriendsList and pass  newlyCreatedFriend for current user
          // and pass the other user id to add (newlyCreatedFriend) current user as a friend to other users friends list
          addToFriendsList(newlyCreatedFriend, usersData[1]); //
        })
        .catch(err => console.log(`Error while creating a new friend ${err}`));
      //end Friend.creat() - 1

      //2.Other user
      //Create a new Friend
      Friend.create({ userId: usersData[1] })
        .then(newlyCreatedFriend => {
          console.log('newlyCreatedFriend');
          addToFriendsList(newlyCreatedFriend, usersData[0]); //
          socketIO.emit('friend-created', newlyCreatedFriend);
        })
        .catch(err => console.log(`Error while creating a new friend ${err}`));
      //end Friend.creat() - 2
    }
    //end  createFriend() callback/helper function

    //--------- Add to friends list callback/helper function -----------------
    //================================================================
    function addToFriendsList(newlyCreatedFriend, userId) {
      User.findByIdAndUpdate(
        userId,
        {
          $push: {
            friends: newlyCreatedFriend._id,
          },
        },
        {
          new: true,
        }
      )
        .then(updatedUser => {
          console.log('updatedUser: ');
        })
        .catch(err =>
          console.log(`Error while trying to update friends list ${err}`)
        );
      //end of User.findByIdAndUpdate(userId)
    }

    //------------------ Delete friend from DB ---------------------------
    //================================================================
    socketIO.on('req-delete-friend', usersData => {
      const currentUserId = usersData[0]; //current user actual(User) id
      Friend.findById(usersData[1]) // other user's friend(Friend) id for this/current user
        .populate({
          path: 'userId',
          populate: [{ path: 'friends' }],
        }) //populating other users actual id to get access to his friends list, so we can remove current user(ourself) from other users friends list/array.
        .then(friendFromDB => {
          console.log('friendFromDB: ');
          //get other user's actual id
          const otherUserId = friendFromDB.userId._id;
          //find current user(myself) from otherUser friends array
          const currentUser = friendFromDB.userId.friends.filter(
            friend => friend.userId.toString() === currentUserId.toString()
          ); //
          // const  {_id, userId} = currentUser[0];
          //call deleteUser()
          deleteUser(
            [currentUser[0]._id, friendFromDB._id], //Sending this array of Friend ids for deletion from DB
            [currentUserId, otherUserId] //Sending this array of User ids for removing deleted Friend ids from their User.friends list
          );
        })
        .catch(err =>
          console.log(`Error occurred while getting friends list ${err}`)
        );
    });

    //---------------- Delete from DB callback/helper function ------------------------------
    //================================================================
    function deleteUser(arrFriendsId, arrUsersId) {
      //1.Friend.remove({_id: {$in:arrayOfIds} }) - for multiple deletion
      Friend.deleteMany({ _id: { $in: arrFriendsId } }) //deletes multiple id's from DB (need to pass id's as an array)
        .then(res => {
          console.log('deleted users res: ', res);
          //2. User.find({_id: {$in:arrayOfIds}}) - for multiple search
          User.find({ _id: { $in: arrUsersId } })
            .then(foundUsers => {
              //returns 2 users array, first current user and second other user as it was passed in the array for search
              const reversedFriends = arrFriendsId.reverse();
              //reverse arrFriendsId list so in first iteration (foundUsers[0]==currentUser) of the loop I can pass the other users Friend id(reversedFriends[0]==otherUserFriendId) to current user to delete him from current users friends list
              // and when I am in second iteration(foundUsers[1]===otherUser) I get currentUserFriendId(reversedFriends[1]== currentUserFriendId)
              foundUsers.forEach((user, i) => {
                //passing second argument to get for each iteration same index elem from other array(from reversedFriends)
                User.updateOne(
                  { _id: user._id }, //searching by id of the user to update
                  { $pull: { friends: reversedFriends[i] } } // friends property(currently to remove (id of) deleted friend from each User friends list)
                )
                  .then(res => {
                    console.log(res);
                    socketIO.emit('removed-user', [reversedFriends[i]]);
                  })
                  .catch(err =>
                    console.log(`Error while updating friends list ${err}`)
                  );
              });
            })
            .catch(err =>
              console.log(`Error in searching multiple users ${err}`)
            );
        })
        .catch(err => console.log(`Error while removing users from DB ${err}`));
    }

    //------- Disconnected ---------------------------
    // socketIO.on('disconnect', function() {
    //   console.log('disconnect: ' + socketIO.id);
    // });
  }); //end socketIO connection
};
