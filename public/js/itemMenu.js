const handleItemAction = (action, itemId, itemType, anchorEl = null) => {
  const selector = `.${itemType}.card[data-id="${itemId}"]`;
  const itemEl = document.querySelector(selector);

  if (!itemEl) {
    console.warn(`No element found for selector: ${selector}`);
    return;
  }

  const target = itemEl.querySelector('.rename-target');

  if (action === 'rename') {
    if (!target) {
      console.warn(`No .rename-target found inside:`, itemEl);
      return;
    }
    triggerRename(target);
    return;
  }

  if (action === 'delete') return triggerDelete(itemId, itemType);
  if (action === 'move') return showMoveDropdown(itemId, itemType, anchorEl);
  if (action === 'details') {
    window.location.href = `/files/${itemId}`;
    return;
  }
  if (action === 'download') {
    window.location.href = `/files/${itemId}/download`;
    return;
  }
  if (action === 'share') return handleShare(itemId);
};

const showContextMenu = (anchorEl, itemId, itemType, keyboard = false) => {
  const menu = document.createElement('ul');
  menu.className = 'context-menu';
  menu.innerHTML = `
    <li tabindex="0" data-action="rename">Rename</li>
    <li tabindex="0" data-action="delete">Delete</li>
    <li tabindex="0" data-action="move">Move</li>
    ${itemType === 'folder' 
      ? '<li tabindex="0" data-action="share">Share</li>' 
      : `<li tabindex="0" data-action="details">Details</li>
         <li tabindex="0" data-action="download">Download</li>`
    } 
  `;

  menu.style.position = 'absolute';
  menu.style.top = `${anchorEl.offsetTop + anchorEl.offsetHeight}px`;
  menu.style.left = `${anchorEl.offsetLeft}px`;

  document.body.appendChild(menu);

  const cleanup = () => menu.remove();
  setTimeout(() => document.addEventListener('click', cleanup, { once: true }));

  menu.addEventListener('click', (e) => {
    const action = e.target.dataset.action;
    if (action === 'move') {
      handleItemAction(action, itemId, itemType, anchorEl); // pass kebab
    } else {
      handleItemAction(action, itemId, itemType);
    }
    cleanup();
  });

  menu.addEventListener('keydown', (e) => {
  const items = Array.from(menu.querySelectorAll('li'));
  const currentIndex = items.indexOf(document.activeElement);

  if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = items[(currentIndex + 1) % items.length];
      next.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = items[(currentIndex - 1 + items.length) % items.length];
      prev.focus();
    } else if (e.key === 'Escape') {
      menu.remove();
    } else if (e.key === 'Enter') {
      const action = document.activeElement.dataset.action;
      if (action) handleItemAction(action, itemId, itemType);
      menu.remove();
    }
  });
  if (keyboard) {
    setTimeout(() => {
      const firstItem = menu.querySelector('li');
      firstItem?.focus();
    }, 0);
  }
}

const renderFolderTree = (nodes, excludeId) => {
  const ul = document.createElement('ul');
  ul.className = 'folder-tree';

  nodes.forEach(node => {
    const li = document.createElement('li');
    li.className = 'folder-node';
    if (node.id == excludeId) {
      li.classList.add('excluded-folder');
    }
    li.addEventListener('mouseover', (e) => e.stopPropagation());

    // Folder label
    const label = document.createElement('span');
    label.textContent = node.name === 'Root' ? 'Home' : node.name;
    label.className = 'folder-label';
    label.dataset.id = node.id;
    label.onclick = () => {
      document.querySelectorAll('span.selected').forEach(el => el.classList.remove('selected'));
      label.classList.add('selected');
    };

    li.appendChild(label);

    // Expand/collapse toggle
    if (node.children?.length) {
      const childList = renderFolderTree(node.children, excludeId);
      childList.classList.add('collapsed');

      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.textContent = '▶';
      toggle.className = 'toggle-btn';
      toggle.onclick = () => {
        const isCollapsed = childList.classList.toggle('collapsed');
        toggle.textContent = isCollapsed ? '▶' : '▼';
      
        updateVisibleLeafClasses(ul);
      };

      li.insertBefore(toggle, label);
      li.appendChild(childList);
    }

    ul.appendChild(li);
  });

  return ul;
};

const buildFolderTree = (folders) => {
  const map = new Map();
  folders.forEach(f => map.set(f.id, { ...f, children: [] }));

  const tree = [];
  folders.forEach(f => {
    if (f.parentId && map.has(f.parentId)) {
      map.get(f.parentId).children.push(map.get(f.id));
    } else {
      tree.push(map.get(f.id));
    }
  });

  return tree;
};

const refreshUserFolders = async () => {
  const res = await fetch('/folders/tree');
  const folders = await res.json();
  const folderTree = buildFolderTree(folders);

  window.folderTree = folderTree;
}

const updateVisibleLeafClasses = root => {
    root.querySelectorAll('.folder-node').forEach(node => {
    const childList = node.querySelector('.folder-tree');
    const isCollapsed = childList?.classList.contains('collapsed');
    const hasChildren = !!childList;

    node.classList.remove('visible-leaf');

    if (!hasChildren || isCollapsed) {
      node.classList.add('visible-leaf');
    }
  });
}

const showMoveDropdown = async (itemId, itemType, anchorEl) => {
  await refreshUserFolders();

  const wrapper = document.createElement('div');
  wrapper.className = 'move-ui';

  // Position relative to anchor element
  const rect = anchorEl.getBoundingClientRect();
  const dropdownHeight = 300;
  const dropdownWidth = 250;

  let top = rect.bottom + window.scrollY;
  let left = rect.left + window.scrollX;

  if (top + dropdownHeight > window.innerHeight + window.scrollY) {
    top = window.innerHeight + window.scrollY - dropdownHeight - 10;
  }
  if (left + dropdownWidth > window.innerWidth + window.scrollX) {
    left = window.innerWidth + window.scrollX - dropdownWidth - 10;
  }

  Object.assign(wrapper.style, {
    position: 'absolute',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: '1000'
  });

  // Pass excludeId down so the folder tree marks it
  const dropdown = renderFolderTree(window.folderTree, itemId);
  updateVisibleLeafClasses(dropdown);

  const btnContainer = document.createElement('div');
  btnContainer.className = 'btncontainer';

  const confirmBtn = document.createElement('button');
  confirmBtn.textContent = 'Move';
  confirmBtn.onclick = () => {
    const selected = dropdown.querySelector('.folder-label.selected');
    if (!selected) {
      alert('Select a destination folder');
      return;
    }
    triggerMove(itemId, itemType, selected.dataset.id);
    wrapper.remove();
  };

  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.onclick = () => wrapper.remove();

  btnContainer.append(confirmBtn, cancelBtn);
  wrapper.append(dropdown, btnContainer);
  document.body.appendChild(wrapper);

  // Auto-remove on outside click
  setTimeout(() => {
    document.addEventListener('click', e => {
      if (!wrapper.contains(e.target)) wrapper.remove();
    }, { once: true });
  });
};

document.addEventListener('click', (e) => {
  const kebab = e.target.closest('.kebab-menu');
  if (kebab) {
    e.stopPropagation();
    const itemId = kebab.dataset.id;
    const itemType = kebab.dataset.type;
    showContextMenu(kebab, itemId, itemType);
  }
});

document.addEventListener('keydown', (e) => {
  const kebab = e.target.closest('.kebab-menu');
  if (kebab && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    const itemId = kebab.dataset.id;
    const itemType = kebab.dataset.type;
    showContextMenu(kebab, itemId, itemType, true); // pass `keyboard=true`
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideUploadForm();
    cancelMove();
  }
});