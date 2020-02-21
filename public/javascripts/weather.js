(function() {
  if (document.getElementById('messageBoard')) {
    // const localHost = window.location.origin;
    // const path = window.location.pathname;
    const inputSearch = document.getElementById('input-search');
    const weatherForm = document.getElementById('weather-form');
    const theWeather = document.getElementById('theWeather'); //this is main div

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
          city: inputSearch.value,
        });
        event.preventDefault();
      }
    });
    //2.handle input(send msg,info about sender and to whom sending) by click
    weatherForm.addEventListener('submit', function(event) {
      event.preventDefault();
      //Emit to server input

      socketIO.emit('url', {
        city: inputSearch.value,
      });
    });

    //=-=-=-=-===-=-=-=-=-=-= Receive back message -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (socketIO !== undefined) {
      console.log('Connected to weather socket..');
      //receive data from socket.io(back end - server)
      //Handle output from 'output' function that we assigned to the socket property in the back end
      socketIO.on('response', data => {
        if (data) {
          console.log('Output fromDB: ', data);
          const msgDiv = document.createElement('div');
          let msg = `
            <div class="weather-details">
              <div>
                <h2 class="city-name">${data.weather.name}</h2>
                <p>${data.temperature}</p>
              </div>
              <div>
                <h3>High</h3>
                <p>${data.highTemp}</p>
              </div>
              <div>
                <h3>Low</h3>
                <p>${data.lowTemp}</p>
              </div>
              <div>
                <h3>Feels Like</h3>
                <p>${data.feelsLike}</p>
              </div>
              <div>
                <h3>Pressure</h3>
                <p>${data.weather.main.pressure}</p>
              </div>
              <div>
                <h3>Humidity</h3>
                <p>${data.weather.main.humidity}%</p>
              </div>
              <div>
                <h3>Wind</h3>
                <p>${data.windSpeed} mp/h</p>
              </div>
            </div>
          `;
          msgDiv.innerHTML = msg;
          theWeather.appendChild(msgDiv);
        }
      });
    }

    // <-- end of function -->
  }
})();
