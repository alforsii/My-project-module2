let h = 50;

function openSlideMenu() {
  document.getElementById('side-menu').style.width = '250px';
  document.getElementById('friend-list-btn').style.zIndex = -1;
  document.getElementById('friend-list-btn').style.transition = '0.3s ease-in';
}

function closeSlideMenu() {
  document.getElementById('side-menu').style.width = '0';
  document.getElementById('friend-list-btn').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.transition = '0.5s ease-out';
}

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
  //open and close chat list
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
}
