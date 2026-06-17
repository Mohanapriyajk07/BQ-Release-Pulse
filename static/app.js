document.addEventListener('DOMContentLoaded', () => {
  // Application State
  let releaseNotes = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let selectedNote = null;

  // DOM Elements
  const btnRefresh = document.getElementById('btn-refresh');
  const searchInput = document.getElementById('search-input');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const feedContainer = document.getElementById('feed-container');
  const txtLastUpdated = document.getElementById('txt-last-updated');
  const txtCountBadge = document.getElementById('txt-count-badge');
  const statusDot = document.getElementById('status-dot');
  const btnExport = document.getElementById('btn-export');
  const themeToggle = document.getElementById('theme-toggle');

  // Tweet Modal DOM Elements
  const tweetModalOverlay = document.getElementById('tweet-modal-overlay');
  const tweetTextarea = document.getElementById('tweet-textarea');
  const charCounter = document.getElementById('char-counter');
  const btnTweetCancel = document.getElementById('btn-tweet-cancel');
  const btnTweetSend = document.getElementById('btn-tweet-send');
  const modalClose = document.getElementById('modal-close');

  // Load Initial Theme from localStorage
  const savedTheme = localStorage.getItem('theme') || 'dark';
  if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.checked = true;
  } else {
    document.body.classList.remove('light-mode');
    themeToggle.checked = false;
  }

  // Theme Toggle Event Listener
  themeToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  });

  // Export CSV Click Handler
  btnExport.addEventListener('click', exportToCSV);

  // Load Initial Data
  fetchReleaseNotes();

  // Event Listeners
  btnRefresh.addEventListener('click', () => {
    fetchReleaseNotes(true);
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderFeed();
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.type;
      renderFeed();
    });
  });

  // Modal Cancel/Close Events
  btnTweetCancel.addEventListener('click', closeTweetModal);
  modalClose.addEventListener('click', closeTweetModal);
  tweetModalOverlay.addEventListener('click', (e) => {
    if (e.target === tweetModalOverlay) {
      closeTweetModal();
    }
  });

  tweetTextarea.addEventListener('input', updateCharCount);

  btnTweetSend.addEventListener('click', sendTweet);

  // Fetch Release Notes from API
  async function fetchReleaseNotes(isRefresh = false) {
    if (isRefresh) {
      btnRefresh.classList.add('loading');
      btnRefresh.disabled = true;
    }

    try {
      const response = await fetch('/api/releases');
      const data = await response.json();

      if (data.success) {
        releaseNotes = data.entries;
        
        // Update Meta Info
        const lastUpdatedDate = data.updated ? new Date(data.updated) : new Date();
        txtLastUpdated.textContent = `Last updated: ${lastUpdatedDate.toLocaleDateString()} ${lastUpdatedDate.toLocaleTimeString()}`;
        txtCountBadge.textContent = `${releaseNotes.length} updates`;
        txtCountBadge.style.display = 'inline-block';
        
        statusDot.style.backgroundColor = 'var(--feature-color)';
        statusDot.style.boxShadow = '0 0 10px var(--feature-color)';
      } else {
        showErrorState(`Server Error: ${data.error || 'Failed to fetch release notes'}`);
        statusDot.style.backgroundColor = 'var(--issue-color)';
        statusDot.style.boxShadow = '0 0 10px var(--issue-color)';
      }
    } catch (err) {
      showErrorState(`Network Error: ${err.message}`);
      statusDot.style.backgroundColor = 'var(--issue-color)';
      statusDot.style.boxShadow = '0 0 10px var(--issue-color)';
    } finally {
      if (isRefresh) {
        setTimeout(() => {
          btnRefresh.classList.remove('loading');
          btnRefresh.disabled = false;
        }, 600);
      }
      renderFeed();
    }
  }

  // Render notes feed based on filter & search
  function renderFeed() {
    feedContainer.innerHTML = '';

    const filteredNotes = releaseNotes.filter(note => {
      const matchesFilter = currentFilter === 'all' || note.type.toLowerCase() === currentFilter.toLowerCase();
      const matchesSearch = 
        note.date.toLowerCase().includes(searchQuery) ||
        note.type.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });

    if (filteredNotes.length === 0) {
      showEmptyState();
      return;
    }

    filteredNotes.forEach((note, index) => {
      const card = createNoteCard(note, index);
      feedContainer.appendChild(card);
    });
  }

  // Create Card Element
  function createNoteCard(note, index) {
    const card = document.createElement('article');
    
    // Set appropriate classes
    const typeClass = `type-${note.type.toLowerCase().replace(' ', '-')}`;
    card.className = `note-card ${typeClass}`;
    card.style.animationDelay = `${index * 0.05}s`;
    card.id = `note-card-${note.id.replace(/[^a-zA-Z0-9-]/g, '_')}`;

    // Header Content
    const header = document.createElement('div');
    header.className = 'card-header';

    const date = document.createElement('span');
    date.className = 'card-date';
    date.textContent = note.date;

    const badge = document.createElement('span');
    badge.className = `badge badge-${note.type.toLowerCase().replace(' ', '-')}`;
    badge.textContent = note.type;

    header.appendChild(date);
    header.appendChild(badge);

    // Body Content
    const content = document.createElement('div');
    content.className = 'card-content';
    content.innerHTML = note.content;

    // Actions
    const actions = document.createElement('div');
    actions.className = 'card-actions';

    // Copy Button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'action-btn copy-btn';
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="width: 14px; height: 14px; fill: currentColor;">
        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
      </svg>
      <span>Copy</span>
    `;
    copyBtn.addEventListener('click', () => copyToClipboard(note, copyBtn));

    // Tweet Button
    const tweetBtn = document.createElement('button');
    tweetBtn.className = 'action-btn tweet-btn';
    tweetBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.48.75 2.78 1.9 3.54-.7 0-1.36-.21-1.94-.53v.05c0 2.07 1.47 3.8 3.43 4.19-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.54 1.7 2.12 2.93 4 2.97-1.47 1.15-3.32 1.83-5.32 1.83-.35 0-.69-.02-1.03-.06 1.9 1.22 4.17 1.93 6.61 1.93 7.93 0 12.27-6.57 12.27-12.27 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
      </svg>
      <span>Tweet</span>
    `;
    tweetBtn.addEventListener('click', () => openTweetModal(note));

    // Link Button
    const linkBtn = document.createElement('a');
    linkBtn.className = 'action-btn';
    linkBtn.href = note.link || 'https://cloud.google.com/bigquery/docs/release-notes';
    linkBtn.target = '_blank';
    linkBtn.rel = 'noopener noreferrer';
    linkBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
      </svg>
      <span>View Doc</span>
    `;

    actions.appendChild(linkBtn);
    actions.appendChild(copyBtn);
    actions.appendChild(tweetBtn);

    card.appendChild(header);
    card.appendChild(content);
    card.appendChild(actions);

    return card;
  }

  // Show Empty State
  function showEmptyState() {
    feedContainer.innerHTML = `
      <div class="state-box" id="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <h3 class="state-title">No Updates Found</h3>
        <p class="state-description">Try adjusting your filters or searching for something else.</p>
      </div>
    `;
  }

  // Show Error State
  function showErrorState(errorMsg) {
    feedContainer.innerHTML = `
      <div class="state-box" id="error-state">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style="fill: var(--issue-color);">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <h3 class="state-title" style="color: var(--issue-color);">Failed to Load Notes</h3>
        <p class="state-description">${errorMsg}</p>
        <button class="btn-refresh" style="margin: 1.5rem auto 0;" id="btn-reload-page">Reload Page</button>
      </div>
    `;
    document.getElementById('btn-reload-page').addEventListener('click', () => {
      fetchReleaseNotes();
    });
  }

  // Open Tweet Modal
  function openTweetModal(note) {
    selectedNote = note;
    
    // Extract plain text from note content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Format default tweet
    const cleanedText = textContent.replace(/\s+/g, ' ').trim();
    // Leave space for prefix and link
    const maxTextLen = 280 - `BigQuery ${note.type} [${note.date}]:\n""\n\nRead more: ${note.link || 'https://cloud.google.com/bigquery/docs/release-notes'}`.length;
    
    let truncatedText = cleanedText;
    if (cleanedText.length > maxTextLen) {
      truncatedText = cleanedText.substring(0, maxTextLen - 3) + '...';
    }
    
    const tweetText = `BigQuery ${note.type} [${note.date}]:\n"${truncatedText}"\n\nRead more: ${note.link || 'https://cloud.google.com/bigquery/docs/release-notes'}`;
    
    tweetTextarea.value = tweetText;
    updateCharCount();
    
    tweetModalOverlay.classList.add('active');
    tweetTextarea.focus();
  }

  // Close Tweet Modal
  function closeTweetModal() {
    tweetModalOverlay.classList.remove('active');
    selectedNote = null;
  }

  // Update Character Counter
  function updateCharCount() {
    const len = tweetTextarea.value.length;
    const remaining = 280 - len;
    charCounter.textContent = remaining;
    
    charCounter.className = 'char-counter';
    if (remaining <= 30 && remaining > 0) {
      charCounter.classList.add('warning');
    } else if (remaining <= 0) {
      charCounter.classList.add('danger');
    }
  }

  // Trigger Twitter Share
  function sendTweet() {
    const text = encodeURIComponent(tweetTextarea.value);
    const tweetUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(tweetUrl, '_blank', 'noopener,noreferrer');
    closeTweetModal();
  }

  // Copy Release Note Details to Clipboard
  async function copyToClipboard(note, btn) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    const cleanedText = textContent.replace(/\s+/g, ' ').trim();
    
    const copyText = `BigQuery ${note.type} [${note.date}]:\n"${cleanedText}"\n\nRead more: ${note.link || 'https://cloud.google.com/bigquery/docs/release-notes'}`;

    try {
      await navigator.clipboard.writeText(copyText);
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14" fill="#10b981" style="margin-right: 4px;">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span style="color: #10b981; font-weight: 600;">Copied!</span>
      `;
      btn.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.borderColor = '';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  }

  // Export currently filtered notes to CSV file
  function exportToCSV() {
    const filteredNotes = releaseNotes.filter(note => {
      const matchesFilter = currentFilter === 'all' || note.type.toLowerCase() === currentFilter.toLowerCase();
      const matchesSearch = 
        note.date.toLowerCase().includes(searchQuery) ||
        note.type.toLowerCase().includes(searchQuery) ||
        note.content.toLowerCase().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });

    if (filteredNotes.length === 0) {
      alert("No notes available to export with current filters!");
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Link', 'Content'];
    const rows = filteredNotes.map(note => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = note.content;
      const plainContent = (tempDiv.textContent || tempDiv.innerText || '').replace(/"/g, '""').replace(/\s+/g, ' ').trim();
      return [
        `"${note.id}"`,
        `"${note.date}"`,
        `"${note.type}"`,
        `"${note.link}"`,
        `"${plainContent}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const dateStr = new Date().toISOString().slice(0, 10);
    const filterStr = currentFilter !== 'all' ? `_${currentFilter.toLowerCase()}` : '';
    const searchStr = searchQuery ? `_search_${searchQuery.replace(/[^a-z0-9]/gi, '_').toLowerCase()}` : '';
    
    link.setAttribute('href', url);
    link.setAttribute('download', `bigquery_releases_${dateStr}${filterStr}${searchStr}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});
