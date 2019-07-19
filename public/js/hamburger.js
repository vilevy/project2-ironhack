let menuOpen = false;
const hamburger = document.querySelector('#hamburger');


hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    document.querySelector('#lista').style.transform = 'translateX(0)';
  } else {
    document.querySelector('#lista').style.transform = 'translateX(-100%)';
  }
});
