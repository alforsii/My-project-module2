module.exports = client => {
  const API_KEY = require('../../configs/keys');
  const User = require('../../models/User.model');
  const axios = require('axios');
  let apiUrl;

  //if user signed in (it's set to signed in - where message board)
  client.on('connection', socketIO => {
    // console.log('new connection: ' + socketIO.id);
    //=-=-=--==-=-=-=-=-=-=-=-= Display the city of User -=-=-=-=-=-===-=--=-=-=-=-=-=-=-=-=-=--==-=-

    // socketIO.on('display-saved-city', data => {
    //   User.findById(data.userId)
    //     .then(userFromDb => {
    //       // console.log('userFromDb', userFromDb);
    //       apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${userFromDb.city}&appid=${API_KEY}`;
    //       // console.log('Output for: apiUrl', apiUrl);
    //       axios
    //         .get(apiUrl)
    //         .then(weather => {
    //           // console.log(weather.data);
    //           const { main, wind } = weather.data;
    //           let temperature =
    //             Math.round(1.8 * parseInt(main.temp - 273) + 32) + '°';
    //           let highTemp =
    //             Math.round(1.8 * parseInt(main.temp_max - 273) + 32) + '°';
    //           let lowTemp =
    //             Math.round(1.8 * parseInt(main.temp_min - 273) + 32) + '°';
    //           let feelsLike =
    //             Math.round(1.8 * parseInt(main.feels_like - 273) + 32) + '°';
    //           let windSpeed = Math.round(2.23694 * parseInt(wind.speed));
    //           let pressure = Math.round(6895 / parseInt(main.pressure));

    //           socketIO.emit('response', {
    //             weather: weather.data,
    //             temperature,
    //             highTemp,
    //             lowTemp,
    //             feelsLike,
    //             windSpeed,
    //             pressure,
    //           });
    //         })
    //         .catch(err => console.log(`Error in axios api call ${err}`));
    //       //end axios call
    //     })
    //     .catch(err =>
    //       console.log(`Error while searching for redisplay in DB ${err}`)
    //     );
    // });
    //=-=-=--==-=-=-=-=-=-=-=-= Update User City -=-=-=-=-=-===-=--=-=-=-=-=-=-=-=-=-=--==-=-
    socketIO.on('url', data => {
      const { userId, city } = data;
      User.findByIdAndUpdate({ _id: userId }, { city: city }, { new: true })
        .then(updatedUser => {
          // console.log('updatedUser: ', updatedUser);

          apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${updatedUser.city}&appid=${API_KEY}`;
          axios
            .get(apiUrl)
            .then(weather => {
              // console.log(weather.data);
              const { main, wind } = weather.data;
              let temperature =
                Math.round(1.8 * parseInt(main.temp - 273) + 32) + '°';
              let highTemp =
                Math.round(1.8 * parseInt(main.temp_max - 273) + 32) + '°';
              let lowTemp =
                Math.round(1.8 * parseInt(main.temp_min - 273) + 32) + '°';
              let feelsLike =
                Math.round(1.8 * parseInt(main.feels_like - 273) + 32) + '°';
              let windSpeed = Math.round(2.23694 * parseInt(wind.speed));
              let pressure = Math.round(6895 / parseInt(main.pressure));

              socketIO.emit('response', {
                weather: weather.data,
                temperature,
                highTemp,
                lowTemp,
                feelsLike,
                windSpeed,
                pressure,
              });
            })
            .catch(err => console.log(`Error in axios api call ${err}`));
          //end axios call
        })
        .catch(err =>
          console.log(`Error while creating the new city in DB ${err}`)
        ); //end  City.create()
    }); //end socketIO.on('url',data)

    //------- Disconnected ---------------------------
    // socketIO.on('disconnect', function() {
    //   console.log('disconnect: ' + socketIO.id);
    //   // io.emit('disconnect', socketIO.id)
    // });
  }); //end socketIO connection
};
