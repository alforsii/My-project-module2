let h = 50;
let height = 60;

// ----------------- side menu on small screen --------------------
function openSlideMenu() {
  document.getElementById('side-menu').style.width = '250px';
  document.getElementById('side-menu').style.zIndex = 4;
  document.getElementById('friend-list-btn').style.zIndex = -1;
  document.getElementById('friend-list-btn').style.transition = '0.3s ease-in';
  if (document.getElementById('side-menu2'))
    document.getElementById('side-menu2').style.zIndex = -1;
}

function closeSlideMenu() {
  document.getElementById('side-menu').style.width = '0';
  document.getElementById('friend-list-btn').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.transition = '0.5s ease-out';
  if (document.getElementById('side-menu2'))
    document.getElementById('side-menu2').style.zIndex = 3;
}

// ----------- small screen chat list ----------------------
function openChatList() {
  document.getElementById('side-menu2').style.height = '350px';
  document.getElementById('search-user2').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.zIndex = -1;
  document.getElementById('friend-list-btn').style.transition = '0.3s ease-in';
}

function closeChatList() {
  document.getElementById('side-menu2').style.height = '50px';
  document.getElementById('search-user2').style.zIndex = '';
  document.getElementById('friend-list-btn').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.transition = '0.5s ease-out';
}
//--------------- close chat board -----------------------
function closeChatBoard() {
  document.querySelector('.messageBoard').style.display = 'none';
}

if (
  document.getElementsByClassName('center-div')[0] &&
  document.getElementsByTagName('nav')[0] !== undefined
) {
  //close side menu or chat list (if its open)  by clicking anywhere else in the DOM
  document
    .getElementsByClassName('center-div')[0]
    .addEventListener('click', () => {
      closeChatList();
      closeSlideMenu();
    });
  document.getElementsByTagName('nav')[0].addEventListener('click', () => {
    closeChatList();
    closeSlideMenu();
  });
  document
    .getElementsByClassName('weather-div')[0]
    .addEventListener('click', () => {
      closeChatList();
      closeSlideMenu();
    });
  document
    .getElementsByClassName('messageBoard')[0]
    .addEventListener('click', () => {
      closeChatList();
      closeSlideMenu();
    });

  //--------------open and close chat list -----------------
  document
    .getElementsByClassName('curr-user-img')[0]
    .addEventListener('click', () => {
      if (h === 50) {
        openChatList();
        h = parseInt(document.getElementById('side-menu2').style.height);
        // h = 350;
      } else if (h === 350) {
        closeChatList();
        h = parseInt(document.getElementById('side-menu2').style.height);
      }
    });
}

if (document.querySelector('.friends-header-title span')) {
  document
    .querySelector('.friends-header-title span')
    .addEventListener('click', event => {
      // console.log('Output for: event', event);
      document
        .querySelector('.friends-header-title a')
        .classList.toggle('hide');
      document.getElementById('search-user3').classList.toggle('show');
    });
}
