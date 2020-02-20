document.addEventListener(
  'DOMContentLoaded',
  () => {
    // console.log('IronGenerator JS imported successfully!');
    //=-=-=-=-=-=--=-=-=-=-=Search user list---==-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-
    document
      .getElementById('search-user')
      .addEventListener('keyup', filterList);

    function filterList() {
      const users = document.querySelectorAll('.user');
      const input = document.getElementById('search-user').value.toUpperCase();

      users.forEach((user, i) => {
        const userName = user
          .querySelector('.username')
          .innerHTML.toUpperCase();
        // console.log('userName: ', userName);
        // console.log('Output for: user', user);

        !userName.includes(input)
          ? (user.parentElement.style.display = 'none')
          : (user.parentElement.style.display = '');
      });
    }
    //=-=-=-=-=-=-=-=--=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=
  },
  false
);
