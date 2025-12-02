const triggerDelete = async (id, type) => {

  const confirmed = type === 'folder' 
    ? confirm(`Delete this folder and all its contents?`)
    : confirm(`Delete this file?`);
  if (!confirmed) return;

  try {
    const res = await fetch(`/folders/delete/${type}/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();

    if (data.success) {
      document.querySelector(`[data-id="${id}"]`)?.remove();
    } else {
      alert(`Delete failed: ${data.error}`);
    }
  } catch (err) {
    console.error('Delete request failed:', err);
  }
};
