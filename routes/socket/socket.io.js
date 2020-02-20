module.exports = client => {
  const Chat = require('../../models/Chat.model');
  const Message = require('../../models/Message.model');
  const User = require('../../models/User.model');

  client.on('connection', socket => {
    // console.log('Output for: socket', socket);
    console.log('A new user just connected');
    // console.log('new connection: ' + socket.id);

    //Create function to send the status
    const sendStatus = function(s) {
      socket.emit('status', s);
    };

    // //Get chat from DB
    // Message.find()
    //   .limit(20)
    //   .sort({ _id: 1 })
    //   .then(chatsFromDB => {
    //     if (chatsFromDB) {
    //       socket.emit('output', chatsFromDB);
    //     }
    //   })
    //   .catch(err => console.log(err));

    //Handle input events
    socket.on('input', data => {
      //data is (chatsFromDB)from Chat model(which is db name) from DB
      let otherUserID = data.id;
      let currentUserID = data.userInSessionID;
      let message = data.message;
      let email = data.email;
      let username = data.username;

      //check for email && message inputs
      if (message == '') {
        //if no email or message send err message
        sendStatus('Please type message...');
      } else {
        User.findById(otherUserID)
          .populate('userChatBoards')
          .then(otherUser => {
            User.findById(currentUserID)
              .populate('userChatBoards')
              .then(user => {
                // console.log('current user: ', user);
                // console.log('Output for: user', user);
                //Ok we populate userBoard to check if any board doesn't have the same receiver id
                //because every board should have only one uniq receiver.

                Chat.find({})
                  .populate('userChatBoards')
                  .then(chatBoardsFromDB => {
                    // console.log('chatBoardsFromDB: ', chatBoardsFromDB);
                    const foundChatBoard = chatBoardsFromDB.filter(
                      chatBoardFromDB =>
                        chatBoardFromDB.receiverID.toString() ===
                        otherUser._id.toString()
                          ? userChatBoard
                          : []
                    );
                    console.log('foundChatBoard: ', foundChatBoard);
                    //check if the board already exist, it not then create new Board..
                    if (foundChatBoard.length == 0) {
                      //1.Create Chat board------------------------------------
                      Chat.create({
                        author: user._id,
                        senderID: user._id,
                        receiverID: otherUser._id,
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
                            { new: true }
                          )
                            .then(updatedUser => {
                              console.log('updatedUser: ', updatedUser);
                            })
                            .catch(err =>
                              console.log(
                                `Error while creating userBoard in Chat ${err}`
                              )
                            );
                          //2.Other User Chat boards update
                          User.findByIdAndUpdate(
                            otherUser._id,
                            {
                              $push: {
                                userChatBoards: newlyCreatedChatBoard._id,
                              },
                            },
                            { new: true }
                          )
                            .then(updatedOtherUser => {
                              console.log(
                                'updatedOtherUser: ',
                                updatedOtherUser
                              );
                            })
                            .catch(err =>
                              console.log(
                                `Error while creating userBoard in Chat ${err}`
                              )
                            );

                          //2.Create message-------------------------------------
                          Message.create({
                            author: user._id, //author of message
                            receiver: otherUser._id,
                            // username: otherUser.username,
                            // email: otherUser.email,
                            message, //the actual message
                            messageBoard: newlyCreatedChatBoard._id,
                          })
                            .then(createdMessage => {
                              console.log('createdMessage1: ', createdMessage);
                              //Push the message id to the newly created board, where it belongs
                              //so later we can find particular message by it's created _id.
                              Chat.findByIdAndUpdate(
                                newlyCreatedChatBoard._id,
                                {
                                  $push: { messages: createdMessage._id }, //pushing new message ref: id -> to Chat board property, which is messages
                                },
                                { new: true }
                              )
                                .then(updatedNewChatBoard => {
                                  console.log(
                                    'updatedNewChatBoard(add message)1: ',
                                    updatedNewChatBoard
                                  );

                                  // //Now to display the messages in the board where they belongs
                                  // //<--- Here to display the message -->
                                })
                                .catch(err =>
                                  console.log(
                                    `Error while adding new message to Chat messages ${err}`
                                  )
                                );

                              //<---or Here to display the message -->
                            })
                            .catch(err =>
                              console.log(
                                `Error while creating chart msg ${err}`
                              )
                            );
                        })
                        .catch(err =>
                          console.log(
                            `Error happened while creating Chat board ${err}`
                          )
                        );
                      //end Chat.create if not found in DB
                    } else {
                      //if Chat board exists then do next=>-------------
                      // foundChatBoard
                      //2.Create message-------------------------------------
                      Message.create({
                        author: user._id, //author of message
                        receiver: otherUser._id,
                        // username: otherUser.username,
                        // email: otherUser.email,
                        message, //the actual message
                        messageBoard: foundChatBoard[0]._id,
                      })
                        .then(createdMessage => {
                          console.log('createdMessage2: ', createdMessage);
                          //Push the message id to the existing board, where it belongs
                          //so later we can find particular message by it's created _id.
                          Chat.findByIdAndUpdate(
                            foundChatBoard[0]._id, //we could pass her createdMessage.messageBoard -- it should be the same since we're inside then(response from DB)
                            {
                              $push: { messages: createdMessage._id }, //pushing new message ref: id -> to existing Chat board property - messages, which is in foundChatBoard
                            },
                            { new: true }
                          )
                            .then(updatedChatBoard => {
                              console.log(
                                'updatedChatBoard(if exists)2: ',
                                updatedChatBoard
                              );

                              // //Now to display the messages in the board where they belongs
                              //<--- Here to display the message -->
                            })
                            .catch(err =>
                              console.log(
                                `Error while adding new message to Chat messages ${err}`
                              )
                            );

                          //<--- or Here to display the message -->
                        })
                        .catch(err =>
                          console.log(`Error while creating chart msg ${err}`)
                        );
                    }
                    //end else statement
                  })
                  .catch(err =>
                    console.log(
                      `Error while searching for Chat board in DB ${err}`
                    )
                  );
                //end of Chat.find()
              })
              .catch(err =>
                console.log(`Error while looking current user ${err}`)
              );
            //end current user
          })
          .catch(err => console.log(`Error while looking other user ${err}`));
        //end other user
      }
      //end else statement

      //-Display messages------------------------------------------
      // console.log('chart created: ', createdMessage);
      // User.findById(otherUserID)
      User.findById(currentUserID)
        .populate({
          path: 'userChatBoards',
          populate: [{ path: 'messages' }],
        })
        .then(userFromDB => {
          console.log('userFromDB: ', userFromDB.messages);

          //     // Before out put we need to check the current Chat Board, so we can get all messages from that board and display it(not to display to every board all the messages)
          //     //???????? not checked yet ?????????
          //     //output
          client.emit('output', userFromDB.messages); //every message has author,message and messageBoard where it belongs
          // Broadcast to everyone else (except the sender)
          socket.broadcast.emit('output', {
            from: userFromDB._id,
            // message: userFromDB.receiver,
            // username: userFromDB.receiver,
          });
          // Send back the same message to the sender
          socket.emit('output', {
            from: otherUserID,
            // message: userFromDB.sender.message,
            // username: userFromDB.sender.username,
          });
        })
        .catch(err => console.log(`Error in display section ${err}`));

      //Send status obj
      sendStatus({
        message: 'Message sent',
        clear: true,
      });
    });
    //End Display messages----

    //------Handle clear-----------------------------
    socket.on('clear', data => {
      //Remove all chats from DB
      Message.deleteMany()
        .then(() => {
          socket.emit('cleared');
        })
        .catch(err => console.log(err));
    });

    //------- Disconnected ---------------------------
    socket.on('disconnect', function() {
      console.log('disconnect: ' + socket.id);
      // io.emit('disconnect', socket.id)
    });
  });
};
