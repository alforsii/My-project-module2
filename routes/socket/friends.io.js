module.exports = client => {
  const Chat = require('../../models/Chat.model');
  const Message = require('../../models/Message.model');
  const User = require('../../models/User.model');
  const Friend = require('../../models/Friend.model');

  //if user signed in (it's set to signed in - where message board)
  client.on('connection', socketIO => {
    // console.log('Output for: socketIO', socketIO);
    console.log('A friends.io.js connected');
    // console.log('new connection: ' + socketIO.id);

    socketIO.on('redisplay-friends-list', data => {
      // console.log('data', data);
      //Get current user in session id and check in User.friends if he has any friends
      //if current user has friend or friends then send them to the client(front end to display)
      User.findById(data.userId)
        .populate('friends')
        .then(userFromDB => {
          const { friends } = userFromDB;
          // console.log('userFromDB: ', friends);
          if (friends.length !== 0) {
            socketIO.emit('output-friends', friends); //
          }
        })
        .catch(err =>
          console.log(`Error while getting friends list from DB: ${err}`)
        );
    });

    //Display newly added friend
    socketIO.on('display-user', usersData => {
      //1.Current user in session
      User.findById(usersData[0])
        .then(userInSessionFromDB => {
          const {
            _id,
            username,
            firstName,
            lastName,
            email,
            path,
            imageName,
          } = userInSessionFromDB;

          //Create current user(ourself) as a new friend to other User friends list
          Friend.create({
            userId: _id,
            username,
            firstName,
            lastName,
            email,
            path,
            imageName,
          })
            .then(newlyCreatedFriend => {
              console.log('Output for: newlyCreatedFriend');
              //call addToFriendsList and pass  newlyCreatedFriend for current user
              // and pass the other user id to add (newlyCreatedFriend) current user as a friend to other users friends list
              addToFriendsList(newlyCreatedFriend, usersData[1]); //
            })
            .catch(err =>
              console.log(`Error while creating a new friend ${err}`)
            );
          //end Friend.creat()
        })
        .catch(err =>
          console.log(
            `Error while getting specific user from friends.io.js ${err}`
          )
        );
      //end of current user
      //2.Other user
      User.findById(usersData[1])
        .then(otherUserFromDB => {
          const {
            _id,
            username,
            firstName,
            lastName,
            email,
            path,
            imageName,
          } = otherUserFromDB;

          //Create a new Friend
          Friend.create({
            userId: _id,
            username,
            firstName,
            lastName,
            email,
            path,
            imageName,
          })
            .then(newlyCreatedFriend => {
              console.log('Output for: newlyCreatedFriend');
              //call addToFriendsList and pass  newlyCreatedFriend for current user
              // and pass the other user id to add (newlyCreatedFriend) current user as a friend to other users friends list
              addToFriendsList(newlyCreatedFriend, usersData[0]); //
              //and here also we're sending other user as a newlyCreatedFriend to display in our friends list
              socketIO.emit('display-added-friend', newlyCreatedFriend);
            })
            .catch(err =>
              console.log(`Error while creating a new friend ${err}`)
            );
          //end Friend.creat()
        })
        .catch(err =>
          console.log(
            `Error while getting specific user from friends.io.js ${err}`
          )
        );
    });

    //Add to friends list function
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

    // Delete friend from DB
    socketIO.on('req-delete-friend', usersData => {
      const currentUserId = usersData[0]; //current user actual(User) id
      Friend.findById(usersData[1]) // other user's friend(Friend) id for this/current user
        .populate({
          path: 'userId',
          populate: [{ path: 'friends' }],
        }) //populating other users actual id to get access to his friends list, so we can remove current user(ourself) from other users friends list/array.
        .then(friendFromDB => {
          //get other user's actual id
          const otherUserId = friendFromDB.userId;
          //find current user(myself) from otherUser friends array
          const currentUser = otherUserId.friends.filter(
            friend => friend.userId.toString() === currentUserId.toString()
          ); //
          // const  {_id, userId} = currentUser[0];

          deleteUser(
            [currentUser[0]._id, friendFromDB._id], //Sending this array of Friend ids for deletion from DB
            [currentUserId, otherUserId] //Sending this array of User ids for removing deleted Friend ids from their User.friends list
          );
        })
        .catch(err =>
          console.log(`Error occurred while getting friends list ${err}`)
        );
    });

    // Delete from DB function
    function deleteUser(arrFriendsId, arrUsersId) {
      //1.Friend.remove({_id: {$in:arrayOfIds} }) - for multiple deletion
      Friend.remove({ _id: { $in: arrFriendsId } }) //deletes multiple id's from DB (need to pass id's as an array)
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
                  })
                  .catch(err =>
                    console.log(`Error while updating friends list ${err}`)
                  );
              });
            })
            .catch(err =>
              console.log(`Error in searching multiple users ${err}`)
            );
          socketIO.emit('removed-user', arrFriendsId);
        })
        .catch(err => console.log(`Error while removing users from DB ${err}`));
    }

    //------- Disconnected ---------------------------
    socketIO.on('disconnect', function() {
      console.log('disconnect: ' + socketIO.id);
    });
  }); //end socketIO connection
};
