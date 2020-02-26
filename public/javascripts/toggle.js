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
    .getElementsByClassName('curr-user')[0]
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

  //------------open/close friends list-----------------
  function openFriendsList() {
    document.getElementById('friends-list').style.height = '250px';
  }
  function closeFriendsList() {
    document.getElementById('friends-list').style.height = '60px';
  }
  // document.getElementById('friends-list').style.height = '250px';
  // document.getElementById('friends-list').addEventListener('click', () => {
  //   if (height === 60) {
  //     openFriendsList();
  //     height = parseInt(document.getElementById('friends-list').style.height);
  //     // h = 350;
  //   } else if (height === 250) {
  //     closeFriendsList();
  //     height = parseInt(document.getElementById('friends-list').style.height);
  //   }
  // });
}
