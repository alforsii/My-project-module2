document.addEventListener(
  'DOMContentLoaded',
  () => {
    // console.log('IronGenerator JS imported successfully!');
    //=-=-=-=-=-=--=-=-=-=-=Search user list---==-=-=-=-=-=-=-=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-
    if (
      document.getElementById('search-user1') ||
      document.getElementById('search-user2') ||
      document.getElementById('search-user3')
    ) {
      document
        .getElementById('search-user1')
        .addEventListener('keyup', () => filterList('search-user1', '.user1'));
      document
        .getElementById('search-user2')
        .addEventListener('keyup', () => filterList('search-user2', '.user2'));
      document
        .getElementById('search-user3')
        .addEventListener('keyup', () => filterList('search-user3', '.user3'));

      function filterList(id, user) {
        const users = document.querySelectorAll(user);
        const input = document.getElementById(id).value.toUpperCase();

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
    }
    //=-=-=-=-=-=-=-=--=-=--=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=--=-=-=
  },
  false
);
