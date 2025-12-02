document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('.upload-form');
  if (!form) return;

  const fileInput = form.querySelector('input[name="file"]');
  const folderIdInput = document.getElementById('selectedFolderId');

  // Defensive submit handler
  form.addEventListener('submit', (e) => {
    const file = fileInput.files[0];
    if (!file) {
      e.preventDefault();
      alert('Please select a file before uploading.');
      return;
    }

    if (!folderIdInput.value) {
      e.preventDefault();
      alert('Please select a folder before uploading.');
      return;
    }

    // Inject metadata at submit time
    form.querySelector('input[name="name"]').value = file.name;
    form.querySelector('input[name="size"]').value = file.size;
    form.querySelector('input[name="mimeType"]').value = file.type;
    form.querySelector('input[name="url"]').value = '/uploads/' + encodeURIComponent(file.name);
  });

  // Load and render folder tree
  await refreshUserFolders();
  const tree = renderFolderTree(window.folderTree);
  const treeContainer = document.getElementById('folderTreeContainer');
  treeContainer.appendChild(tree);

  // Folder selection logic
  treeContainer.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const label = e.target.closest('.folder-label');
    if (!label || !treeContainer.contains(label)) return;

    treeContainer.querySelectorAll('.folder-label.selected').forEach(el => el.classList.remove('selected'));
    label.classList.add('selected');
    folderIdInput.value = label.dataset.id;
  });
});

const hideUploadForm = () => {
  document.getElementById('uploadForm').style.display = 'none';
};



