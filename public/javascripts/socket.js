(function() {
  //Get port
  let port = document.getElementsByTagName('html')[0].getAttribute('port');
  // console.log('Output for: port', port);
  //Gets elem by id
  let element = id => document.getElementById(id);

  //Lets get elements that we need
  let status = element('status');
  let messages = element('messages');
  let textarea = element('textarea');
  let username = element('username');
  let clearBtn = element('clear');
  // console.log('Output for: port', parseInt(port));

  //Set default status
  let statusDefault = status.textContent;

  //Send status
  let setStatus = s => {
    status.textContent = s;
    if (s !== statusDefault) {
      let delay = setTimeout(() => {
        setStatus(statusDefault);
      }, 3000);
    }
  };

  //Connect to socket.io
  let socketIO = io.connect(`http://127.0.0.1:${parseInt(port)}`);

  //check connection
  if (socketIO !== undefined) {
    console.log('Connected to socket..');

    //Handle output
    socketIO.on('output', data => {
      console.log(data);
      if (data) {
        for (let i = 0; i < data.length; i++) {
          let message = document.createElement('div');
          message.setAttribute('class', 'chart-message');
          message.textContent = `${data[i].name}: ${data[i].message}`;
          messages.appendChild(message);
        }
      }
    });
  }

  //Get status from server
  socketIO.on('status', data => {
    //get message status
    setStatus(typeof data === 'object' ? data.message : data);

    //if status clear === true which we assigned in the socket.io.js(back end)
    if (data.clear) textarea.value = '';
  });

  //handle input
  textarea.addEventListener('keydown', event => {
    if (event.which == 13 && event.shiftKey == false) {
      //Emit to server input
      socketIO.emit('input', {
        name: username.value,
        message: textarea.value,
      });
      event.preventDefault();
    }
  });

  //Handle Chat clear
  clearBtn.addEventListener('click', () => socketIO.emit('clear'));

  //Clear message
  socketIO.on('cleared', () => (messages.textContent = ''));

  // <-- end of function -->
})();
