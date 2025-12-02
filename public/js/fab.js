document.addEventListener("DOMContentLoaded", () => {
  const fabContainer = document.querySelector('.fab-container');
  const fabButton = fabContainer.querySelector('.fab-button');

  fabButton.addEventListener('click', () => {
    fabContainer.classList.toggle('active');
  });

  window.showNewFolderForm = () => {
    document.getElementById('newFolderForm').style.display = 'block';
    fabContainer.classList.remove('active');
  };

  window.showUploadForm = () => {
    document.getElementById('uploadForm').style.display = 'block';
    fabContainer.classList.remove('active');
  };

  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 0);
  });
});