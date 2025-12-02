const handleShare = async (folderId) => {
  try {
    const res = await fetch(`/share/${folderId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expiresInDays: 7 }),
    });

    const data = await res.json();

    const expiresAt = new Date(data.expiresAt);
    const now = new Date();

    if (expiresAt <= now) {
      alert('This share link has expired.');
      return;
    }

    const fullLink = `${window.location.origin}${data.url}`;

    document.getElementById('shareLink').value = fullLink;
    document.getElementById('shareExpires').textContent = new Date(data.expiresAt).toLocaleDateString();
    document.getElementById('shareModal').style.display = 'block';
  } catch (err) {
    console.error('Failed to generate share link:', err);
    alert('Could not generate share link.');
  }
};

const copyShareLink = () => {
  const link = document.getElementById('shareLink').value;
  navigator.clipboard.writeText(link);
};

const closeShareModal = () => {
  document.getElementById('shareModal').style.display = 'none';
};
