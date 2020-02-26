(function() {
  if (document.getElementById('theWeather')) {
    // const localHost = window.location.origin;
    // const path = window.location.pathname;
    const inputSearch = document.getElementById('input-search');
    const weatherForm = document.getElementById('weather-form');
    const weatherRes = document.getElementById('weather-response'); //this is main div
    // Here is the current user from back end I passed to layout html as attribute to use in front end
    let userInSessionID = document
      .getElementsByTagName('html')[0]
      .getAttribute('userInSession');
    //socket connection
    let socketIO = io();
    window.onunload = () => socket.close();

    //=-=-=-=-===-=-=-=-=-=-= Send message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    //1.handle input(send msg,info about sender and to whom sending) by enter
    inputSearch.addEventListener('keydown', event => {
      if (event.which == 13 && event.shiftKey == false) {
        //Emit to server input
        //Send the data to weather.io(back end - server) if pressed enter key
        socketIO.emit('url', {
          userId: userInSessionID,
          city: inputSearch.value,
        });
        inputSearch.value = '';
        event.preventDefault();
      }
    });
    //2.handle input(send msg,info about sender and to whom sending) by click
    weatherForm.addEventListener('submit', function(event) {
      event.preventDefault();
      //Emit to server input
      inputSearch.value = '';
      socketIO.emit('url', {
        userId: userInSessionID,
        city: inputSearch.value,
      });
    });

    //3.
    window.onload = () => {
      socketIO.emit('display-saved-city', { userId: userInSessionID });
    };

    //=-=-=-=-===-=-=-=-=-=-= Receive back message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socketIO !== undefined) {
      console.log('Connected to weather socket..');
      //receive data from socket.io(back end - server)
      //Handle output from 'output' function that we assigned to the socket property in the back end
      socketIO.on('response', data => {
        if (data) {
          // console.log('Output fromDB: ', data);
          const wDetails = document.createElement('div');
          wDetails.setAttribute('class', 'weather-details');
          const {
            weather,
            temperature,
            highTemp,
            lowTemp,
            feelsLike,
            windSpeed,
            pressure,
          } = data;
          let msg = `
              <div>
                <h2 class="city-name">${weather.name}</h2>
                <p>${temperature}</p>
                <p class="description">${weather.weather[0].description}</p>
              </div>
              <div>
                <h3>High</h3>
                <p>${highTemp}</p>
              </div>
              <div>
                <h3>Low</h3>
                <p>${lowTemp}</p>
              </div>
              <div>
                <h3>Feels Like</h3>
                <p>${feelsLike}</p>
              </div>
              <div>
                <h3>Pressure</h3>
                <p>${pressure} psi</p>
              </div>
              <div>
                <h3>Humidity</h3>
                <p>${weather.main.humidity}%</p>
              </div>
              <div>
                <h3>Wind</h3>
                <p>${windSpeed} mp/h</p>
              </div>
          `;

          wDetails.innerHTML = msg;
          weatherRes.innerHTML = ''; //clear before inserting another req, if the msgDiv has the weather
          weatherRes.appendChild(wDetails);
        }
      });
    }

    // <-- end of function -->
  }
})();
