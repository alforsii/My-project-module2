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
        .populate({
          path: 'friends',
          populate: [{ path: 'userId' }],
        })
        .then(userFromDB => {

          const { friends } = userFromDB;
          const populatedFriends = friends.map(friend => {
            const {
              _id,
              username,
              firstName,
              lastName,
              email,
              path,
              imageName,
            } = friend.userId;
            return {
              _id: friend._id,
              userId: _id,
              username,
              firstName,
              lastName,
              email,
              path,
              imageName,
            };
          });
          // console.log('friends: ', populatedFriends);

          // console.log('userFromDB: ', friends);
          if (friends.length !== 0) {
            socketIO.emit('output-friends', populatedFriends); //
          }
        })
        .catch(err =>
          console.log(`Error while getting friends list from DB: ${err}`)
        );
    });

    //Display newly added friend
    socketIO.on('create-friend', usersData => {
      User.findById(usersData[0])
        .populate('friends')
        .then(userFromDB => {
          // console.log('friend: ', userFromDB.friends);
          const isFriend = userFromDB.friends.filter(
            friend => friend.userId.toString() === usersData[1].toString()
          );
          console.log('isFriend: ', isFriend);
          if (isFriend.length == 0) {
            createFriend(usersData);
          }
        })
        .catch(err => console.log(`Error while${err}`));
    });
    //end socketIO.on('redisplay-friends-list')

    // createFriend() callback/helper function
    function createFriend(usersData) {
      //1.Current user in session
      User.findById(usersData[0])
        .then(userInSessionFromDB => {

          const { _id } = userInSessionFromDB;

          //Create current user(ourself) as a new friend to other User friends list
          Friend.create({ userId: _id })

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

          const { _id } = otherUserFromDB;

          //Create a new Friend
          Friend.create({ userId: _id })

            .then(newlyCreatedFriend => {
              console.log('Output for: newlyCreatedFriend');
              Friend.findById(newlyCreatedFriend._id)
                .populate('userId')
                .then(populatedFriends => {
                  //call addToFriendsList and pass  newlyCreatedFriend for current user
                  // and pass the other user id to add (newlyCreatedFriend) current user as a friend to other users friends list
                  addToFriendsList(newlyCreatedFriend, usersData[0]); //
                  const {
                    _id,
                    username,
                    firstName,
                    lastName,
                    email,
                    path,
                    imageName,
                  } = populatedFriends.userId;

                  //and here also we're sending other user as a newlyCreatedFriend to display in our friends list
                  socketIO.emit('display-added-friend', {
                    _id: populatedFriends._id,
                    userId: _id,
                    username,
                    firstName,
                    lastName,
                    email,
                    path,
                    imageName,
                  });
                })
                .catch(err => console.log(err));
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
    }
    //end createFriend()
    //end  createFriend() callback/helper function

    //Add to friends list callback/helper function
    function addToFriendsList(newlyCreatedFriend, userId) {
      User.findByIdAndUpdate(
          userId, {
            $push: {
              friends: newlyCreatedFriend._id
            },
          }, {
            new: true
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
      Friend.findById(usersData[1])
        .then(friendFromDB => {
          const currentUser = friendFromDB.friends.filter((friend,i) => friend._id.toString() === usersData[0].toString());
          deleteUser(currentUser, friendFromDB._id,usersData);


        })
        .then(res => {

        })
        .catch(err => console.log(`Error occured while getting friend ${err}`))
    });


    // Delete from DB function 
    function deleteUser(userID, otherUserID) {
      //delete current user
      Friend.findByIdAndDelete(userID)
        .then((user) => {
          console.log(user, 'curr user was deleted')

          socketIO.emit('removed-user', userID);
          //delete other user
          Friend.findByIdAndDelete(otherUserID)
            .then(otherUser => {
              console.log(otherUser, 'other user was deleted')
              socketIO.emit('removed-user', otherUserID);
            }).catch(err => console.log(`Error while deleting other user ${err}`))
        })
        .catch(err => {
          console.log(`Error occured while deleting current user ${err}`)

        })
    };

    //------- Disconnected ---------------------------
    socketIO.on('disconnect', function () {
      console.log('disconnect: ' + socketIO.id);
    });
  }); //end socketIO connection
};