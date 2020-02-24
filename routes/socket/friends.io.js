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
      // //Get chat from DB and display when selected
      User.find(data.userId)
        .sort({_id: 1})
        .populate('friends')
        .then(userFromDB => {
          const {friends} = userFromDB;

          // console.log('friendsFromUserDB: ', friendsFromUserDB);
          if (userFromDB.friends.length !=0) {
            socketIO.emit('output-friends', friends);
          }
        })
        .catch(err =>
          console.log(
            `Error while getting the messages fromDB to send to client: ${err}`
          )
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

          // Create current user (ourself) as new friend to other User friends list
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
              console.log('Output for: newlyCreatedFriend', newlyCreatedFriend);
              addToFriendsList(newlyCreatedFriend, usersData[1]);
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
              console.log('Output for: newlyCreatedFriend', newlyCreatedFriend);
              addToFriendsList(newlyCreatedFriend, _id);
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

    // Add to frieds list function
    function addToFriendsList(newlyCreatedFriend, userId) {
      User.findByIdAndUpdate(userId, { $push: { friends: newlyCreatedFriend._id }},{new: true})
      .then(updatedUser => {
        console.log('updatedUser: ', updatedUser);
      })
      .catch(err => console.log(`Error while trying to update friends list ${err}`));
    }

    //------- Disconnected ---------------------------
    socketIO.on('disconnect', function() {
      console.log('disconnect: ' + socketIO.id);
    });
  }); //end socketIO connection
};