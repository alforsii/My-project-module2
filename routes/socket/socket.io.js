module.exports = client => {
  const Chat = require('../../models/Chat.model');
  const Message = require('../../models/Message.model');
  const User = require('../../models/User.model');

  //if user signed in (it's set to signed in - where message board)
  client.on('connection', socketIO => {
    // console.log('new connection: ' + socketIO.id);

    //Create function to send the status
    const sendStatus = function(s) {
      setTimeout(() => {
        socketIO.emit('status', s);
      }, 500);
    };

    //Receive the data from socketIO.js(client) when user clicked
    socketIO.on('display', usersData => {
      console.log('Output for: usersData', usersData);
      //data is userInSessionID and the other user (array of two users that belongs to the board)
      // - I actually need a single board id for two users -
      // one is the user in session and the other selected to send message
      // so i can check if that board belongs to this two users
      // probably I need a single array with every two users and the id of that array,
      // and I gotta make sure I don't have another array with the same users

      // //Get chat from DB and display when selected
      Message.find()
        .limit(20)
        .sort({
          _id: 1,
        })
        .populate('author')
        .populate('receiverID')
        .then(chatsFromDB => {
          const filteredMessagesByChatBoard = chatsFromDB.filter(chat => {
            return (
              usersData.includes(chat.author._id.toString()) &&
              usersData.includes(chat.receiverID._id.toString())
            );
          });

          // console.log('filteredMessagesByChatBoard: ', filteredMessagesByChatBoard);
          if (filteredMessagesByChatBoard) {
            socketIO.emit('output', filteredMessagesByChatBoard); //send msg data
            socketIO.emit('updateDeleteBtnStatus');
          }
        })
        .catch(err =>
          console.log(
            `Error while getting the messages fromDB to send to client: ${err}`
          )
        );
    });
    //Handle input events
    //-receive the date, which was sent from socketIO.js (front end - client)
    socketIO.on('input', data => {
      //data is from front end
      let otherUserID = data.id;
      let currentUserID = data.userInSessionID;
      let message = data.message;
      let receiver = data.username;

      //check for email && message inputs
      if (message == '') {
        //if no email or message send err message
        sendStatus({ message: 'Please type a message...', color: 'red' });
      } else {
        User.findById(currentUserID)
          .populate('userChatBoards')
          .then(user => {
            // console.log('Output for: user', user);
            //Ok we populate userBoard to check if any board doesn't have the same receiver id
            //because every board should have only one uniq receiver and one current user.

            const foundChatBoard = user.userChatBoards.filter(board => {
              return (
                board.users.includes(currentUserID) &&
                board.users.includes(otherUserID)
              );
            });
            // console.log('foundChatBoard: ', foundChatBoard);
            //check if the board already exist, it not then create new Board..
            if (foundChatBoard.length == 0) {
              //1.Create Chat board------------------------------------
              Chat.create({
                users: [user._id, otherUserID],
                author: user._id,
                sender: user.username,
                receiver,
                // messages,
              })
                .then(newlyCreatedChatBoard => {
                  //add created board to the userChatBoards list

                  //1.My Chat boards update
                  User.findByIdAndUpdate(
                    user._id,
                    {
                      $push: {
                        userChatBoards: newlyCreatedChatBoard._id,
                      },
                    },
                    {
                      new: true,
                    }
                  )
                    .then(updatedUser => {
                      console.log('user updated: ');
                    })
                    .catch(err =>
                      console.log(
                        `Error while creating userBoard in Chat ${err}`
                      )
                    );
                  //2.Other User Chat boards update
                  User.findByIdAndUpdate(
                    otherUserID,
                    {
                      $push: {
                        userChatBoards: newlyCreatedChatBoard._id,
                      },
                    },
                    {
                      new: true,
                    }
                  )
                    .then(updatedOtherUser => {
                      console.log('otherUser updated: ');
                    })
                    .catch(err =>
                      console.log(
                        `Error while creating userBoard in Chat ${err}`
                      )
                    );

                  //2.Create message-------------------------------------
                  Message.create({
                    author: user._id, //author of message
                    receiverID: otherUserID,
                    receiver,
                    sender: user.username,
                    message, //the actual message
                    messageBoard: newlyCreatedChatBoard._id,
                  })
                    .then(createdMessage => {
                      console.log('createdMessage1: ');
                      updateChatBoard(createdMessage);
                      //Push the message id to the newly created board, where it belongs
                      //so later we can find particular message by it's created _id.
                      Chat.findByIdAndUpdate(
                        newlyCreatedChatBoard._id,
                        {
                          $push: {
                            messages: createdMessage._id,
                          }, //pushing new message ref: id -> to Chat board property, which is messages
                        },
                        {
                          new: true,
                        }
                      )
                        .then(updatedNewChatBoard => {
                          console.log('updatedNewChatBoard(add message)1: ');
                        })
                        .catch(err =>
                          console.log(
                            `Error while adding new message to Chat messages ${err}`
                          )
                        );
                    })
                    .catch(err =>
                      console.log(`Error while creating chart msg ${err}`)
                    );
                })
                .catch(err =>
                  console.log(`Error happened while creating Chat board ${err}`)
                );
              //end Chat.create if not found in DB
            } else {
              //if Chat board exists then do next=>-------------
              // foundChatBoard
              //2.Create message-------------------------------------
              Message.create({
                author: user._id, //author of message
                receiverID: otherUserID,
                receiver,
                sender: user.username,
                message, //the actual message
                messageBoard: foundChatBoard[0]._id,
              })
                .then(createdMessage => {
                  console.log('createdMessage2: ');
                  updateChatBoard(createdMessage); //-----------------------------------------------
                  //Push the message id to the existing board, where it belongs
                  //so later we can find particular message by it's created _id.
                  Chat.findByIdAndUpdate(
                    foundChatBoard[0]._id, //we could pass her createdMessage.messageBoard -- it should be the same since we're inside then(response from DB)
                    {
                      $push: {
                        messages: createdMessage._id,
                      }, //pushing new message ref: id -> to existing Chat board property - messages, which is in foundChatBoard
                    },
                    {
                      new: true,
                    }
                  )
                    .then(updatedChatBoard => {
                      console.log('updatedChatBoard(if exists)2: ');
                    })
                    .catch(err =>
                      console.log(
                        `Error while adding new message to Chat messages ${err}`
                      )
                    );
                })
                .catch(err =>
                  console.log(`Error while creating chart msg ${err}`)
                );
            }
            //end else statement
          })
          .catch(err => console.log(`Error while looking current user ${err}`));
      }
      //end else statement

      //-Send updated message to the client------------------------------------------
      function updateChatBoard(createdMessage) {
        // socketIO.emit('updateOutput', data);
        Message.findById(createdMessage._id)
          .populate('author')
          .populate('receiverID')
          .then(data => {
            // console.log('data created', data);
            setTimeout(() => {
              socketIO.emit('updateOutput', data);
            }, 500);
            setTimeout(() => {
              socketIO.emit('updateDeleteBtnStatus');
            }, 550);
          })
          .catch(err =>
            console.log(`Error while Sending updated message ${err}`)
          );
        //Send status obj
        sendStatus({
          message: 'Message sent',
          sent: true,
          color: 'green',
        });
      }

      // //End Send updated message to the client----
    }); //end socketIO.on('input')

    //------Handle clear all messaged in DB-----------------------------
    // socketIO.on('clear', data => {
    //   //Remove all chats from DB
    //   Message.deleteMany()
    //     .then(() => {
    //       socketIO.emit('cleared');
    //       sendStatus({
    //         message: 'Messages deleted',
    //         color: 'red',
    //       });
    //     })
    //     .catch(err => console.log(err));
    // });

    //---------Handle delete single message ----------------
    socketIO.on('requestDeleteMsg', data => {
      //data - which is msgId
      Message.findByIdAndDelete(data)
        .then(data => {
          sendStatus({
            message: 'Message deleted',
            color: 'red',
          });
        })
        .catch(err => console.log(err));
    });

    //------- Disconnected ---------------------------
    // socketIO.on('disconnect', function() {
    //   console.log('disconnect: ' + socketIO.id);
    // });
  }); //end socketIO connection
};
