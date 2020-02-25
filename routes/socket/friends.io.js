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
          const {
            friends
          } = userFromDB;
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
            friends,
          } = userInSessionFromDB;

          //Create current user(ourself) as a new friend to other User friends list
          Friend.create({
              username,
              firstName,
              lastName,
              email,
              path,
              imageName,
              friends,
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
            friends,
          } = otherUserFromDB;

          //Create a new Friend
          Friend.create({
              username,
              firstName,
              lastName,
              email,
              path,
              imageName,
              friends,
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