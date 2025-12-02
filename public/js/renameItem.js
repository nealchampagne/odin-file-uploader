// Global click guard for folder navigation
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.card-link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.closest('li').classList.contains('renaming')) {
        e.preventDefault();
      }
    });
  });
});

document.addEventListener('click', (e) => {
  const link = e.target.closest('.card-link');
  if (!link) return;

  const li = link.closest('li');
  if (li && li.classList.contains('renaming')) {
    e.preventDefault();
  }
});

const triggerRename = (span) => {
  const id = span.dataset.id;
  const type = span.dataset.type;
  const currentName = span.textContent.trim();
  const li = span.closest('li');

  li.classList.add('renaming');

  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentName;
  input.className = 'rename-input';

  span.replaceWith(input);
  input.focus();
  input.select();

  input.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  const revert = () => {
      input.replaceWith(span);
      li.classList.remove('renaming');
  };

  const commitRename = () => {
    const newName = input.value.trim();
    if (!newName || newName === currentName) return revert();

    fetch('/folders/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, newName, type }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          span.textContent = data.newName;
          li.classList.remove('renaming');
          input.replaceWith(span);
        } else {
          console.error('Rename failed:', data.error);
          revert();
        }
      })
      .catch(err => {
        console.error('Rename error:', err);
        revert();
      });
  };
  input.addEventListener('blur', commitRename);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
    if (e.key === 'Escape') revert();
  });
  input.addEventListener('click', e => e.stopPropagation());
};
