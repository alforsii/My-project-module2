module.exports = client => {
  const API_KEY = require('../../configs/keys');
  const axios = require('axios');
  let apiUrl;

  //if user signed in (it's set to signed in - where message board)
  client.on('connection', socket => {
    // console.log('Output for: socket', socket);
    console.log('The weather socket just connected');
    // console.log('new connection: ' + socket.id);
    //=-=-=--==-=-=-=-=-=-=-=-=-=-=-=-=-=-===-=--=-=-=-=-=-=-=-=-=-=--==-=-
    socket.on('url', data => {
      apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${data.city}&appid=${API_KEY}`;
      axios
        .get(apiUrl)
        .then(weather => {
          // console.log(weather.data);
          let temperature =
            Math.round(1.8 * parseInt(weather.data.main.temp - 273) + 32) +
            '°F';
          let highTemp =
            Math.round(1.8 * parseInt(weather.data.main.temp_max - 273) + 32) +
            '°F';
          let lowTemp =
            Math.round(1.8 * parseInt(weather.data.main.temp_min - 273) + 32) +
            '°';
          let feelsLike =
            Math.round(
              1.8 * parseInt(weather.data.main.feels_like - 273) + 32
            ) + '°';
          let windSpeed = Math.round(
            2.23694 * parseInt(weather.data.wind.speed)
          );

          socket.emit('response', {
            weather: weather.data,
            temperature,
            highTemp,
            lowTemp,
            feelsLike,
            city: data.city,
            windSpeed,
          });
        })
        .catch(err => console.log(err));
    });

    //------- Disconnected ---------------------------
    socket.on('disconnect', function() {
      console.log('disconnect: ' + socket.id);
      // io.emit('disconnect', socket.id)
    });
  }); //end socket connection
};
