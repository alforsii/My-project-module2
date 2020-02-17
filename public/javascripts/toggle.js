function openSlideMenu() {
  document.getElementById('side-menu').style.width = '250px';
  document.getElementById('friend-list-btn').style.zIndex = -1;
  document.getElementById('friend-list-btn').style.transition =
    '0.3s ease-in-out';
}

function closeSlideMenu() {
  document.getElementById('side-menu').style.width = '0';
  document.getElementById('friend-list-btn').style.zIndex = 3;
  document.getElementById('friend-list-btn').style.transition =
    '0.5s ease-in-out';
}
