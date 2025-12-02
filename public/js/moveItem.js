let draggedItem = null;

const handleDrop = async (event) => {

  event.preventDefault();
  const targetId = event.currentTarget.dataset.id;
  if (!draggedItem || !targetId || draggedItem.id === targetId) return;

  const itemToRemove = draggedItem;

  try {
    const res = await fetch('/folders/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      itemId: itemToRemove.id,
      itemType: itemToRemove.type,
      destinationId: targetId
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Server error: ', errorText);
    alert(`Move failed: due to server error.`);
    return;
  }

  const data = await res.json();

  if (!data.success) {
      alert(`Move failed: ${data.error}`);
      return;
  }

  // Only remove if the destination is NOT the current folder
  const currentFolderId = document.querySelector('.breadcrumbs a:last-child')?.dataset.id;
  if (targetId !== currentFolderId) {
    const itemEl = document.querySelector(`li[data-id="${itemToRemove.id}"][data-type="${itemToRemove.type}"]`);
    if (!itemEl || !document.body.contains(itemEl)) return;

    if (data.finalName !== data.originalName) {
        alert(`Name conflict resolved: "${data.originalName}" was renamed to "${data.finalName}"`);
      }

      itemEl.remove();
  }
    await refreshUserFolders();
  } catch (err) {
    console.error('Move error:', err);
    alert('Move failed: An unexpected error occurred.');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const draggables = document.querySelectorAll('[draggable="true"]');
  console.log("Found", draggables.length, "draggable elements");

  draggables.forEach(el => {
    el.addEventListener('dragstart', (e) => {
      draggedItem = {
        id: el.dataset.id,
        type: el.dataset.type
      };
      console.log("dragstart fired", draggedItem);

      e.dataTransfer.setData("text/plain", el.dataset.id);
      e.dataTransfer.setData("type", el.dataset.type);
      e.dataTransfer.effectAllowed = "move";
    });
  });
});

document.querySelectorAll('.folder.card, .breadcrumbs a').forEach(el => {
  el.addEventListener('dragover', (e) => {
    e.preventDefault();
    el.classList.add('drag-hover');
  });

  el.addEventListener('dragleave', () => {
    el.classList.remove('drag-hover');
  });

  el.addEventListener('drop', handleDrop);
});

document.addEventListener('dragend', () => {
  draggedItem = null;
  document.querySelectorAll('.drag-hover').forEach(el => el.classList.remove('drag-hover'));
});

const triggerMove = (itemId, itemType, destinationId) => {
  if (itemId === destinationId) {
    alert("You can't move a folder into itself.");
    return;
  }

  const itemEl = document.querySelector(`.${itemType}.card[data-id="${itemId}"]`);
  if (!itemEl) {
    console.warn(`Item not found: ${itemId}`);
    return;
  }

  itemEl.dataset.parentId = destinationId;

  // Optional: persist the change
  fetch('/folders/move', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itemId, itemType, destinationId })
  }).then(async res => {
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error: ', errorText);
      alert(`${errorText.error}.`);
      return;
    }
    const data = await res.json();

    if (!data.success) {
        alert(`Move failed: ${data.error}`);
        return;
      }

      if (data.finalName !== data.originalName) {
        alert(`Name conflict resolved: "${data.originalName}" was renamed to "${data.finalName}"`);
      }

      itemEl.remove();

      await refreshUserFolders();
  })
    .catch(err => {
      console.error('Move error:', err);
    });
};