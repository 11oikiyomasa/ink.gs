
(() => {
  'use strict';

  const storageKey = 'reading-room-demo-v1';
  const defaultStoryFields = {
    author: 'Site Editor',
    publication: 'The Open Notebook',
    topic: 'Writing',
    photo: '/assets/writing-garden.jpg',
    photoAlt: 'A quiet scene for reading',
    published: true
  };
  function readStorageValue(key) {
    try {
      return localStorage.getItem(key) || '';
    } catch {
      return '';
    }
  }

  const configuredApiBase = (document.documentElement.dataset.apiBase || readStorageValue('reading-room-api-base') || '').replace(/\/+$/, '');
  const productionHostnames = new Set(['andregsman.eu.org', 'www.andregsman.eu.org']);
  const isWorkerHost = /\.workers\.dev$/iu.test(location.hostname) || productionHostnames.has(location.hostname);
  const API_BASE = isWorkerHost ? location.origin : configuredApiBase;
  const API_ENABLED = isWorkerHost || Boolean(configuredApiBase);
  let stories = [...document.querySelectorAll('.story')].map((element, index) => {
    const title = element.querySelector('h2')?.textContent?.trim() || ('Story ' + (index + 1));
    const id = element.dataset.storyId || slugify(title);
    element.dataset.storyId = id;
    return element;
  });

  const toast = document.querySelector('.toast');
  const search = document.querySelector('#search');
  const searchBox = document.querySelector('.search-box');
  const searchToggle = document.querySelector('#search-toggle');
  const searchClear = document.querySelector('#search-clear');
  const emptyState = document.querySelector('#empty-state');
  const feedView = document.querySelector('#feed-view');
  const statsView = document.querySelector('#stats-view');
  const reader = document.querySelector('#reader');
  const readerLabel = document.querySelector('#reader-label');
  const readerScroll = document.querySelector('#reader-scroll');
  const readerKicker = document.querySelector('#reader-kicker');
  const readerPublication = document.querySelector('#reader-publication');
  const readerFollowPublication = document.querySelector('#reader-follow-publication');
  const readerTopics = document.querySelector('#reader-topics');
  const readerTitle = document.querySelector('#reader-title');
  const readerByline = document.querySelector('#reader-byline');
  const readerSummary = document.querySelector('#reader-summary');
  const readerMeta = document.querySelector('#reader-meta');
  const readerTopic = document.querySelector('#reader-topic');
  const readerAuthorAvatar = document.querySelector('#reader-author-avatar');
  const readerAuthorName = document.querySelector('#reader-author-name');
  const readerImage = document.querySelector('#reader-image');
  const readerBody = document.querySelector('#reader-body');
  const readerProgress = document.querySelector('.reader-progress');
  const readerProgressFill = document.querySelector('.reader-progress span');
  const writeButton = document.querySelector('#write-button');
  const syncButton = document.querySelector('#sync-button');
  const loadMoreStoriesButton = document.querySelector('#load-more-stories');
  const loadMoreOnlineStoriesButton = document.querySelector('#load-more-online-stories');
  const composer = document.querySelector('#composer');
  const draftTitle = document.querySelector('#draft-title');
  const draftBody = document.querySelector('#draft-body');
  const draftStatus = document.querySelector('#draft-status');
  const previewToggle = document.querySelector('#preview-toggle');
  const previewTitle = document.querySelector('#draft-preview-title');
  const previewBody = document.querySelector('#draft-preview-body');
  const draftLibrary = document.querySelector('#draft-library');
  const draftLibraryToggle = document.querySelector('#draft-library-toggle');
  const draftCount = document.querySelector('#draft-count');
  const draftList = document.querySelector('#draft-list');
  const newDraftButton = document.querySelector('#new-draft');
  const editorLoginButton = document.querySelector('#editor-login-button');
  const editorLoginDialog = document.querySelector('#editor-login-dialog');
  const editorLoginForm = document.querySelector('#editor-login-form');
  const editorPassword = document.querySelector('#editor-password');
  const editorLoginError = document.querySelector('#editor-login-error');
  const onlineLibraryToggle = document.querySelector('#online-library-toggle');
  const onlineLibrary = document.querySelector('#online-library');
  const onlineStoryList = document.querySelector('#online-story-list');
  const onlineStoryCount = document.querySelector('#online-story-count');
  const publishOnlineButton = document.querySelector('#publish-online');
  const saveDraftButton = document.querySelector('#save-draft');
  const storyAuthor = document.querySelector('#story-author');
  const storyPublication = document.querySelector('#story-publication');
  const storyTopic = document.querySelector('#story-topic');
  const storyPhoto = document.querySelector('#story-photo');
  const storyPhotoAlt = document.querySelector('#story-photo-alt');
  const storyPublished = document.querySelector('#story-published');
  const manageStoriesButton = document.querySelector('#manage-stories-button');
  const editorSettingsButton = document.querySelector('#editor-settings-button');
  const editorSettingsDialog = document.querySelector('#editor-settings-dialog');
  const editorSettingsClose = document.querySelector('#editor-settings-close');
  const editorSettingsCancel = document.querySelector('#editor-settings-cancel');
  const editorPasswordForm = document.querySelector('#editor-password-form');
  const editorCurrentPassword = document.querySelector('#editor-current-password');
  const editorNewPassword = document.querySelector('#editor-new-password');
  const editorConfirmPassword = document.querySelector('#editor-confirm-password');
  const editorPasswordError = document.querySelector('#editor-password-error');
  const editorPasswordSubmit = document.querySelector('#editor-password-submit');
  const editorLoginDialogClose = document.querySelector('#close-editor-login');
  const composerClose = document.querySelector('#close-composer');
  const readerClose = document.querySelector('#reader-close');
  const readerBookmark = document.querySelector('#reader-bookmark');
  const readerFollow = document.querySelector('#reader-follow');
  const readerShare = document.querySelector('#reader-share');
  const readerListen = document.querySelector('#reader-listen');
  const readerMore = document.querySelector('#reader-more');
  const readerMoreMenu = document.querySelector('#reader-more-menu');
  const readerCopyLink = document.querySelector('#reader-copy-link');
  const readerCopyTitle = document.querySelector('#reader-copy-title');
  const readerOpenNew = document.querySelector('#reader-open-new');
  const readerRead = document.querySelector('#reader-read');
  const statsSaved = document.querySelector('#stats-saved');
  const statsFinished = document.querySelector('#stats-finished');
  const statsInProgress = document.querySelector('#stats-in-progress');
  const statsMinutes = document.querySelector('#stats-minutes');
  const feedStatus = document.querySelector('#feed-status');
  const profileDialog = document.querySelector('#profile-dialog');
  const profileForm = document.querySelector('#profile-form');
  const profileName = document.querySelector('#profile-name');
  const profileBio = document.querySelector('#profile-bio');
  const profileCancel = document.querySelector('#profile-cancel');
  const profileFollowingCount = document.querySelector('#profile-following-count');
  const profileSavedCount = document.querySelector('#profile-saved-count');
  const profileFinishedCount = document.querySelector('#profile-finished-count');
  const profileAvatar = document.querySelector('.avatar');
  const railFollowing = document.querySelector('#rail-following');
  const writersDialog = document.querySelector('#writers-dialog');
  const writersClose = document.querySelector('#writers-close');
  const writerSearch = document.querySelector('#writer-search');
  const writerList = document.querySelector('#writer-list');
  const gamesDialog = document.querySelector('#games-dialog');
  const gamesClose = document.querySelector('#games-close');
  const gameRound = document.querySelector('#game-round');
  const gameTotal = document.querySelector('#game-total');
  const gameScore = document.querySelector('#game-score');
  const gamePrompt = document.querySelector('#game-prompt');
  const gameOptions = document.querySelector('#game-options');
  const gameFeedback = document.querySelector('#game-feedback');
  const gameRestart = document.querySelector('#game-restart');
  const readerSocial = document.querySelector('#reader-social');
  const readerResponseCount = document.querySelector('#reader-response-count');
  const readerResponseForm = document.querySelector('#reader-response-form');
  const readerResponseInput = document.querySelector('#reader-response-input');
  const readerResponseList = document.querySelector('#reader-response-list');
  const readerApplaud = document.querySelector('#reader-applaud');
  const readerApplaudCount = document.querySelector('#reader-applaud-count');
  const readerRespond = document.querySelector('#reader-respond');
  const readerResponseStatCount = document.querySelector('#reader-response-stat-count');
  const readerRepost = document.querySelector('#reader-repost');
  const readerRepostCount = document.querySelector('#reader-repost-count');
  const readerRespondCancel = document.querySelector('#reader-respond-cancel');
  const dynamicStoryRecords = new Map();

  let state = loadState();
  let currentStory = null;
  let toastTimer = null;
  let progressSaveTimer = null;
  let readerSpeech = null;
  let editorAuthenticated = false;
  let editorCsrfToken = '';
  let editorStories = [];
  let editingOnlineStoryId = null;
  let publicStoryCursor = null;
  let publicStoryLoading = false;
  let editorStoryCursor = null;
  let editorStoryLoading = false;

  function slugify(value) {
    return value.toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 90);
  }

  function loadState() {
    const fallback = {
      bookmarks: [],
      following: [],
      progress: {},
      drafts: [],
      activeDraftId: null,
      membershipChanges: { bookmarks: {}, following: {}, publications: {} },
      followingPublications: [],
      progressUpdatedAt: {},
      draftTombstones: {},
      profile: { name: '', bio: '' }
    };
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
      return {
        ...fallback,
        ...saved,
        bookmarks: Array.isArray(saved.bookmarks) ? saved.bookmarks : [],
        following: Array.isArray(saved.following) ? saved.following : [],
        progress: saved.progress && typeof saved.progress === 'object' ? saved.progress : {},
        drafts: Array.isArray(saved.drafts) ? saved.drafts.filter(isRecord).map(normalizeDraft) : [],
        activeDraftId: typeof saved.activeDraftId === 'string' ? saved.activeDraftId : null,
        membershipChanges: {
          bookmarks: isRecord(saved.membershipChanges?.bookmarks) ? saved.membershipChanges.bookmarks : {},
          following: isRecord(saved.membershipChanges?.following) ? saved.membershipChanges.following : {},
          publications: isRecord(saved.membershipChanges?.publications) ? saved.membershipChanges.publications : {}
        },
        followingPublications: Array.isArray(saved.followingPublications)
          ? saved.followingPublications.filter(value => typeof value === 'string').slice(0, 100)
          : [],
        progressUpdatedAt: isRecord(saved.progressUpdatedAt) ? saved.progressUpdatedAt : {},
        draftTombstones: isRecord(saved.draftTombstones) ? saved.draftTombstones : {},
        profile: {
          name: typeof saved.profile?.name === 'string' ? saved.profile.name.slice(0, 60) : '',
          bio: typeof saved.profile?.bio === 'string' ? saved.profile.bio.slice(0, 240) : ''
        }
      };
    } catch {
      return fallback;
    }
  }

  function isRecord(value) {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
  }

  function normalizeDraft(draft, index) {
    const source = isRecord(draft) ? draft : {};
    const allowedTopics = ['Creativity', 'Technology', 'Travel', 'Life', 'Health', 'Culture', 'Writing', 'Mindfulness', 'Other'];
    const allowedPhotos = [
      '/assets/city-scenes.jpg',
      '/assets/forest-wellness.jpg',
      '/assets/notebook.jpg',
      '/assets/river-sunset.jpg',
      '/assets/train-journal.jpeg',
      '/assets/writing-garden.jpg'
    ];
    return {
      id: typeof source.id === 'string' && source.id ? source.id : 'draft-' + Date.now() + '-' + index,
      title: typeof source.title === 'string' ? source.title.slice(0, 120) : '',
      body: typeof source.body === 'string' ? source.body.slice(0, 120000) : '',
      savedAt: typeof source.savedAt === 'string' ? source.savedAt : null,
      author: typeof source.author === 'string' ? source.author.slice(0, 80) : defaultStoryFields.author,
      publication: typeof source.publication === 'string' ? source.publication.slice(0, 80) : defaultStoryFields.publication,
      topic: allowedTopics.includes(source.topic) ? source.topic : defaultStoryFields.topic,
      photo: allowedPhotos.includes(source.photo) ? source.photo : defaultStoryFields.photo,
      photoAlt: typeof source.photoAlt === 'string' ? source.photoAlt.slice(0, 180) : defaultStoryFields.photoAlt,
      published: typeof source.published === 'boolean' ? source.published : defaultStoryFields.published
    };
  }

  function persistState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
      return true;
    } catch {
      return false;
    }
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function recordMembershipChange(collection, id, present) {
    if (!state.membershipChanges) state.membershipChanges = { bookmarks: {}, following: {}, publications: {} };
    if (!state.membershipChanges[collection]) state.membershipChanges[collection] = {};
    state.membershipChanges[collection][id] = { present, at: new Date().toISOString() };
  }

  function recordProgressChange(id) {
    state.progressUpdatedAt[id] = new Date().toISOString();
  }

  function refreshStoriesCollection() {
    stories = [...document.querySelectorAll('.story')];
  }

  function storyData(element) {
    if (!element) return null;
    const id = element.dataset.storyId;
    const remote = dynamicStoryRecords.get(id);
    if (remote) return remote;
    const title = element.querySelector('h2')?.textContent?.trim() || '';
    const byline = element.querySelector('.byline')?.textContent?.trim() || '';
    const author = element.dataset.author || byline.split(' in ')[0] || 'Unknown author';
    const publication = byline.includes(' in ') ? byline.split(' in ').slice(1).join(' in ').trim() : '';
    const summary = element.querySelector('.story-summary')?.textContent?.trim() || '';
    const meta = [...element.querySelectorAll('.story-meta .engagement-item')].map(node => node.textContent.trim());
    const readTime = (meta.find(text => /min read$/i.test(text)) || '').match(/(\d+)/)?.[1];
    const topic = element.querySelector('.topic-pill')?.textContent?.trim() || '';
    const topics = [...new Set((element.dataset.topics || topic).split(/\s+/u).map(value => value.trim()).filter(Boolean))];
    const photo = element.querySelector('.story-image')?.getAttribute('src') || '';
    const photoAlt = element.querySelector('.story-image')?.getAttribute('alt') || '';
    let body = [summary || 'This story is available in the online reading room.'];
    if (element.dataset.body) {
      try {
        const parsedBody = JSON.parse(element.dataset.body);
        if (Array.isArray(parsedBody) && parsedBody.length) body = parsedBody;
      } catch {}
    }
    return {
      id, title, author, publication, summary, topic, topics, photo, photoAlt,
      publishedAt: element.dataset.publishedAt || '',
      body,
      readMinutes: Math.max(1, Number(readTime || 0), Math.ceil(summary.split(/\s+/u).filter(Boolean).length / 220)),
      applauseCount: 0,
      repostCount: 0,
      responseCount: 0
    };
  }

  function allStoryData() {
    return stories.map(storyData).filter(Boolean);
  }

  function findStory(id) {
    return allStoryData().find(story => story.id === id) || null;
  }

  function presentationPhoto(photo, topic) {
    if (!photo) return '';
    return photo;
  }



  function formatPublishedDate(value) {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
  }

  function formatCount(value) {
    const count = Number(value || 0);
    if (count < 1000) return String(count);
    if (count < 1000000) return (count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/u, '') + 'K';
    return (count / 1000000).toFixed(1).replace(/\.0$/u, '') + 'M';
  }

  function iconSvg(name) {
    const paths = {
      clap: '<path d="M9 12.6 5.8 9.4a1.9 1.9 0 0 0-2.7 2.7l5.6 5.6a4.7 4.7 0 0 0 6.6 0l2.1-2.1a4.8 4.8 0 0 0 .8-5.7l-1.8-3.1"/><path d="m8 10.6 2.2-2.2a2 2 0 0 1 2.8 0l2.9 2.9"/><path d="m6.6 8.4 1.5-1.5a1.8 1.8 0 0 1 2.6 0l4.1 4.1"/><path d="m11.2 6.5 1-1a1.8 1.8 0 0 1 2.6 0l3.4 3.4"/>',
      comment: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.8 3.5.8-3.5H6.5A2.5 2.5 0 0 1 4 12.5z"/>',
      repost: '<path d="m7 7 3-3 3 3"/><path d="M10 4v9a4 4 0 0 0 4 4h4"/><path d="m17 14 3 3-3 3"/>'
    };
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 24 24');
    svg.setAttribute('aria-hidden','true');
    svg.setAttribute('focusable','false');
    svg.innerHTML = paths[name] || paths.comment;
    return svg;
  }

  function createStoryElement(story) {
    const article = document.createElement('article');
    article.className = 'story';
    article.dataset.author = story.author || 'Unknown author';
    article.dataset.publishedAt = story.publishedAt || story.published_at || '';
    article.dataset.topics = [story.topic, ...(story.topics || [])].filter(Boolean).join(' ');
    article.dataset.storyId = story.id;
    article.dataset.verified = story.verified ? 'true' : 'false';
    const copy = document.createElement('div');
    copy.className = 'story-copy';
    const byline = document.createElement('div');
    byline.className = 'byline';
    const avatar = document.createElement('span');
    avatar.className = 'mini-avatar';
    avatar.textContent = String(story.author || 'U').split(/\s+/u).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const bylineText = document.createElement('span');
    const authorLine = document.createElement('span');
    authorLine.className = 'byline-main';
    const authorStrong = document.createElement('strong');
    authorStrong.textContent = story.author || 'Unknown author';
    authorLine.append(authorStrong);
    if (story.verified) {
      const verified = document.createElement('span');
      verified.className = 'byline-verified';
      verified.textContent = '✓';
      verified.setAttribute('aria-label','Verified');
      authorLine.append(verified);
    }
    bylineText.append(authorLine);
    const publicationLine = document.createElement('span');
    publicationLine.className = 'byline-meta';
    const parts = [];
    if (story.publication) parts.push(story.publication);
    const published = story.publishedAt || story.published_at;
    if (published) parts.push(formatPublishedDate(published));
    publicationLine.textContent = parts.join(' · ');
    bylineText.append(publicationLine);
    byline.append(avatar, bylineText);
    const title = document.createElement('h2');
    title.className = 'story-title-button';
    title.setAttribute('role', 'button');
    title.setAttribute('tabindex', '0');
    title.setAttribute('aria-label', 'Read ' + (story.title || 'Untitled story'));
    title.textContent = story.title || 'Untitled story';
    const summary = document.createElement('p');
    summary.className = 'story-summary';
    summary.textContent = story.summary || '';
    const meta = document.createElement('div');
    meta.className = 'story-meta story-engagement';
    const engagement = document.createElement('div');
    engagement.className = 'engagement-list';
    const applause = document.createElement('button');
    applause.type = 'button';
    applause.className = 'engagement-item engagement-button';
    applause.dataset.socialAction = 'applause';
    applause.setAttribute('aria-label', 'Applause');
    const responses = document.createElement('button');
    responses.type = 'button';
    responses.className = 'engagement-item engagement-button';
    responses.dataset.socialAction = 'respond';
    responses.setAttribute('aria-label', 'Responses');
    const reposts = document.createElement('button');
    reposts.type = 'button';
    reposts.className = 'engagement-item engagement-button';
    reposts.dataset.socialAction = 'repost';
    reposts.setAttribute('aria-label', 'Reposts');
    function setMetric(node, icon, value) {
      node.replaceChildren();
      const iconNode = document.createElement('span');
      iconNode.className = 'engagement-icon';
      iconNode.append(iconSvg(icon));
      const valueNode = document.createElement('span');
      valueNode.textContent = formatCount(value);
      node.append(iconNode, valueNode);
    }
    setMetric(applause, 'clap', story.applauseCount);
    setMetric(responses, 'comment', story.responseCount);
    setMetric(reposts, 'repost', story.repostCount);
    engagement.append(applause, responses, reposts);
    const topic = document.createElement('span');
    topic.className = 'topic-pill';
    topic.hidden = true;
    topic.textContent = story.topic || 'Other';
    const tools = document.createElement('div');
    tools.className = 'story-tools';
    const bookmark = document.createElement('button');
    bookmark.className = 'bookmark';
    bookmark.type = 'button';
    bookmark.setAttribute('aria-label', 'Save ' + (story.title || 'story'));
    bookmark.setAttribute('aria-pressed', 'false');
    bookmark.textContent = '♧';
    const more = document.createElement('button');
    more.className = 'more';
    more.type = 'button';
    more.setAttribute('aria-label', 'More options');
    more.textContent = '···';
    tools.append(bookmark, more);
    meta.append(engagement, topic, tools);
    copy.append(byline, title, summary, meta);
    const image = document.createElement('img');
    image.className = 'story-image';
    image.src = presentationPhoto(story.photo, story.topic);
    image.alt = story.photoAlt || story.title || '';
    article.append(copy, image);
    return article;
  }

  function renderRemoteStories(remoteStories, { reset = false } = {}) {
    const container = document.querySelector('#stories');
    if (!container) return;
    if (reset && remoteStories.length) {
      container.replaceChildren();
      dynamicStoryRecords.clear();
      refreshStoriesCollection();
    }
    const seen = new Set([...container.querySelectorAll('.story')].map(element => element.dataset.storyId));
    for (const story of remoteStories) {
      if (!story?.id || seen.has(story.id)) continue;
      dynamicStoryRecords.set(story.id, {
        id: story.id,
        title: story.title || 'Untitled story',
        author: story.author || 'Unknown author',
        publication: story.publication || '',
        summary: story.summary || '',
        topic: story.topic || 'Other',
        topics: Array.isArray(story.topics)
          ? story.topics.filter(value => typeof value === 'string').slice(0, 8)
          : [story.topic || 'Other'],
        photo: story.photo || '',
        photoAlt: story.photoAlt || story.photo_alt || '',
        publishedAt: story.publishedAt || story.published_at || '',
        body: Array.isArray(story.body) ? story.body : String(story.body || '').split(/\n\s*\n/u).filter(Boolean),
        readMinutes: Number(story.readMinutes || 1),
        applauseCount: Number(story.applauseCount || 0),
        repostCount: Number(story.repostCount || 0),
        responseCount: Number(story.responseCount || 0)
      });
      container.append(createStoryElement(dynamicStoryRecords.get(story.id)));
      seen.add(story.id);
    }
    refreshStoriesCollection();
    wireStorySocialControls();
    installImageFallbacks();
    refreshBookmarkButtons();
    renderCurrentView();
  }

  function updatePublicLoadMoreState() {
    if (!loadMoreStoriesButton) return;
    loadMoreStoriesButton.hidden = !publicStoryCursor;
    loadMoreStoriesButton.disabled = publicStoryLoading;
    loadMoreStoriesButton.textContent = publicStoryLoading ? 'Loading…' : 'Load more stories';
  }

  async function loadPublicStories({ append = false } = {}) {
    if (!API_ENABLED) {
      publicStoryCursor = null;
      updatePublicLoadMoreState();
      if (feedStatus) {
        feedStatus.hidden = false;
        feedStatus.textContent = 'Online publishing is available on the Worker app.';
      }
      return false;
    }
    if (publicStoryLoading) return false;
    if (append && !publicStoryCursor) return true;
    publicStoryLoading = true;
    updatePublicLoadMoreState();
    try {
      const params = new URLSearchParams({ limit: '24' });
      if (append && publicStoryCursor) params.set('cursor', publicStoryCursor);
      const data = await apiRequest('/api/stories?' + params.toString(), { method: 'GET', headers: {} });
      const remoteStories = Array.isArray(data.stories) ? data.stories : [];
      renderRemoteStories(remoteStories, { reset: !append });
      publicStoryCursor = data.nextCursor || null;
      updatePublicLoadMoreState();
      if (feedStatus) {
        feedStatus.hidden = false;
        const loaded = stories.filter(element => dynamicStoryRecords.has(element.dataset.storyId)).length;
        feedStatus.textContent = remoteStories.length
          ? loaded + (publicStoryCursor ? '+ published online stories loaded.' : ' published online stories loaded.')
          : (append ? 'No more published stories.' : 'No published stories yet.');
      }
      return true;
    } catch (error) {
      if (!append && feedStatus) {
        feedStatus.hidden = false;
        feedStatus.textContent = 'Online stories are temporarily unavailable. Try again shortly.';
      }
      return false;
    } finally {
      publicStoryLoading = false;
      updatePublicLoadMoreState();
    }
  }

  function openProfile() {
    if (!profileDialog) return;
    if (profileName) profileName.value = state.profile?.name || '';
    if (profileBio) profileBio.value = state.profile?.bio || '';
    updateProfileSummary();
    if (typeof profileDialog.showModal === 'function') profileDialog.showModal();
    else profileDialog.setAttribute('open', '');
  }

  function renderFollowingRail() {
    if (!railFollowing) return;
    const fragment = document.createDocumentFragment();
    const followed = [...new Set(state.following)].sort((a, b) => a.localeCompare(b));
    if (!followed.length) {
      const empty = document.createElement('span');
      empty.className = 'follow-empty';
      empty.textContent = 'No followed writers yet.';
      fragment.append(empty);
    } else {
      followed.slice(0, 5).forEach(author => {
        const row = document.createElement('div');
        row.className = 'follow-row';
        const avatar = document.createElement('span');
        avatar.className = 'follow-avatar';
        avatar.textContent = author.split(/\s+/u).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'U';
        const name = document.createElement('span');
        name.textContent = author;
        const dot = document.createElement('span');
        dot.className = 'follow-dot';
        dot.setAttribute('aria-hidden', 'true');
        row.append(avatar, name, dot);
        fragment.append(row);
      });
      if (followed.length > 5) {
        const more = document.createElement('span');
        more.className = 'follow-empty';
        more.textContent = '+' + (followed.length - 5) + ' more';
        fragment.append(more);
      }
    }
    railFollowing.replaceChildren(fragment);
  }

  function updateProfileSummary() {
    renderFollowingRail();
    if (profileFollowingCount) profileFollowingCount.textContent = String(state.following.length);
    if (profileSavedCount) profileSavedCount.textContent = String(state.bookmarks.length);
    if (profileFinishedCount) profileFinishedCount.textContent = String(allStoryData().filter(story => state.progress[story.id]?.finished).length);
    if (profileAvatar) {
      const initials = (state.profile?.name || 'Reader').trim().split(/\s+/u).map(part => part[0]).join('').slice(0, 2).toUpperCase();
      profileAvatar.textContent = initials || 'R';
      profileAvatar.setAttribute('aria-label', state.profile?.name ? 'Reader profile: ' + state.profile.name : 'Reader profile');
    }
  }

  function renderWriterList() {
    if (!writerList) return;
    const query = (writerSearch?.value || '').trim().toLowerCase();
    const map = new Map();
    for (const story of allStoryData()) {
      if (!story.author) continue;
      const key = story.author;
      const row = map.get(key) || { author: story.author, publication: story.publication, stories: 0 };
      row.stories++;
      if (!row.publication) row.publication = story.publication;
      map.set(key, row);
    }
    const fragment = document.createDocumentFragment();
    const rows = [...map.values()].filter(row => !query || [row.author, row.publication].join(' ').toLowerCase().includes(query)).sort((a,b) => a.author.localeCompare(b.author));
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'draft-empty';
      empty.textContent = 'No writers match that search.';
      fragment.append(empty);
    }
    for (const row of rows) {
      const item = document.createElement('div');
      item.className = 'writer-row';
      const info = document.createElement('div');
      info.className = 'writer-row-info';
      const name = document.createElement('strong');
      name.textContent = row.author;
      const meta = document.createElement('span');
      meta.textContent = (row.publication || 'ink.gs') + ' · ' + row.stories + (row.stories === 1 ? ' story' : ' stories');
      info.append(name, meta);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'composer-button primary';
      button.dataset.writerAction = 'toggle';
      button.dataset.writerName = row.author;
      const following = state.following.includes(row.author);
      button.textContent = following ? 'Following' : 'Follow';
      button.setAttribute('aria-pressed', String(following));
      item.append(info, button);
      fragment.append(item);
    }
    writerList.replaceChildren(fragment);
  }

  const gameState = { round: 0, score: 0, questions: [], current: null, answered: false };
  function startGame() {
    const source = allStoryData().filter(story => story.topic);
    const pool = [...source].sort(() => Math.random() - 0.5).slice(0, 5);
    gameState.round = 0;
    gameState.score = 0;
    gameState.questions = pool;
    gameState.current = null;
    gameState.answered = false;
    updateGame();
  }

  function updateGame() {
    if (!gameRound || !gameScore || !gamePrompt || !gameOptions) return;
    const total = gameState.questions.length;
    if (gameTotal) gameTotal.textContent = String(total || 0);
    gameScore.textContent = String(gameState.score);
    if (total === 0) {
      gameRound.textContent = '0';
      gamePrompt.textContent = 'There are not enough categorized stories to start a game.';
      gameOptions.replaceChildren();
      if (gameFeedback) gameFeedback.textContent = 'Add or publish stories with a topic, then try again.';
      return;
    }
    if (gameState.round >= total) {
      gameRound.textContent = String(total);
      gamePrompt.textContent = 'Session complete. Your score is ' + gameState.score + '/' + total + '.';
      gameOptions.replaceChildren();
      if (gameFeedback) gameFeedback.textContent = 'Start over to play again.';
      return;
    }
    const story = gameState.questions[gameState.round];
    gameState.current = story;
    gameState.answered = false;
    gameRound.textContent = String(gameState.round + 1);
    gamePrompt.textContent = 'Which topic fits “' + story.title + '”?';
    const topics = [...new Set(allStoryData().map(item => item.topic).filter(Boolean))];
    const choices = [story.topic, ...topics.filter(topic => topic !== story.topic).sort(() => Math.random() - 0.5).slice(0, 3)]
      .sort(() => Math.random() - 0.5);
    const fragment = document.createDocumentFragment();
    choices.forEach(topic => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'game-option';
      button.dataset.gameTopic = topic;
      button.textContent = topic;
      fragment.append(button);
    });
    gameOptions.replaceChildren(fragment);
    if (gameFeedback) gameFeedback.textContent = '';
  }

  function wireStorySocialControls() {
    stories.forEach(element => {
      const items = [...element.querySelectorAll('.story-engagement .engagement-item')];
      const actions = ['applause', 'respond', 'repost'];
      items.slice(0, 3).forEach((item, index) => {
        if (item.matches('button')) return;
        item.dataset.socialAction = actions[index];
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
      });
    });
  }

  function updateStoryCardSocial(storyId, data) {
    const element = stories.find(item => item.dataset.storyId === storyId);
    if (!element) return;
    const items = element.querySelectorAll('.story-engagement .engagement-item');
    const counts = data?.counts || {};
    const values = [counts.applause, counts.responses, counts.reposts];
    items.forEach((item, index) => {
      if (values[index] === undefined) return;
      const valueNode = item.querySelector('.engagement-icon + span');
      if (valueNode) valueNode.textContent = formatCount(values[index]);
      else if (item.lastElementChild) item.lastElementChild.textContent = formatCount(values[index]);
      item.setAttribute('aria-label', (index === 0 ? 'Applause: ' : index === 1 ? 'Responses: ' : 'Reposts: ') + formatCount(values[index]));
    });
  }

  function setBookmark(id, present, announce = true) {
    const set = new Set(state.bookmarks);
    if (present) set.add(id); else set.delete(id);
    state.bookmarks = [...set];
    recordMembershipChange('bookmarks', id, present);
    persistState();
    refreshBookmarkButtons();
    renderCurrentView();
    renderStats();
    if (announce) showToast(present ? 'Saved to your reading list.' : 'Removed from your reading list.');
  }

  function setPublicationFollowing(publication, present, announce = true) {
    if (!publication) return;
    const set = new Set(state.followingPublications);
    if (present) set.add(publication); else set.delete(publication);
    state.followingPublications = [...set];
    recordMembershipChange('publications', publication, present);
    persistState();
    refreshPublicationFollowButton();
    if (announce) showToast(present ? 'Now following ' + publication + '.' : 'Unfollowed ' + publication + '.');
  }

  function setFollowing(author, present, announce = true) {
    if (!author) return;
    const set = new Set(state.following);
    if (present) set.add(author); else set.delete(author);
    state.following = [...set];
    recordMembershipChange('following', author, present);
    persistState();
    refreshFollowButton();
    updateProfileSummary();
    renderWriterList();
    if (announce) showToast(present ? 'Now following ' + author + '.' : 'Unfollowed ' + author + '.');
  }

  function refreshBookmarkButtons() {
    stories.forEach(element => {
      const button = element.querySelector('.bookmark');
      if (!button) return;
      const active = state.bookmarks.includes(element.dataset.storyId);
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('aria-label', (active ? 'Remove from saved stories: ' : 'Save ') + (element.querySelector('h2')?.textContent?.trim() || 'story'));
    });
    if (readerBookmark && currentStory) {
      const active = state.bookmarks.includes(currentStory.id);
      readerBookmark.setAttribute('aria-pressed', String(active));
      readerBookmark.textContent = active ? 'Saved story' : 'Save story';
    }
  }

  function refreshPublicationFollowButton() {
    if (!readerFollowPublication || !currentStory) return;
    const publication = currentStory.publication || '';
    const active = Boolean(publication && state.followingPublications.includes(publication));
    readerFollowPublication.setAttribute('aria-pressed', String(active));
    readerFollowPublication.textContent = active ? 'Following publication' : 'Follow publication';
  }

  function refreshFollowButton() {
    if (!readerFollow || !currentStory) return;
    const active = state.following.includes(currentStory.author);
    readerFollow.setAttribute('aria-pressed', String(active));
    readerFollow.textContent = active ? 'Following writer' : 'Follow writer';
  }

  function renderStats() {
    const storiesData = allStoryData();
    const saved = state.bookmarks.length;
    const finished = storiesData.filter(story => state.progress[story.id]?.finished).length;
    const inProgress = storiesData.filter(story => {
      const progress = state.progress[story.id];
      return progress && !progress.finished && Number(progress.ratio) > 0;
    }).length;
    const minutes = storiesData.reduce((sum, story) => sum + (state.progress[story.id]?.finished ? story.readMinutes : 0), 0);
    if (statsSaved) statsSaved.textContent = String(saved);
    if (statsFinished) statsFinished.textContent = String(finished);
    if (statsInProgress) statsInProgress.textContent = String(inProgress);
    if (statsMinutes) statsMinutes.textContent = String(minutes);
    refreshProgressBadges();
  }

  function refreshProgressBadges() {
    stories.forEach(element => {
      const id = element.dataset.storyId;
      const progress = state.progress[id];
      const tools = element.querySelector('.story-tools');
      if (!tools) return;
      let badge = element.querySelector('.story-status');
      const percent = progress ? Math.round(Math.max(0, Math.min(1, Number(progress.ratio) || 0)) * 100) : 0;
      const label = progress?.finished ? 'Finished' : (percent >= 2 && percent < 100 ? percent + '% read' : '');
      if (!label) {
        badge?.remove();
        return;
      }
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'story-status';
        tools.before(badge);
      }
      badge.classList.toggle('finished', Boolean(progress?.finished));
      if (badge.textContent !== label) badge.textContent = label;
    });
  }

  function currentViewMatches(element) {
    const view = document.querySelector('.rail-link.active')?.dataset.view || 'For you';
    const id = element.dataset.storyId;
    const author = element.dataset.author || '';
    if (view === 'Following') return state.following.includes(author);
    if (view === 'Reading list') return state.bookmarks.includes(id);
    return true;
  }

  function renderCurrentView() {
    const query = (search?.value || '').trim().toLowerCase();
    const topic = document.querySelector('.topic-button[aria-pressed="true"]')?.dataset.topic || '';
    const view = document.querySelector('.rail-link.active')?.dataset.view || 'For you';
    let visible = 0;

    stories.forEach(element => {
      const data = storyData(element);
      if (!data) return;
      const haystack = [data.title, data.summary, data.author, data.publication, data.topic, element.dataset.topics || ''].join(' ').toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesTopic = !topic || (element.dataset.topics || '').split(/\s+/).includes(topic);
      const matchesView = view === 'Stats' ? false : currentViewMatches(element);
      const shouldShow = matchesSearch && matchesTopic && matchesView;
      element.classList.toggle('hidden', !shouldShow);
      if (shouldShow) visible++;
    });

    if (feedView) feedView.hidden = view === 'Stats';
    if (statsView) statsView.hidden = view !== 'Stats';
    if (emptyState) {
      emptyState.textContent = emptyMessage(view, Boolean(query || topic));
      emptyState.classList.toggle('show', view !== 'Stats' && visible === 0);
      emptyState.hidden = view === 'Stats' || visible !== 0;
    }
    renderViewHeading(view);
    announceResults(view, visible, Boolean(query || topic));
    renderStats();
  }

  const viewCopy = {
    'For you': { eyebrow: 'Home', title: 'For you', lede: 'Stories and ideas picked for your next great read.' },
    'Following': { eyebrow: 'Activity', title: 'Following', lede: 'Stories from the writers you follow.' },
    'Reading list': { eyebrow: 'Library', title: 'Your library', lede: 'Stories you saved in this browser.' }
  };

  function renderViewHeading(view) {
    const copy = viewCopy[view];
    if (!copy) return;
    const welcome = document.querySelector('.welcome');
    if (!welcome) return;
    const eyebrow = welcome.querySelector('.eyebrow');
    const title = welcome.querySelector('#welcome-title');
    const lede = welcome.querySelector('p:last-child');
    if (eyebrow) eyebrow.textContent = copy.eyebrow;
    if (title) title.textContent = copy.title;
    if (lede && lede !== eyebrow) lede.textContent = copy.lede;
    document.title = 'ink.gs — ' + copy.title;
  }

  function emptyMessage(view, filtered) {
    if (!filtered && view === 'Reading list') return 'Nothing saved yet. Use the bookmark on any story to keep it here.';
    if (!filtered && view === 'Following') {
      return state.following.length
        ? 'The writers you follow have no stories here yet.'
        : 'You are not following anyone yet. Use “Find writers” in the menu to start.';
    }
    return !filtered && view === 'For you' ? 'No stories have been published yet.' : 'No stories match that yet. Try another search.';
  }

  let resultsStatus = null;
  function announceResults(view, visible, filtered) {
    if (view === 'Stats' || !feedView) return;
    if (!resultsStatus) {
      resultsStatus = document.createElement('p');
      resultsStatus.className = 'visually-hidden';
      resultsStatus.id = 'results-status';
      resultsStatus.setAttribute('role', 'status');
      resultsStatus.setAttribute('aria-live', 'polite');
      document.querySelector('#feed-status')?.after(resultsStatus);
    }
    resultsStatus.textContent = filtered
      ? (visible === 1 ? '1 story found.' : visible + ' stories found.')
      : '';
  }

  /* Story card menu: one shared popover so cards stay light. */
  let storyMenu = null;
  let storyMenuTrigger = null;

  function closeStoryMenu(restoreFocus = false) {
    if (!storyMenu) return;
    storyMenu.hidden = true;
    storyMenuTrigger?.setAttribute('aria-expanded', 'false');
    if (restoreFocus) storyMenuTrigger?.focus();
    storyMenuTrigger = null;
  }

  function storyUrlFor(id) {
    const url = new URL(window.location.href);
    url.hash = 'story=' + encodeURIComponent(id);
    return url.toString();
  }

  function openStoryMenu(trigger) {
    const element = trigger.closest('.story');
    const data = storyData(element);
    if (!data) return;
    if (storyMenu && !storyMenu.hidden && storyMenuTrigger === trigger) {
      closeStoryMenu(true);
      return;
    }
    closeStoryMenu();
    if (!storyMenu) {
      storyMenu = document.createElement('div');
      storyMenu.className = 'story-menu';
      storyMenu.setAttribute('role', 'menu');
      storyMenu.hidden = true;
      storyMenu.addEventListener('keydown', event => {
        const items = [...storyMenu.querySelectorAll('[role="menuitem"]')];
        const index = items.indexOf(document.activeElement);
        if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length]?.focus(); }
        else if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length]?.focus(); }
        else if (event.key === 'Home') { event.preventDefault(); items[0]?.focus(); }
        else if (event.key === 'End') { event.preventDefault(); items[items.length - 1]?.focus(); }
        else if (event.key === 'Escape') { event.preventDefault(); closeStoryMenu(true); }
        else if (event.key === 'Tab') closeStoryMenu();
      });
      document.body.append(storyMenu);
    }

    const saved = state.bookmarks.includes(data.id);
    const following = state.following.includes(data.author);
    const actions = [
      ['Read story', () => openReader(data.id)],
      [saved ? 'Remove from reading list' : 'Save to reading list', () => setBookmark(data.id, !saved)],
      ['Copy story link', () => copyText(storyUrlFor(data.id), 'Story link copied.')]
    ];
    if (data.author && data.author !== 'Unknown author') {
      actions.push([(following ? 'Unfollow ' : 'Follow ') + data.author, () => setFollowing(data.author, !following)]);
    }
    storyMenu.replaceChildren(...actions.map(([label, run]) => {
      const item = document.createElement('button');
      item.type = 'button';
      item.setAttribute('role', 'menuitem');
      item.textContent = label;
      item.addEventListener('click', () => {
        closeStoryMenu();
        run();
      });
      return item;
    }));

    storyMenu.hidden = false;
    storyMenuTrigger = trigger;
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'true');
    const rect = trigger.getBoundingClientRect();
    const width = storyMenu.offsetWidth;
    const height = storyMenu.offsetHeight;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width));
    const below = rect.bottom + 6;
    const top = below + height > window.innerHeight - 8 ? Math.max(8, rect.top - height - 6) : below;
    storyMenu.style.left = left + 'px';
    storyMenu.style.top = top + 'px';
    storyMenu.querySelector('[role="menuitem"]')?.focus();
  }

  function setView(view) {
    document.querySelectorAll('.rail-link[data-view]').forEach(button => {
      button.classList.toggle('active', button.dataset.view === view);
      button.setAttribute('aria-current', button.dataset.view === view ? 'page' : 'false');
    });
    document.querySelectorAll('.tab[data-view]').forEach(button => {
      button.classList.toggle('selected', button.dataset.view === view);
    });
    if (view === 'Stats') {
      if (feedView) feedView.hidden = true;
      if (statsView) statsView.hidden = false;
    } else {
      if (feedView) feedView.hidden = false;
      if (statsView) statsView.hidden = true;
    }
    renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateSearchControls() {
    const hasQuery = Boolean(search?.value);
    if (searchClear) searchClear.classList.toggle('visible', hasQuery);
  }

  function openReader(id) {
    const data = findStory(id);
    if (!data || !reader) return;
    currentStory = data;
    if (readerLabel) readerLabel.textContent = data.readMinutes + ' min read';
    if (readerPublication) readerPublication.textContent = data.publication || data.author || 'ink.gs';
    if (readerKicker) readerKicker.textContent = '';
    if (readerTitle) readerTitle.textContent = data.title;
    if (readerSummary) readerSummary.textContent = data.summary || '';
    if (readerMeta) {
      const publishedDate = formatPublishedDate(data.publishedAt);
      readerMeta.textContent = data.readMinutes + ' min read' + (publishedDate ? ' · ' + publishedDate : '');
    }
    if (readerTopic) readerTopic.textContent = data.topic || 'Story';
    if (readerAuthorAvatar) {
      readerAuthorAvatar.textContent = String(data.author || 'R').split(/\\s+/u).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'R';
    }
    if (readerAuthorName) readerAuthorName.textContent = data.author || 'Unknown author';
    if (readerByline) readerByline.textContent = '';
    refreshPublicationFollowButton();

    if (readerImage) {
      if (data.photo) {
        readerImage.src = presentationPhoto(data.photo, data.topic);
        readerImage.alt = data.photoAlt || data.title;
        readerImage.hidden = false;
      } else {
        readerImage.removeAttribute('src');
        readerImage.hidden = true;
      }
    }
    if (readerTopics) {
      const accent = readerTopics.querySelector('.reader-chip-accent');
      readerTopics.replaceChildren();
      if (accent) readerTopics.append(accent);
      const topics = Array.isArray(data.topics) && data.topics.length ? data.topics : [data.topic || 'Story'];
      topics.slice(0, 5).forEach(topic => {
        const chip = document.createElement('span');
        chip.className = 'reader-chip reader-chip-topic';
        chip.textContent = topic;
        readerTopics.append(chip);
      });
    }

    if (readerBody) renderStoryBlocks(readerBody, data.body);
    stopReaderListen();
    closeReaderMore();
    const progress = state.progress[id] || { ratio: 0, finished: false };
    if (!progress.finished && Number(progress.ratio) > 0) {
      if (readerLabel) readerLabel.textContent = Math.round(Number(progress.ratio) * 100) + '% read';
    }
    const percent = Math.round((progress.finished ? 1 : Math.max(0, Math.min(1, Number(progress.ratio) || 0))) * 100);
    if (readerProgressFill) readerProgressFill.style.width = percent + '%';
    if (readerProgress) readerProgress.setAttribute('aria-valuenow', String(percent));
    refreshBookmarkButtons();
    refreshFollowButton();
    if (readerApplaudCount) readerApplaudCount.textContent = formatCount(data.applauseCount || 0);
    if (readerResponseStatCount) readerResponseStatCount.textContent = formatCount(data.responseCount || 0);
    if (readerRepostCount) readerRepostCount.textContent = formatCount(data.repostCount || 0);
    if (readerRead) readerRead.textContent = state.progress[id]?.finished ? 'Finished' : 'Mark as finished';
    if (readerSocial) readerSocial.hidden = true;
    updateSocialActionAvailability();
    loadReaderSocial();
    if (typeof reader.showModal === 'function') reader.showModal();
    else reader.setAttribute('open', '');
  }

  function closeReader() {
    stopReaderListen();
    closeReaderMore();
    if (!reader) return;
    if (reader.open && typeof reader.close === 'function') reader.close();
    else reader.removeAttribute('open');
    currentStory = null;
  }

  function updateReaderProgress() {
    if (!readerScroll || !currentStory) return;
    const max = Math.max(1, readerScroll.scrollHeight - readerScroll.clientHeight);
    const ratio = Math.max(0, Math.min(1, readerScroll.scrollTop / max));
    const previous = state.progress[currentStory.id] || {};
    state.progress[currentStory.id] = {
      ratio: previous.finished ? 1 : ratio,
      finished: Boolean(previous.finished)
    };
    recordProgressChange(currentStory.id);
    const percent = Math.round((state.progress[currentStory.id].finished ? 1 : ratio) * 100);
    if (readerProgressFill) readerProgressFill.style.width = percent + '%';
    if (readerProgress) readerProgress.setAttribute('aria-valuenow', String(percent));
    clearTimeout(progressSaveTimer);
    progressSaveTimer = setTimeout(() => {
      persistState();
      renderStats();
    }, 220);
  }

  function markFinished() {
    if (!currentStory) return;
    state.progress[currentStory.id] = { ratio: 1, finished: true };
    recordProgressChange(currentStory.id);
    persistState();
    if (readerProgressFill) readerProgressFill.style.width = '100%';
    if (readerProgress) readerProgress.setAttribute('aria-valuenow', '100');
    if (readerRead) readerRead.textContent = 'Finished';
    renderStats();
    showToast('Story marked as finished.');
  }

  function currentStoryUrl() {
    if (!currentStory) return '';
    const url = new URL(window.location.href);
    url.hash = 'story=' + encodeURIComponent(currentStory.id);
    return url.toString();
  }

  async function copyText(value, successMessage) {
    if (!value) return false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        showToast(successMessage);
        return true;
      } catch {}
    }
    showToast(value);
    return false;
  }

  function stopReaderListen() {
    if (readerSpeech && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    readerSpeech = null;
    if (readerListen) {
      readerListen.setAttribute('aria-pressed', 'false');
      readerListen.textContent = 'Listen';
    }
  }

  function toggleReaderListen() {
    if (!currentStory || !readerListen) return;
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) {
      showToast('Text-to-speech is not available in this browser.');
      return;
    }
    if (readerSpeech) {
      stopReaderListen();
      showToast('Reading stopped.');
      return;
    }
    const text = [currentStory.title, currentStory.summary, ...currentStory.body.map(value => String(value).replace(/^>\s*/u, '').trim())].filter(Boolean).join('. ');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.96;
    utterance.pitch = 1;
    let started = false;
    let voiceTimeout = null;

    const resetSpeechState = () => {
      if (voiceTimeout) clearTimeout(voiceTimeout);
      voiceTimeout = null;
      readerSpeech = null;
      readerListen.setAttribute('aria-pressed', 'false');
      readerListen.textContent = 'Listen';
    };

    utterance.onend = resetSpeechState;
    utterance.onerror = event => {
      const reason = event?.error || 'unknown';
      resetSpeechState();
      showToast(reason === 'canceled'
        ? 'Reading stopped.'
        : 'Text-to-speech is unavailable in this browser.');
    };

    const startSpeech = () => {
      if (started || readerSpeech !== utterance) return;
      started = true;
      try {
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
        window.speechSynthesis.resume?.();
      } catch {
        resetSpeechState();
        showToast('Text-to-speech is unavailable in this browser.');
        return;
      }
      showToast('Reading aloud started.');
    };

    readerSpeech = utterance;
    readerListen.setAttribute('aria-pressed', 'true');
    readerListen.textContent = 'Stop listening';

    const voices = window.speechSynthesis.getVoices?.() || [];
    if (voices.length) {
      startSpeech();
    } else {
      window.speechSynthesis.onvoiceschanged = startSpeech;
      voiceTimeout = setTimeout(startSpeech, 1600);
    }
  }

  function toggleReaderMore() {
    if (!readerMoreMenu || !readerMore) return;
    const open = readerMoreMenu.hidden;
    readerMoreMenu.hidden = !open;
    readerMore.setAttribute('aria-expanded', String(open));
    if (open) {
      readerMoreMenu.querySelector('[role="menuitem"]')?.focus();
    }
  }

  function closeReaderMore() {
    if (!readerMoreMenu || !readerMore) return;
    readerMoreMenu.hidden = true;
    readerMore.setAttribute('aria-expanded', 'false');
  }

  function shareCurrentStory() {
    if (!currentStory) return;
    const url = new URL(currentStoryUrl());
    if (navigator.share) {
      navigator.share({ title: currentStory.title, text: currentStory.summary, url: url.toString() }).catch(() => {});
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url.toString()).then(() => showToast('Story link copied.')).catch(() => showToast('Story link: ' + url.toString()));
    } else {
      showToast('Story link: ' + url.toString());
    }
  }

  function findDraft(id) {
    return state.drafts.find(draft => draft.id === (id || state.activeDraftId)) || null;
  }

  function updateDraftCount() {
    if (draftCount) draftCount.textContent = String(state.drafts.length);
    if (draftLibraryToggle) draftLibraryToggle.setAttribute('aria-label', 'Show saved drafts (' + state.drafts.length + ')');
  }

  function renderDraftList() {
    if (!draftList) return;
    const fragment = document.createDocumentFragment();
    if (!state.drafts.length) {
      const empty = document.createElement('p');
      empty.className = 'draft-empty';
      empty.textContent = 'No saved drafts yet. Start a new draft whenever you are ready.';
      fragment.append(empty);
    }
    state.drafts.forEach(draft => {
      const row = document.createElement('div');
      row.className = 'draft-row';
      row.dataset.draftId = draft.id;
      const summary = document.createElement('div');
      summary.className = 'draft-row-summary';
      const open = document.createElement('button');
      open.className = 'draft-open';
      open.type = 'button';
      open.dataset.draftAction = 'open';
      open.setAttribute('aria-current', String(draft.id === state.activeDraftId));
      const name = document.createElement('span');
      name.className = 'draft-name';
      name.textContent = draft.title.trim() || 'Untitled draft';
      const date = document.createElement('span');
      date.className = 'draft-date';
      const editedAt = draft.savedAt ? new Date(draft.savedAt) : null;
      date.textContent = editedAt && !Number.isNaN(editedAt.getTime()) ? 'Edited ' + editedAt.toLocaleDateString() : 'Saved on this device';
      open.append(name, date);
      const actions = document.createElement('div');
      actions.className = 'draft-row-actions';
      const rename = document.createElement('button');
      rename.type = 'button'; rename.dataset.draftAction = 'rename'; rename.textContent = 'Rename';
      const remove = document.createElement('button');
      remove.type = 'button'; remove.dataset.draftAction = 'delete'; remove.className = 'draft-delete'; remove.textContent = 'Delete';
      actions.append(rename, remove);
      summary.append(open, actions);
      const renameForm = document.createElement('div');
      renameForm.className = 'draft-rename-form';
      renameForm.hidden = true;
      const renameInput = document.createElement('input');
      renameInput.type = 'text'; renameInput.maxLength = 120; renameInput.value = draft.title;
      renameInput.dataset.renameInput = '';
      const saveRename = document.createElement('button');
      saveRename.type = 'button'; saveRename.dataset.draftAction = 'save-rename'; saveRename.textContent = 'Save name';
      const cancelRename = document.createElement('button');
      cancelRename.type = 'button'; cancelRename.dataset.draftAction = 'cancel-rename'; cancelRename.textContent = 'Cancel';
      renameForm.append(renameInput, saveRename, cancelRename);
      row.append(summary, renameForm);
      fragment.append(row);
    });
    draftList.replaceChildren(fragment);
    updateDraftCount();
  }

  function renderStoryBlocks(container, body) {
    if (!container) return;
    const source = Array.isArray(body)
      ? body
      : String(body || '').split(/\n\s*\n/u).filter(Boolean);
    const fragment = document.createDocumentFragment();

    source.forEach(blockText => {
      const text = String(blockText || '').trim();
      if (!text) return;

      if (text.startsWith('> ')) {
        const quote = document.createElement('blockquote');
        const quoteText = text.slice(2).trim();
        const splitAttribution = quoteText.lastIndexOf(' — ');
        const quoteCopy = splitAttribution > 0
          ? quoteText.slice(0, splitAttribution).trim()
          : quoteText;
        const attribution = splitAttribution > 0
          ? quoteText.slice(splitAttribution + 3).trim()
          : '';

        const p = document.createElement('p');
        p.textContent = quoteCopy;
        quote.append(p);

        if (attribution) {
          const cite = document.createElement('cite');
          cite.textContent = '— ' + attribution;
          quote.append(cite);
        }

        fragment.append(quote);
        return;
      }

      const p = document.createElement('p');
      p.textContent = text;
      fragment.append(p);
    });

    if (!fragment.childNodes.length) {
      const empty = document.createElement('p');
      empty.textContent = 'Nothing to preview yet.';
      fragment.append(empty);
    }

    container.replaceChildren(fragment);
  }

  function renderDraftPreview() {
    if (!previewTitle || !previewBody) return;
    previewTitle.textContent = draftTitle?.value?.trim() || 'Untitled story';
    renderStoryBlocks(previewBody, draftBody?.value || '');
  }

  function loadDraftIntoEditor(id) {
    const draft = findDraft(id);
    if (!draft) return false;
    state.activeDraftId = draft.id;
    editingOnlineStoryId = null;
    persistState();
    if (draftTitle) draftTitle.value = draft.title;
    if (draftBody) draftBody.value = draft.body;
    if (storyAuthor) storyAuthor.value = draft.author || defaultStoryFields.author;
    if (storyPublication) storyPublication.value = draft.publication || defaultStoryFields.publication;
    if (storyTopic) storyTopic.value = draft.topic || defaultStoryFields.topic;
    if (storyPhoto) storyPhoto.value = draft.photo || defaultStoryFields.photo;
    if (storyPhotoAlt) storyPhotoAlt.value = draft.photoAlt || defaultStoryFields.photoAlt;
    if (storyPublished) storyPublished.checked = typeof draft.published === 'boolean' ? draft.published : defaultStoryFields.published;
    if (draftStatus) draftStatus.textContent = 'Draft saved on this device';
    renderDraftPreview();
    renderDraftList();
    return true;
  }

  function createDraft() {
    if (findDraft() && draftTitle && draftBody) saveDraft(false);
    const draft = {
      id: 'draft-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      title: '',
      body: '',
      savedAt: new Date().toISOString(),
      ...defaultStoryFields
    };
    editingOnlineStoryId = null;
    state.drafts.unshift(draft);
    state.activeDraftId = draft.id;
    delete state.draftTombstones[draft.id];
    persistState();
    loadDraftIntoEditor(draft.id);
    if (draftLibrary) draftLibrary.hidden = true;
    if (draftLibraryToggle) draftLibraryToggle.setAttribute('aria-expanded', 'false');
    if (composer) {
      composer.dataset.mode = 'write';
      if (!composer.open && typeof composer.showModal === 'function') composer.showModal();
      else composer.setAttribute('open', '');
    }
    previewOff();
    if (draftTitle) setTimeout(() => draftTitle.focus(), 0);
  }

  function saveDraft(announce = true) {
    if (!draftTitle || !draftBody) return false;
    let draft = findDraft();
    if (!draft) {
      draft = {
        id: 'draft-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        title: '',
        body: '',
        savedAt: null,
        ...defaultStoryFields
      };
      state.drafts.unshift(draft);
      state.activeDraftId = draft.id;
    }
    draft.title = draftTitle.value.trim().slice(0, 120);
    draft.body = draftBody.value.slice(0, 120000);
    draft.author = (storyAuthor?.value || defaultStoryFields.author).trim().slice(0, 80) || defaultStoryFields.author;
    draft.publication = (storyPublication?.value || defaultStoryFields.publication).trim().slice(0, 80) || defaultStoryFields.publication;
    draft.topic = storyTopic?.value || defaultStoryFields.topic;
    draft.photo = storyPhoto?.value || defaultStoryFields.photo;
    draft.photoAlt = (storyPhotoAlt?.value || defaultStoryFields.photoAlt).trim().slice(0, 180);
    draft.published = Boolean(storyPublished?.checked ?? defaultStoryFields.published);
    draft.savedAt = new Date().toISOString();
    persistState();
    renderDraftList();
    if (draftStatus) draftStatus.textContent = 'Saved just now';
    if (announce) showToast('Draft saved on this device.');
    return true;
  }

  function deleteDraft(id) {
    const target = findDraft(id);
    if (!target) return;
    state.draftTombstones[id] = new Date().toISOString();
    state.drafts = state.drafts.filter(draft => draft.id !== id);
    state.activeDraftId = state.drafts[0]?.id || null;
    persistState();
    renderDraftList();
    if (state.activeDraftId) loadDraftIntoEditor(state.activeDraftId);
    else {
      if (draftTitle) draftTitle.value = '';
      if (draftBody) draftBody.value = '';
      renderDraftPreview();
    }
    showToast('Draft deleted.');
  }

  function previewOn() {
    if (!composer) return;
    composer.dataset.mode = 'preview';
    if (previewToggle) {
      previewToggle.textContent = 'Edit';
      previewToggle.setAttribute('aria-pressed', 'true');
    }
    if (draftBody) draftBody.hidden = true;
    const preview = document.querySelector('#draft-preview');
    if (preview) preview.hidden = false;
    renderDraftPreview();
  }

  function previewOff() {
    if (!composer) return;
    composer.dataset.mode = 'write';
    if (previewToggle) {
      previewToggle.textContent = 'Preview';
      previewToggle.setAttribute('aria-pressed', 'false');
    }
    if (draftBody) draftBody.hidden = false;
    const preview = document.querySelector('#draft-preview');
    if (preview) preview.hidden = true;
  }

  function closeComposer() {
    saveDraft(false);
    if (composer?.open && typeof composer.close === 'function') composer.close();
    else composer?.removeAttribute('open');
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(API_BASE + path, {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    let data = {};
    try { data = await response.json(); } catch {}
    if (!response.ok) {
      const error = new Error(data.error || ('HTTP ' + response.status));
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function trySession() {
    if (!API_ENABLED) { updateEditorUi(); return false; }
    try {
      const data = await apiRequest('/api/editor/session', { method: 'GET', headers: {} });
      editorAuthenticated = Boolean(data.authenticated);
      editorCsrfToken = data.csrfToken || '';
      updateEditorUi();
      return editorAuthenticated;
    } catch {
      updateEditorUi();
      return false;
    }
  }

  function updateEditorUi() {
    document.querySelectorAll('.editor-auth-only').forEach(element => {
      element.hidden = !editorAuthenticated;
    });
    if (editorLoginButton) {
      editorLoginButton.textContent = editorAuthenticated ? 'Signed in' : 'Sign in';
      editorLoginButton.setAttribute('aria-pressed', String(editorAuthenticated));
      editorLoginButton.setAttribute('aria-label', editorAuthenticated ? 'Sign out of editor' : 'Sign in to editor');
    }
    if (writeButton) {
      writeButton.setAttribute('aria-label', editorAuthenticated ? 'Write a story' : 'Sign in to write');
      writeButton.title = editorAuthenticated ? 'Open the writing editor' : 'Sign in to write';
    }
    if (publishOnlineButton) publishOnlineButton.disabled = !editorAuthenticated;
    if (!editorAuthenticated && onlineLibrary) {
      onlineLibrary.hidden = true;
      onlineStoryList?.replaceChildren();
    }
  }

  async function loginEditor(event) {
    event.preventDefault();
    if (!editorPassword) return;
    editorLoginError.textContent = '';
    try {
      const data = await apiRequest('/api/editor/login', {
        method: 'POST',
        body: JSON.stringify({ password: editorPassword.value })
      });
      editorAuthenticated = true;
      editorCsrfToken = data.csrfToken || '';
      editorPassword.value = '';
      if (editorLoginDialog?.open) editorLoginDialog.close();
      updateEditorUi();
      showToast('Signed in to the editor.');
      openComposer();
    } catch (error) {
      editorLoginError.textContent = API_ENABLED
        ? 'Sign-in failed: ' + error.message
        : 'GitHub Pages is static. Open the Cloudflare Worker app to enable editor sign-in.';
    }
  }

  async function changeEditorPassword(event) {
    event.preventDefault();
    if (!editorAuthenticated || !editorPasswordForm) return;
    editorPasswordError.textContent = '';
    if (!editorCurrentPassword?.value || !editorNewPassword?.value || !editorConfirmPassword?.value) return;
    if (editorNewPassword.value.length < 10) { editorPasswordError.textContent = 'New password must be at least 10 characters.'; editorNewPassword.focus(); return; }
    if (editorNewPassword.value !== editorConfirmPassword.value) { editorPasswordError.textContent = 'New passwords do not match.'; editorConfirmPassword.focus(); return; }
    if (editorPasswordSubmit) editorPasswordSubmit.disabled = true;
    try {
      await apiRequest('/api/editor/password', { method: 'POST', headers: editorCsrfToken ? { 'X-CSRF-Token': editorCsrfToken } : {}, body: JSON.stringify({ currentPassword: editorCurrentPassword.value, newPassword: editorNewPassword.value }) });
      editorCurrentPassword.value = ''; editorNewPassword.value = ''; editorConfirmPassword.value = '';
      if (editorSettingsDialog?.open) editorSettingsDialog.close();
      showToast('Editor password changed.');
    } catch (error) {
      editorPasswordError.textContent = error.message || 'Password change failed.';
      if (error.status === 401) editorCurrentPassword.focus();
    } finally { if (editorPasswordSubmit) editorPasswordSubmit.disabled = false; }
  }

  function openEditorSettings() {
    if (!editorAuthenticated || !editorSettingsDialog) { if (!editorAuthenticated) openLogin(); return; }
    editorPasswordError.textContent = '';
    editorCurrentPassword.value = ''; editorNewPassword.value = ''; editorConfirmPassword.value = '';
    if (typeof editorSettingsDialog.showModal === 'function') editorSettingsDialog.showModal(); else editorSettingsDialog.setAttribute('open', '');
    setTimeout(() => editorCurrentPassword?.focus(), 0);
  }
  async function logoutEditor() {
    try {
      await apiRequest('/api/editor/logout', {
        method: 'POST',
        headers: editorCsrfToken ? { 'X-CSRF-Token': editorCsrfToken } : {}
      });
    } catch {}
    editorAuthenticated = false;
    editorCsrfToken = '';
    updateEditorUi();
    showToast('Signed out.');
  }

  function openLogin() {
    if (!editorLoginDialog) return;
    if (typeof editorLoginDialog.showModal === 'function') editorLoginDialog.showModal();
    else editorLoginDialog.setAttribute('open', '');
    setTimeout(() => editorPassword?.focus(), 0);
  }

  function openComposer() {
    if (!composer) return;
    if (!editorAuthenticated) {
      openLogin();
      return;
    }
    const draft = findDraft();
    if (!draft) createDraft();
    else {
      loadDraftIntoEditor(draft.id);
      if (typeof composer.showModal === 'function' && !composer.open) composer.showModal();
      else composer.setAttribute('open', '');
    }
    previewOff();
  }

  function populateEditorFromStory(story) {
    if (!story) return;
    editingOnlineStoryId = story.id;
    if (draftTitle) draftTitle.value = story.title || '';
    if (draftBody) draftBody.value = Array.isArray(story.body) ? story.body.join('\n\n') : (story.body || '');
    if (storyAuthor) storyAuthor.value = story.author || defaultStoryFields.author;
    if (storyPublication) storyPublication.value = story.publication || defaultStoryFields.publication;
    if (storyTopic) storyTopic.value = story.topic || defaultStoryFields.topic;
    if (storyPhoto) storyPhoto.value = story.photo || defaultStoryFields.photo;
    if (storyPhotoAlt) storyPhotoAlt.value = story.photo_alt || story.photoAlt || defaultStoryFields.photoAlt;
    if (storyPublished) storyPublished.checked = Boolean(story.published);
    previewOff();
    renderDraftPreview();
  }

  function storyPayload() {
    const body = (draftBody?.value || '').trim();
    const title = (draftTitle?.value || '').trim();
    const summary = body.split(/\n\s*\n/).filter(Boolean)[0]?.slice(0, 280) || '';
    return {
      title,
      summary,
      body,
      author: (storyAuthor?.value || '').trim() || 'Anonymous',
      publication: (storyPublication?.value || '').trim(),
      topic: (storyTopic?.value || '').trim() || 'Other',
      photo: (storyPhoto?.value || '').trim(),
      photoAlt: (storyPhotoAlt?.value || '').trim(),
      published: Boolean(storyPublished?.checked)
    };
  }

  async function publishOnline() {
    if (!API_ENABLED) {
      showToast('Online publishing is available on the Cloudflare Worker app.');
      return;
    }
    if (!editorAuthenticated) {
      showToast('Sign in to publish online.');
      openLogin();
      return;
    }
    const payload = storyPayload();
    if (!payload.title || !payload.body) {
      showToast('Add a title and story body first.');
      return;
    }
    try {
      const path = editingOnlineStoryId ? '/api/editor/stories/' + encodeURIComponent(editingOnlineStoryId) : '/api/editor/stories';
      const data = await apiRequest(path, {
        method: editingOnlineStoryId ? 'PUT' : 'POST',
        headers: { 'X-CSRF-Token': editorCsrfToken },
        body: JSON.stringify(payload)
      });
      const story = data.story;
      saveDraft(false);
      editingOnlineStoryId = story?.id || null;
      showToast(payload.published ? 'Story published online.' : 'Story saved online.');
      await loadOnlineStories();
      await loadPublicStories();
    } catch (error) {
      showToast('Could not publish: ' + error.message);
    }
  }

  function updateOnlineLoadMoreState() {
    if (!loadMoreOnlineStoriesButton) return;
    loadMoreOnlineStoriesButton.hidden = !editorStoryCursor;
    loadMoreOnlineStoriesButton.disabled = editorStoryLoading;
    loadMoreOnlineStoriesButton.textContent = editorStoryLoading ? 'Loading…' : 'Load more stories';
  }

  async function loadOnlineStories({ append = false } = {}) {
    if (!onlineStoryList) return false;
    if (!API_ENABLED || !editorAuthenticated) {
      editorStoryCursor = null;
      updateOnlineLoadMoreState();
      onlineStoryList.replaceChildren();
      onlineStoryCount.textContent = '0';
      const empty = document.createElement('p');
      empty.className = 'draft-empty';
      empty.textContent = !API_ENABLED ? 'Online stories require the Cloudflare Worker API.' : 'Sign in to manage online stories.';
      onlineStoryList.append(empty);
      return false;
    }
    if (editorStoryLoading) return false;
    if (append && !editorStoryCursor) return true;
    editorStoryLoading = true;
    updateOnlineLoadMoreState();
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (append && editorStoryCursor) params.set('cursor', editorStoryCursor);
      const data = await apiRequest('/api/editor/stories?' + params.toString(), { method: 'GET', headers: {} });
      const page = Array.isArray(data.stories) ? data.stories : [];
      editorStories = append ? [...editorStories, ...page] : page;
      editorStoryCursor = data.nextCursor || null;
      onlineStoryCount.textContent = String(editorStories.length) + (editorStoryCursor ? '+' : '');
      renderOnlineStories();
      updateOnlineLoadMoreState();
      return true;
    } catch (error) {
      if (!append) {
        editorStoryCursor = null;
        onlineStoryList.replaceChildren();
        const empty = document.createElement('p');
        empty.className = 'draft-empty';
        empty.textContent = 'Online stories unavailable: ' + error.message;
        onlineStoryList.append(empty);
      }
      return false;
    } finally {
      editorStoryLoading = false;
      updateOnlineLoadMoreState();
    }
  }

  function renderOnlineStories() {
    if (!onlineStoryList) return;
    const fragment = document.createDocumentFragment();
    if (!editorStories.length) {
      const empty = document.createElement('p');
      empty.className = 'draft-empty';
      empty.textContent = 'No online stories yet.';
      fragment.append(empty);
    }
    editorStories.forEach(story => {
      const row = document.createElement('div');
      row.className = 'draft-row';
      const summary = document.createElement('div');
      summary.className = 'draft-row-summary';
      const open = document.createElement('button');
      open.type = 'button';
      open.className = 'draft-open';
      open.textContent = story.title || 'Untitled story';
      open.dataset.onlineStoryId = story.id;
      const stateLabel = document.createElement('span');
      stateLabel.className = 'draft-date';
      stateLabel.textContent = story.published ? 'Published' : 'Draft';
      summary.append(open, stateLabel);
      row.append(summary);
      if (editorAuthenticated) {
        const actions = document.createElement('div');
        actions.className = 'draft-row-actions';
        const edit = document.createElement('button');
        edit.type = 'button'; edit.dataset.onlineAction = 'edit'; edit.dataset.onlineStoryId = story.id; edit.textContent = 'Edit';
        const remove = document.createElement('button');
        remove.type = 'button'; remove.dataset.onlineAction = 'delete'; remove.dataset.onlineStoryId = story.id; remove.className = 'draft-delete'; remove.textContent = 'Delete';
        actions.append(edit, remove);
        row.append(actions);
      }
      fragment.append(row);
    });
    onlineStoryList.replaceChildren(fragment);
  }

  async function deleteOnlineStory(id) {
    if (!API_ENABLED || !editorAuthenticated || !id) return;
    try {
      await apiRequest('/api/editor/stories/' + encodeURIComponent(id), {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': editorCsrfToken }
      });
      showToast('Online story deleted.');
      await loadOnlineStories();
      await loadPublicStories();
    } catch (error) {
      showToast('Could not delete: ' + error.message);
    }
  }


  function readerIdentity() {
    const key = 'ink.gs-reader-id-v1';
    try {
      let id = localStorage.getItem(key);
      if (!id) {
        const bytes = new Uint8Array(24);
        if (crypto?.getRandomValues) crypto.getRandomValues(bytes);
        else {
          for (let index = 0; index < bytes.length; index++) bytes[index] = Math.floor(Math.random() * 256);
        }
        id = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
        localStorage.setItem(key, id);
      }
      return id;
    } catch {
      const fallback = 'fallback-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      return fallback.slice(0, 128);
    }
  }

  function socialHeaders(extra = {}) {
    return { 'X-Reader-ID': readerIdentity(), ...extra };
  }

  function socialAvailable() {
    return Boolean(currentStory && API_ENABLED && dynamicStoryRecords.has(currentStory.id));
  }

  function updateSocialActionAvailability() {
    const available = socialAvailable();
    [readerApplaud, readerRespond, readerRepost].forEach(button => {
      if (!button) return;
      button.disabled = !available;
      button.setAttribute('aria-disabled', String(!available));
      button.title = available ? '' : 'Available for published online stories on the Worker app.';
    });
    if (readerResponseForm) readerResponseForm.hidden = !available;
  }

  function updateReaderSocial(data) {
    const counts = data?.counts || {};
    if (readerApplaud) {
      readerApplaud.setAttribute('aria-pressed', String(Boolean(data?.me?.applauded)));
    }
    if (readerApplaudCount) readerApplaudCount.textContent = formatCount(counts.applause || 0);
    if (readerRepost) {
      readerRepost.setAttribute('aria-pressed', String(Boolean(data?.me?.reposted)));
    }
    if (readerRepostCount) readerRepostCount.textContent = formatCount(counts.reposts || 0);
    if (readerResponseStatCount) readerResponseStatCount.textContent = formatCount(counts.responses || 0);
    if (readerResponseCount) readerResponseCount.textContent = String(counts.responses || 0) + ' ' + (Number(counts.responses || 0) === 1 ? 'response' : 'responses');
    if (currentStory) {
      updateStoryCardSocial(currentStory.id, data);
      updateSocialActionAvailability();
    }
    if (readerResponseList) {
      const fragment = document.createDocumentFragment();
      const rows = Array.isArray(data?.responses) ? data.responses : [];
      if (!rows.length) {
        const empty = document.createElement('p');
        empty.className = 'draft-empty';
        empty.textContent = 'No responses yet.';
        fragment.append(empty);
      }
      rows.forEach(row => {
        const item = document.createElement('article');
        item.className = 'reader-response';
        const body = document.createElement('p');
        body.textContent = row.body;
        const date = document.createElement('time');
        const parsed = new Date(row.createdAt);
        date.textContent = Number.isNaN(parsed.getTime()) ? '' : parsed.toLocaleString();
        item.append(body, date);
        fragment.append(item);
      });
      readerResponseList.replaceChildren(fragment);
    }
  }

  async function loadReaderSocial() {
    if (!currentStory || !readerSocial) return;
    updateSocialActionAvailability();
    if (!socialAvailable()) {
      readerSocial.hidden = true;
      return;
    }
    try {
      const data = await apiRequest('/api/social/stories/' + encodeURIComponent(currentStory.id), {
        method: 'GET',
        headers: socialHeaders()
      });
      readerSocial.hidden = false;
      updateReaderSocial(data);
    } catch {
      readerSocial.hidden = true;
    }
  }

  async function toggleReaction(kind) {
    if (!currentStory) return;
    if (!socialAvailable()) {
      showToast('Engagement is available for published online stories on the Worker app.');
      return;
    }
    try {
      const data = await apiRequest('/api/social/reactions', {
        method: 'POST',
        headers: socialHeaders(),
        body: JSON.stringify({ storyId: currentStory.id, kind })
      });
      updateReaderSocial(data);
      showToast(kind === 'applause' ? (data.me.applauded ? 'Applause added.' : 'Applause removed.') : (data.me.reposted ? 'Reposted.' : 'Repost removed.'));
    } catch (error) {
      showToast('Could not update reaction: ' + error.message);
    }
  }

  async function submitResponse(event) {
    event.preventDefault();
    if (!currentStory || !readerResponseInput) return;
    if (!socialAvailable()) {
      showToast('Responses are available for published online stories on the Worker app.');
      return;
    }
    const body = readerResponseInput.value.trim();
    if (!body) {
      showToast('Write a response first.');
      return;
    }
    try {
      const data = await apiRequest('/api/social/responses', {
        method: 'POST',
        headers: socialHeaders(),
        body: JSON.stringify({ storyId: currentStory.id, body })
      });
      readerResponseInput.value = '';
      updateReaderSocial(data);
      showToast('Response posted.');
    } catch (error) {
      showToast('Could not post response: ' + error.message);
    }
  }

  function openResponseComposer() {
    if (!readerSocial) return;
    if (!socialAvailable()) {
      showToast('Responses are available for published online stories on the Worker app.');
      return;
    }
    readerSocial.hidden = false;
    readerResponseInput?.focus();
    readerSocial.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function placeholderDataUri(topic = 'Story') {
    const palette = {
      Technology: ['#15304a', '#5e88a8'],
      Creativity: ['#5a3b63', '#d29ad6'],
      Travel: ['#36513c', '#9fb99d'],
      Life: ['#5b4633', '#c99d6b'],
      Health: ['#3f5b56', '#a7c6bf'],
      Culture: ['#4f3842', '#c18b9f']
    };
    const [a,b] = palette[topic] || ['#303030','#666666'];
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="1200" height="800" fill="url(#g)"/><circle cx="960" cy="180" r="150" fill="#fff" opacity=".08"/><path d="M0 640 C220 520 410 730 620 600 S980 470 1200 620 V800 H0Z" fill="#000" opacity=".14"/></svg>';
    return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
  }

  function installImageFallbacks() {
    document.querySelectorAll('img.story-image, img.reader-cover').forEach(image => {
      if (image.dataset.fallbackReady) return;
      image.dataset.fallbackReady = 'true';
      image.addEventListener('error', () => {
        const story = image.closest('.story');
        const topic = story?.querySelector('.topic-pill')?.textContent?.trim() || 'Story';
        image.src = placeholderDataUri(topic);
      }, { once: true });
    });
  }

  function toggleMobileMenu(force) {
    const rail = document.querySelector('.left-rail');
    const toggle = document.querySelector('#menu-toggle');
    if (!rail || !toggle) return;
    const open = typeof force === 'boolean' ? force : !rail.classList.contains('mobile-open');
    rail.classList.toggle('mobile-open', open);
    document.body.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  function wireEvents() {
    document.querySelector('#menu-toggle')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      toggleMobileMenu();
    });
    document.querySelector('.mobile-drawer-close')?.addEventListener('click', () => toggleMobileMenu(false));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && document.body.classList.contains('menu-open')) toggleMobileMenu(false);
      const typing = event.target.closest?.('input, textarea, select, [contenteditable="true"]');
      const modalOpen = document.querySelector('dialog[open]');
      if (event.key === '/' && !typing && !modalOpen && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchBox?.classList.add('search-open');
        searchToggle?.setAttribute('aria-expanded', 'true');
        search?.focus();
        search?.select();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (storyMenu && !storyMenu.hidden && !event.target.closest('.story-menu, .more')) closeStoryMenu();
    });
    window.addEventListener('scroll', () => closeStoryMenu(), { passive: true });
    window.addEventListener('resize', () => closeStoryMenu());

    document.addEventListener('click', event => {
      if (document.body.classList.contains('menu-open') &&
          !event.target.closest('.left-rail') &&
          !event.target.closest('#menu-toggle')) {
        toggleMobileMenu(false);
        return;
      }
      const target = event.target.closest('button, a');
      if (!target) return;

      const view = target.dataset.view;
      if (view) {
        event.preventDefault();
        setView(view);
        toggleMobileMenu(false);
        return;
      }

      const topic = target.dataset.topic;
      if (topic) {
        event.preventDefault();
        const active = target.getAttribute('aria-pressed') === 'true';
        document.querySelectorAll('.topic-button').forEach(button => button.setAttribute('aria-pressed', 'false'));
        if (!active) target.setAttribute('aria-pressed', 'true');
        renderCurrentView();
        return;
      }

      if (target.matches('.story-title-button')) {
        openReader(target.closest('.story')?.dataset.storyId);
        return;
      }

      if (target.matches('.bookmark')) {
        const story = target.closest('.story');
        if (story) setBookmark(story.dataset.storyId, !state.bookmarks.includes(story.dataset.storyId));
        return;
      }

      if (target.matches('.more')) {
        event.preventDefault();
        openStoryMenu(target);
        return;
      }

      if (target.id === 'write-button') {
        event.preventDefault();
        if (editorAuthenticated) openComposer();
        else openLogin();
        return;
      }

      if (target.id === 'load-more-stories') {
        event.preventDefault();
        loadPublicStories({ append: true });
        return;
      }

      if (target.id === 'load-more-online-stories') {
        event.preventDefault();
        loadOnlineStories({ append: true });
        return;
      }

      if (target.id === 'sync-button') {
        event.preventDefault();
        if (!API_ENABLED) {
          showToast('Published online stories require the Cloudflare Worker app.');
          return;
        }
        Promise.all([
          loadPublicStories({ append: false }),
          loadOnlineStories({ append: false })
        ]).then(results => {
          showToast(results.every(Boolean) ? 'Published stories refreshed.' : 'Refresh completed with unavailable online data.');
        });
        return;
      }

      if (target.id === 'editor-login-button') {
        event.preventDefault();
        if (editorAuthenticated) logoutEditor(); else openLogin();
        return;
      }

      if (target.id === 'search-toggle') {
        const open = !searchBox?.classList.contains('search-open');
        searchBox?.classList.toggle('search-open', open);
        target.setAttribute('aria-expanded', String(open));
        if (open) {
          search?.focus();
        }
        return;
      }

      if (target.id === 'search-clear') {
        if (search) search.value = '';
        updateSearchControls();
        renderCurrentView();
        searchBox?.classList.remove('search-open');
        searchToggle?.setAttribute('aria-expanded', 'false');
        search?.blur();
        return;
      }

      if (target.id === 'draft-library-toggle') {
        const hidden = draftLibrary?.hidden;
        if (draftLibrary) draftLibrary.hidden = !hidden;
        target.setAttribute('aria-expanded', String(Boolean(hidden)));
        renderDraftList();
        return;
      }

      if (target.id === 'new-draft') {
        createDraft();
        return;
      }

      if (target.id === 'preview-toggle') {
        if (composer?.dataset.mode === 'preview') previewOff(); else previewOn();
        return;
      }

      if (target.id === 'save-draft') {
        saveDraft(true);
        return;
      }

      if (target.id === 'publish-online') {
        publishOnline();
        return;
      }

      if (target.id === 'close-composer') {
        closeComposer();
        return;
      }

      if (target.id === 'editor-settings-button') {
        event.preventDefault();
        openEditorSettings();
        return;
      }

      if (target.id === 'manage-stories-button') {
        event.preventDefault();
        if (!editorAuthenticated) {
          openLogin();
          return;
        }
        openComposer();
        if (draftLibrary) draftLibrary.hidden = false;
        renderDraftList();
        return;
      }

      if (target.id === 'online-library-toggle') {
        const hidden = onlineLibrary?.hidden;
        if (onlineLibrary) onlineLibrary.hidden = !hidden;
        loadOnlineStories();
        return;
      }

      if (target.id === 'profile-button') {
        event.preventDefault();
        openProfile();
        return;
      }
      if (target.id === 'writers-button') {
        event.preventDefault();
        renderWriterList();
        if (typeof writersDialog?.showModal === 'function') writersDialog.showModal(); else writersDialog?.setAttribute('open', '');
        return;
      }
      if (target.id === 'games-button') {
        event.preventDefault();
        startGame();
        if (typeof gamesDialog?.showModal === 'function') gamesDialog.showModal(); else gamesDialog?.setAttribute('open', '');
        return;
      }
      if (target.dataset.writerAction === 'toggle') {
        const author = target.dataset.writerName;
        if (author) setFollowing(author, !state.following.includes(author));
        renderWriterList();
        return;
      }
      if (target.dataset.gameTopic) {
        const current = gameState.current;
        if (!current || gameState.answered) return;
        gameState.answered = true;
        gameOptions?.querySelectorAll('button').forEach(button => { button.disabled = true; });
        const correct = target.dataset.gameTopic === current.topic;
        gameState.score += correct ? 1 : 0;
        gameState.round += 1;
        if (gameFeedback) gameFeedback.textContent = correct ? 'Correct — ' + current.topic + '.' : 'Not quite. The topic is ' + current.topic + '.';
        setTimeout(updateGame, 500);
        return;
      }
      if (target.dataset.socialAction === 'applause') {
        openReader(target.closest('.story')?.dataset.storyId);
        setTimeout(() => toggleReaction('applause'), 0);
        return;
      }
      if (target.dataset.socialAction === 'repost') {
        openReader(target.closest('.story')?.dataset.storyId);
        setTimeout(() => toggleReaction('repost'), 0);
        return;
      }
      if (target.dataset.socialAction === 'respond') {
        openReader(target.closest('.story')?.dataset.storyId);
        setTimeout(openResponseComposer, 0);
        return;
      }
      if (target.id === 'reader-applaud') {
        toggleReaction('applause');
        return;
      }
      if (target.id === 'reader-repost') {
        toggleReaction('repost');
        return;
      }
      if (target.id === 'reader-respond') {
        openResponseComposer();
        return;
      }
      if (target.id === 'reader-respond-cancel') {
        if (readerSocial) readerSocial.hidden = true;
        return;
      }
      if (target.id === 'close-editor-login') {
        if (editorLoginDialog?.open) editorLoginDialog.close();
        return;
      }

      if (target.dataset.draftAction) {
        const row = target.closest('.draft-row');
        const id = row?.dataset.draftId;
        const action = target.dataset.draftAction;
        if (!id) return;
        const draft = findDraft(id);
        if (action === 'open') loadDraftIntoEditor(id);
        if (action === 'rename') {
          row.querySelector('.draft-rename-form').hidden = false;
          row.querySelector('[data-rename-input]')?.focus();
        }
        if (action === 'cancel-rename') row.querySelector('.draft-rename-form').hidden = true;
        if (action === 'save-rename' && draft) {
          const input = row.querySelector('[data-rename-input]');
          draft.title = (input?.value || '').trim().slice(0, 120);
          draft.savedAt = new Date().toISOString();
          persistState();
          renderDraftList();
          showToast('Draft renamed.');
        }
        if (action === 'delete') deleteDraft(id);
        return;
      }

      if (target.dataset.onlineAction) {
        const id = target.dataset.onlineStoryId;
        const story = editorStories.find(item => item.id === id);
        if (target.dataset.onlineAction === 'edit' && story) {
          openComposer();
          populateEditorFromStory(story);
        }
        if (target.dataset.onlineAction === 'delete') deleteOnlineStory(id);
        return;
      }

      if (target.id === 'reader-follow-publication') {
        if (currentStory?.publication) {
          setPublicationFollowing(
            currentStory.publication,
            !state.followingPublications.includes(currentStory.publication)
          );
        }
        return;
      }

      if (target.id === 'reader-close') {
        closeReader();
        return;
      }

      if (target.id === 'reader-bookmark') {
        if (currentStory) setBookmark(currentStory.id, !state.bookmarks.includes(currentStory.id));
        return;
      }

      if (target.id === 'reader-follow') {
        if (currentStory) setFollowing(currentStory.author, !state.following.includes(currentStory.author));
        return;
      }

      if (target.id === 'reader-listen') {
        toggleReaderListen();
        return;
      }

      if (target.id === 'reader-more') {
        toggleReaderMore();
        return;
      }

      if (target.id === 'reader-copy-link') {
        copyText(currentStoryUrl(), 'Story link copied.');
        closeReaderMore();
        return;
      }

      if (target.id === 'reader-copy-title') {
        copyText(currentStory?.title || '', 'Story title copied.');
        closeReaderMore();
        return;
      }

      if (target.id === 'reader-open-new') {
        const url = currentStoryUrl();
        if (url) window.open(url, '_blank', 'noopener,noreferrer');
        closeReaderMore();
        return;
      }

      if (target.id === 'reader-share') {
        shareCurrentStory();
        return;
      }

      if (target.id === 'reader-read') {
        markFinished();
        return;
      }

      if (target.dataset.toast) {
        showToast(target.dataset.toast);
        return;
      }

      if (target.textContent?.trim() === 'Get started') {
        const membership = document.querySelector('.membership-card');
        membership?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (target.matches('.story h2')) {
        openReader(target.closest('.story')?.dataset.storyId);
      }
    });

    document.addEventListener('click', event => {
      if (readerMoreMenu && !event.target.closest('.reader-more-wrap')) {
        closeReaderMore();
      }
      const title = event.target.closest('.story h2');
      if (!title || event.target.closest('button')) return;
      openReader(title.closest('.story')?.dataset.storyId);
    });

    search?.addEventListener('input', () => {
      updateSearchControls();
      renderCurrentView();
    });

    search?.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        search.value = '';
        updateSearchControls();
        renderCurrentView();
        searchBox?.classList.remove('search-open');
        searchToggle?.setAttribute('aria-expanded', 'false');
        search.blur();
      }
    });

    readerScroll?.addEventListener('scroll', updateReaderProgress, { passive: true });

    profileForm?.addEventListener('submit', event => {
      event.preventDefault();
      state.profile = {
        name: (profileName?.value || '').trim().slice(0, 60),
        bio: (profileBio?.value || '').trim().slice(0, 240)
      };
      persistState();
      updateProfileSummary();
      showToast('Profile saved on this device.');
      profileDialog?.close();
    });
    profileCancel?.addEventListener('click', () => profileDialog?.close());
    document.querySelector('#profile-close')?.addEventListener('click', () => profileDialog?.close());
    writersClose?.addEventListener('click', () => writersDialog?.close());
    gamesClose?.addEventListener('click', () => gamesDialog?.close());
    gameRestart?.addEventListener('click', startGame);
    writerSearch?.addEventListener('input', renderWriterList);
    readerResponseForm?.addEventListener('submit', submitResponse);
    readerRespondCancel?.addEventListener('click', () => { if (readerSocial) readerSocial.hidden = true; });
    editorLoginForm?.addEventListener('submit', loginEditor);
    editorPasswordForm?.addEventListener('submit', changeEditorPassword);
    editorSettingsClose?.addEventListener('click', () => editorSettingsDialog?.close());
    editorSettingsCancel?.addEventListener('click', () => editorSettingsDialog?.close());

    [composer, editorLoginDialog, editorSettingsDialog, reader].forEach(dialog => {
      dialog?.addEventListener('cancel', event => {
        if (dialog === composer) saveDraft(false);
      });
    });

    draftTitle?.addEventListener('input', renderDraftPreview);
    draftBody?.addEventListener('input', renderDraftPreview);

    window.addEventListener('hashchange', handleHash);
  }

  function handleHash() {
    const match = window.location.hash.match(/^#story=(.+)$/);
    if (!match) return;
    try {
      openReader(decodeURIComponent(match[1]));
    } catch {
      showToast('This story link is malformed.');
    }
  }

  stories.forEach(element => {
    const title = element.querySelector('h2');
    if (title) {
      title.classList.add('story-title-button');
      title.setAttribute('role', 'button');
      title.setAttribute('tabindex', '0');
      title.setAttribute('aria-label', 'Read ' + title.textContent.trim());
      title.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openReader(element.dataset.storyId);
        }
      });
    }
  });

  installImageFallbacks();
  wireStorySocialControls();
  refreshBookmarkButtons();
  updateDraftCount();
  renderDraftList();
  renderStats();
  updateProfileSummary();
  renderCurrentView();
  updateEditorUi();
  wireEvents();
  loadPublicStories();
  trySession();
  handleHash();
})();
