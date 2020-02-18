module.exports = client => {
  const Chat = require('../../models/Chat.model');

  client.on('connection', socket => {
    console.log('A new user just connected');

    //Create function to send the status
    const sendStatus = function(s) {
      socket.emit('status', s);
    };

    //Get chat from DB
    Chat.find()
      .limit(20)
      .sort({ _id: 1 })
      .then(chatsFromDB => {
        if (chatsFromDB) {
          socket.emit('output', chatsFromDB);
        }
      })
      .catch(err => console.log(err));

    //Handle input events
    socket.on('input', data => {
      //data is (chatsFromDB)from Chat model(which is db name) from DB
      let name = data.name;
      let message = data.message;

      //check for name && message inputs
      if (name == '' || message == '') {
        //if no name or message send err message
        sendStatus('Please enter name and message');
      } else {
        //create chart
        Chat.create({ name, message })
          .then(res => {
            console.log('chart created: ', res);
            client.emit('output', [data]);

            //Send status obj
            sendStatus({
              message: 'Message sent',
              clear: true,
            });
          })
          .catch(err => console.log(`Error while creating chart msg ${err}`));
      }
    });

    //Handle clear
    socket.on('clear', data => {
      //Remove all chats from DB
      Chat.deleteMany()
        .then(() => {
          socket.emit('cleared');
        })
        .catch(err => console.log(err));
    });
  });
};
