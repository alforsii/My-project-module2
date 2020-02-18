function openSlideMenu() {
  document.getElementById('side-menu').style.width = '250px';
  document.getElementById('friend-list-btn').style.zIndex = -1;
  document.getElementById('chatList-btn').style.zIndex = -1;
  document.getElementById('friend-list-btn').style.transition = '0.3s ease-in';
  document.getElementById('chatList-btn').style.transition = '0.3s ease-in';
}
function closeSlideMenu() {
  document.getElementById('side-menu').style.width = '0';
  document.getElementById('friend-list-btn').style.zIndex = 3;
  document.getElementById('chatList-btn').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.transition = '0.5s ease-out';
  document.getElementById('chatList-btn').style.transition = '0.5s ease-out';
}

function openChatList() {
  document.getElementById('side-menu2').style.height = '350px';
  document.getElementById('friend-list-btn').style.zIndex = -1;
  document.getElementById('chatList-btn').style.zIndex = -1;
  document.getElementById('friend-list-btn').style.transition = '0.3s ease-in';
}

function closeChatList() {
  document.getElementById('side-menu2').style.height = '0';
  document.getElementById('friend-list-btn').style.zIndex = 3;
  document.getElementById('chatList-btn').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.transition = '0.5s ease-out';
}
if (
  document.getElementsByClassName('center-div')[0] &&
  document.getElementsByTagName('nav')[0] !== undefined
) {
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
    .getElementsByClassName('curr-user')[0]
    .addEventListener('click', () => {
      closeChatList();
    });
}
