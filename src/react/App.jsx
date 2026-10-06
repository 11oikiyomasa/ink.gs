import React from "react";

const APP_MARKUP = `
<header class="topbar">
    <div class="topbar-inner">
      <button class="menu-toggle" id="menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="main-navigation"><span></span><span></span><span></span></button>
      <a class="brand" href="#home" aria-label="ink.gs home"><span class="brand-name">ink.gs</span></a>
      <div class="top-actions">
        <div class="search-box" aria-label="Search stories">
          <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m15.5 15.5 4.2 4.2"></path></svg>
          <input id="search" type="search" maxlength="100" placeholder="Search stories" autocomplete="off" aria-label="Search published stories" />
          <button class="search-toggle" id="search-toggle" type="button" aria-label="Open search" aria-expanded="false"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="6.4"></circle><path d="m15.5 15.5 4.2 4.2"></path></svg></button>
          <button class="search-clear" id="search-clear" type="button" aria-label="Clear search">×</button>
        </div>
        <button class="text-action write-action" id="write-button" type="button" aria-label="Write" aria-haspopup="dialog" aria-controls="composer">Write</button>
        <button class="text-action sync-action" id="sync-button" type="button" title="Refresh published online stories" aria-label="Refresh published online stories">Refresh</button>
        <button class="text-action editor-action" id="editor-login-button" type="button" title="Open the publishing editor">Sign in</button>
        <button class="avatar" id="profile-button-top" type="button" aria-label="Open reader profile">R</button>
      </div>
    </div>
  </header>
  <div class="open-app-bar" role="note" aria-label="App availability"><span>Open in app</span><span aria-hidden="true">↗</span></div>
  <button class="drawer-overlay" id="drawer-overlay" type="button" aria-label="Close menu" tabindex="-1"></button>
  <aside class="promotion-banner" aria-label="About ink.gs">
    <span>A calm reading room for stories, ideas, and independent publishing.</span>
    <a href="#about">About ink.gs <span aria-hidden="true">↗</span></a>
  </aside>
  <div class="layout" id="home">
    <aside class="left-rail" id="main-navigation" aria-label="Main navigation">
      <div class="rail-mobile-head"><span class="rail-mobile-brand">ink.gs</span><button class="mobile-drawer-close" type="button" aria-label="Close menu">×</button></div>
      <nav class="rail-list">
        <button class="rail-link active" data-view="For you" aria-current="page"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 10.7 12 3.8l8.5 6.9"/><path d="M5.5 9.7v9.1h13V9.7"/><path d="M9.5 18.8v-5h5v5"/></svg></span><span>Home</span></button>
        <button class="rail-link" data-view="Reading list"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h13v15H5z"/><path d="M8 8h7M8 11.5h7M8 15h4.5"/></svg></span><span>Library</span></button>
        <button class="rail-link" id="profile-button"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 19.2c.9-3.1 3-4.7 6.5-4.7s5.6 1.6 6.5 4.7"/></svg></span><span>Profile</span></button>
        <button class="rail-link editor-auth-only" id="manage-stories-button" hidden><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4.5h14v15H5z"/><path d="M8 8h8M8 11.5h6M8 15h4"/></svg></span><span>Stories</span></button>
        <button class="rail-link editor-auth-only" id="editor-settings-button" hidden><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7"/><path d="M3.5 19h17"/></svg></span><span>Settings</span></button>
        <button class="rail-link" data-view="Stats" aria-label="Stats"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V9M12 19V5M19 19v-7"/><path d="M3.5 19h17"/></svg></span><span>Stats</span></button>
        <hr class="rail-divider" />
        <button class="rail-link rail-link-with-badge" id="games-button"><span><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 8.5h9a4 4 0 0 1 3.9 4.9l-.8 3.8a2.7 2.7 0 0 1-4.7 1.2l-1.3-1.5H10.4l-1.3 1.5a2.7 2.7 0 0 1-4.7-1.2l-.8-3.8A4 4 0 0 1 7.5 8.5Z"/><path d="M8 11v4M6 13h4M15.7 12.5h.1M18 14.5h.1"/></svg></span><span>Games</span></span><span class="beta">Beta</span></button>
        <hr class="rail-divider" />
        <p class="rail-label">Following</p>
        <button class="rail-link" data-view="Following"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 18.5a6.5 6.5 0 1 1 6.5-6.5"/><path d="M13 17h6M16 14v6"/></svg></span><span>Following</span></button>
        <div class="rail-following" id="rail-following" aria-label="Followed writers"></div>
        <button class="rail-link" id="writers-button"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></span><span>Find writers and publications to follow</span></button><button class="rail-link" id="suggestions-button" type="button"><span class="rail-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/></svg></span><span>See suggestions</span></button>
      </nav>
      <div class="rail-bottom"><a href="#about">About</a><a href="#help">Help</a><a href="#terms">Terms</a><br />Made for curious readers.</div>
    </aside>
    <main>
      <div class="feed-view" id="feed-view">
        <section class="welcome" aria-labelledby="welcome-title">
          <div class="welcome-copy"><p class="eyebrow">Your reading room</p><h1 id="welcome-title">For you</h1><p>Thoughtful stories, independent voices, and ideas worth your time.</p></div>
          <div class="welcome-mark" aria-hidden="true"><span>INK</span><span>GS</span></div>
        </section>
        <div class="feed-toolbar">
          <div class="tabs" role="tablist" aria-label="Story feed"><button class="tab selected" role="tab" aria-selected="true" data-view="For you">For you</button><button class="tab" role="tab" aria-selected="false" data-view="Following">Activity</button></div>
          <div class="feed-status-slot"><p class="feed-status" id="feed-status" role="status" aria-live="polite" hidden></p></div>
        </div>
        <div class="feed-skeleton" id="feed-skeleton" aria-label="Loading stories" aria-hidden="true" hidden>
          <article class="skeleton-story">
            <div class="skeleton-copy">
              <div class="skeleton-byline"><span class="skeleton-avatar"></span><span class="skeleton-meta"><i></i><i></i></span></div>
              <span class="skeleton-line skeleton-title-line"></span>
              <span class="skeleton-line skeleton-title-line short"></span>
              <span class="skeleton-line skeleton-title-line short skeleton-extra-title-line"></span>
              <span class="skeleton-line skeleton-paragraph-line"></span>
              <span class="skeleton-line skeleton-paragraph-line short"></span>
              <div class="skeleton-actions"><i></i><i></i><i></i></div>
            </div>
            <span class="skeleton-image"></span>
          </article>
          <article class="skeleton-story">
            <div class="skeleton-copy">
              <div class="skeleton-byline"><span class="skeleton-avatar"></span><span class="skeleton-meta"><i></i><i></i></span></div>
              <span class="skeleton-line skeleton-title-line"></span>
              <span class="skeleton-line skeleton-title-line short"></span>
              <span class="skeleton-line skeleton-title-line short skeleton-extra-title-line"></span>
              <span class="skeleton-line skeleton-paragraph-line"></span>
              <span class="skeleton-line skeleton-paragraph-line short"></span>
              <div class="skeleton-actions"><i></i><i></i><i></i></div>
            </div>
            <span class="skeleton-image"></span>
          </article>
        </div>
        <section id="stories" class="story-feed" aria-label="Recommended stories" aria-busy="false">
        </section>
        <button class="load-more" id="load-more-stories" type="button" hidden>Load more stories</button>
        <section class="empty-state" id="empty-state" aria-labelledby="empty-state-title" aria-live="polite" hidden>
          <div class="empty-state-copy-column">
            <div class="empty-state-byline"><span class="empty-state-avatar" aria-hidden="true">i</span><span>ink.gs <span class="empty-state-source">· Feed preview</span></span></div>
            <p class="empty-state-kicker">Feed status</p>
            <h2 id="empty-state-title">No stories just yet.</h2>
            <p class="empty-state-copy">No published stories are available in this feed. Story details and actions will appear here when a published story is available.</p>
            <div class="empty-story-actions" role="group" aria-label="Story actions unavailable until a story is published">
              <button type="button" disabled aria-label="Applause unavailable until a story is published"><span aria-hidden="true">✦</span><span aria-hidden="true">—</span></button>
              <button type="button" disabled aria-label="Responses unavailable until a story is published"><span aria-hidden="true">◯</span><span aria-hidden="true">—</span></button>
              <button type="button" disabled aria-label="Reposts unavailable until a story is published"><span aria-hidden="true">↗</span><span aria-hidden="true">—</span></button>
              <button class="empty-story-bookmark" type="button" disabled aria-label="Save unavailable until a story is published"><span aria-hidden="true">♧</span></button>
              <button class="empty-story-more" type="button" disabled aria-label="More story actions unavailable until a story is published"><span aria-hidden="true">···</span></button>
            </div>
          </div>
          <div class="empty-state-art" aria-hidden="true"><span class="empty-state-art-mark">i</span><span class="empty-state-art-label">ink.gs · Feed</span></div>
        </section>
      </div>
      <section class="stats-view" id="stats-view" aria-labelledby="stats-title" hidden>
        <div class="stats-heading"><p class="eyebrow">Your activity</p><h1 id="stats-title">Reading stats</h1><p>A small snapshot of your saved and finished stories.</p></div>
        <p class="stats-scope-note">These totals use stories available on this page and reading progress saved in this browser. The page does not track time spent reading.</p>
        <dl class="stats-grid" aria-label="Local reading activity">
          <div class="stats-card"><dt>Saved stories</dt><dd id="stats-saved">0</dd><p>In your reading list</p></div>
          <div class="stats-card"><dt>Finished stories</dt><dd id="stats-finished">0</dd><p>Marked as finished</p></div>
          <div class="stats-card"><dt>In progress</dt><dd id="stats-in-progress">0</dd><p>Opened and not finished</p></div>
          <div class="stats-card"><dt>Estimated minutes</dt><dd id="stats-minutes">0</dd><p>Read-time estimates for finished stories</p></div>
        </dl>
      </section>
    </main>
    <aside class="right-rail" aria-label="Explore ink.gs">
      <section class="side-section side-discover"><p class="section-kicker">Explore</p><h2>Find something worth reading.</h2><p>Follow a topic, then let the feed narrow itself.</p><div class="topics">
        <button class="topic-button" data-topic="Technology">Technology</button><button class="topic-button" data-topic="Creativity">Creativity</button><button class="topic-button" data-topic="Life">Life</button><button class="topic-button" data-topic="Writing">Writing</button><button class="topic-button" data-topic="Travel">Travel</button><button class="topic-button" data-topic="Mindfulness">Mindfulness</button>
      </div></section>
      <section class="side-section" id="staff-picks" hidden><p class="section-kicker">Staff picks · Sample stories</p>
        <article class="pick"><span class="pick-number">01</span><div><p class="pick-byline">A Field Guide · 8 min</p><h3>On keeping a notebook you never show anyone</h3></div></article>
        <article class="pick"><span class="pick-number">02</span><div><p class="pick-byline">Civic Life · 6 min</p><h3>How a block becomes a neighborhood</h3></div></article>
        <article class="pick"><span class="pick-number">03</span><div><p class="pick-byline">New Rhythm · 5 min</p><h3>A kinder way to make a plan</h3></div></article>
        <a class="see-more" href="#stories">Browse all stories →</a>
      </section>
    </aside>
  </div>
<dialog class="composer" id="composer" aria-labelledby="composer-label" data-mode="write">
    <div class="composer-toolbar">
      <span class="composer-status" id="draft-status" role="status" aria-live="polite">Your draft stays in this browser</span>
      <div class="composer-toolbar-actions">
        <button class="composer-button" id="draft-library-toggle" type="button" aria-expanded="false" aria-controls="draft-library">Drafts <span id="draft-count">0</span></button>
        <button class="composer-button editor-auth-only" id="online-library-toggle" type="button" aria-expanded="false" aria-controls="online-library" hidden>Online stories</button>
        <button class="composer-button" id="preview-toggle" type="button" aria-pressed="false">Preview</button>
        <button class="composer-button primary" id="save-draft" type="button">Save draft</button>
        <button class="composer-button primary editor-auth-only" id="publish-online" type="button" hidden>Publish online</button>
        <button class="composer-close" id="close-composer" type="button" aria-label="Close writer">×</button>
      </div>
    </div>
    <div class="composer-content">
      <h2 class="visually-hidden" id="composer-label">Write a story</h2>
      <section class="draft-library" id="draft-library" aria-label="Saved drafts" hidden>
        <div class="draft-library-heading">
          <div><h3>Your drafts</h3><p>Saved only in this browser on this device.</p></div>
          <button class="composer-button primary" id="new-draft" type="button">New draft</button>
        </div>
        <div class="draft-list" id="draft-list" aria-live="polite"></div>
      </section>
      <section class="online-library" id="online-library" aria-label="Online stories" hidden>
        <div class="online-library-heading"><h3>Online stories</h3><span class="composer-status" id="online-story-count"></span></div>
        <div class="online-story-list" id="online-story-list" aria-live="polite"></div>
        <button class="load-more load-more-online" id="load-more-online-stories" type="button" hidden>Load more stories</button>
      </section>
      <label class="visually-hidden" for="draft-title">Story title</label>
      <input class="composer-title" id="draft-title" type="text" maxlength="120" placeholder="Title" autocomplete="off" />
      <label class="visually-hidden" for="draft-body">Story body</label>
      <textarea class="composer-body" id="draft-body" placeholder="Tell your story..." spellcheck="true"></textarea>
      <section class="story-fields editor-auth-only" id="story-fields" aria-label="Online story details" hidden>
        <label>Author<input id="story-author" type="text" maxlength="80" value="Site Editor" autocomplete="off" /></label>
        <label>Publication<input id="story-publication" type="text" maxlength="80" value="The Open Notebook" autocomplete="off" /></label>
        <label>Topic<select id="story-topic"><option>Writing</option><option>Creativity</option><option>Technology</option><option>Travel</option><option>Life</option><option>Health</option><option>Culture</option><option>Mindfulness</option><option>Other</option></select></label>
        <label>Cover photo<select id="story-photo"><option value="/assets/writing-garden.jpg">Writing garden</option><option value="/assets/notebook.jpg">Notebook</option><option value="/assets/train-journal.jpeg">Train journal</option><option value="/assets/river-sunset.jpg">River sunset</option><option value="/assets/forest-wellness.jpg">Forest wellness</option><option value="/assets/city-scenes.jpg">City scenes</option></select></label>
        <label class="full-width">Photo description<input id="story-photo-alt" type="text" maxlength="180" value="A quiet scene for reading" autocomplete="off" /></label>
        <label class="published-field full-width"><input id="story-published" type="checkbox" checked /> Publish publicly (uncheck to save as a private online draft)</label>
      </section>
      <article class="composer-preview" id="draft-preview" aria-label="Story preview">
        <h1 class="composer-preview-title" id="draft-preview-title"></h1>
        <div class="composer-preview-body" id="draft-preview-body"></div>
      </article>
      <p class="composer-note">Local drafts stay on this device. Online stories are visible only after you publish them.</p>
    </div>
  </dialog>
  <dialog class="login-dialog" id="editor-login-dialog" aria-labelledby="editor-login-title">
    <form id="editor-login-form">
      <h2 id="editor-login-title">Editor sign in</h2>
      <p>Use the private editor password to manage stories. Readers can browse without signing in.</p>
      <label for="editor-password">Editor password<input id="editor-password" name="password" type="password" autocomplete="current-password" required maxlength="1024" /></label>
      <div class="login-error" id="editor-login-error" role="status" aria-live="polite"></div>
      <div class="login-actions"><button id="close-editor-login" type="button">Cancel</button><button class="primary" id="submit-editor-login" type="submit">Sign in</button></div>
    </form>
  </dialog>
  <dialog class="utility-dialog" id="editor-settings-dialog" aria-labelledby="editor-settings-title">
    <div class="utility-dialog-head"><div><p class="eyebrow">Editor</p><h2 id="editor-settings-title">Settings</h2><p>Manage the private editor access used to publish and edit stories.</p></div><button class="utility-dialog-close" id="editor-settings-close" type="button" aria-label="Close editor settings">×</button></div>
    <form class="profile-form" id="editor-password-form">
      <label>Current password<input id="editor-current-password" type="password" autocomplete="current-password" required maxlength="1024" /></label>
      <label>New password<input id="editor-new-password" type="password" autocomplete="new-password" required minlength="10" maxlength="1024" /></label>
      <label>Confirm new password<input id="editor-confirm-password" type="password" autocomplete="new-password" required minlength="10" maxlength="1024" /></label>
      <p class="login-error" id="editor-password-error" role="status" aria-live="polite"></p>
      <div class="utility-dialog-actions"><button class="composer-button" id="editor-settings-cancel" type="button">Cancel</button><button class="composer-button primary" id="editor-password-submit" type="submit">Change password</button></div>
    </form>
  </dialog>
  <dialog class="reader" id="reader" aria-labelledby="reader-title" hidden>
    <div class="reader-site-bar">
      <span class="reader-menu-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></span>
      <span class="reader-brand">ink.gs</span>
      <span class="reader-site-search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.4"/><path d="m15.5 15.5 4.2 4.2"/></svg></span>
      <span class="reader-site-avatar" aria-hidden="true">R</span>
    </div>
    <div class="reader-offer"><span>A calm reading room for stories, ideas, and independent publishing.</span><a href="#about">About ink.gs <span aria-hidden="true">↗</span></a></div>
    <div class="reader-toolbar">
      <span class="reader-publication" id="reader-publication"></span>
      <button class="reader-follow-publication" id="reader-follow-publication" type="button">Follow publication</button>
      <span class="reader-toolbar-spacer" aria-hidden="true"></span>
      <span id="reader-label" class="reader-read-label">Reading room</span>
      <button class="reader-close" id="reader-close" type="button" aria-label="Close reader">×</button>
    </div>
    <div class="reader-progress" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
    <div class="reader-scroll" id="reader-scroll" tabindex="0">
      <article class="reader-article">
        <div class="reader-chips" id="reader-topics" aria-label="Story topics"></div>
        <div class="reader-resume" id="reader-resume" hidden aria-labelledby="reader-resume-message">
          <p id="reader-resume-message" role="status" aria-live="polite"></p>
          <div class="reader-resume-actions" role="group" aria-label="Choose where to start reading">
            <button type="button" id="reader-continue">Continue reading</button>
            <button type="button" id="reader-start-over">Start from beginning</button>
          </div>
        </div>
        <h2 class="reader-title" id="reader-title"></h2>
        <p class="reader-summary" id="reader-summary"></p>
        <p class="reader-meta" id="reader-meta"></p>
        <div class="reader-author-row">
          <span class="reader-author-avatar" id="reader-author-avatar" aria-hidden="true">R</span>
          <span class="reader-author-name" id="reader-author-name"></span>
          <button class="reader-inline-follow" id="reader-follow" type="button" aria-pressed="false">Follow</button>
        </div>
        <details class="reader-settings" id="reader-settings">
          <summary class="reader-tool reader-settings-toggle" aria-label="Aa reader settings" title="Reader settings">Aa</summary>
          <div class="reader-settings-panel" aria-label="Reader settings">
            <p class="reader-local-note">Text size, reading width, and progress are saved only on this device.</p>
            <fieldset class="reader-setting-group">
              <legend>Text size</legend>
              <div class="reader-setting-options">
                <button type="button" data-reader-size="small" aria-pressed="false">Small</button>
                <button type="button" data-reader-size="regular" aria-pressed="true">Regular</button>
                <button type="button" data-reader-size="large" aria-pressed="false">Large</button>
              </div>
            </fieldset>
            <fieldset class="reader-setting-group">
              <legend>Reading width</legend>
              <div class="reader-setting-options">
                <button type="button" data-reader-width="narrow" aria-pressed="false">Narrow</button>
                <button type="button" data-reader-width="comfortable" aria-pressed="true">Comfortable</button>
                <button type="button" data-reader-width="wide" aria-pressed="false">Wide</button>
              </div>
            </fieldset>
            <p class="reader-settings-status" id="reader-settings-status" role="status" aria-live="polite"></p>
          </div>
        </details>
        <div class="reader-tool-row">
          <button class="reader-tool" id="reader-listen" type="button" aria-pressed="false"><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M4 9.5A2.5 2.5 0 0 1 6.5 7H9l4-3v16l-4-3H6.5A2.5 2.5 0 0 1 4 14.5z"/><path d="M17 8.5a5 5 0 0 1 0 7M19.5 6a8.5 8.5 0 0 1 0 12"/></svg><span>Listen</span></button>
          <button class="reader-tool" id="reader-share" type="button" aria-label="Share story link" title="Share story link"><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><path d="m8.6 10.6 6.8-4.1M8.6 13.4l6.8 4.1"></path></svg><span>Share</span></button>
          <span class="reader-more-wrap">
            <button class="reader-tool" id="reader-more" type="button" aria-expanded="false" aria-controls="reader-more-menu">More</button>
            <span class="reader-more-menu" id="reader-more-menu" role="menu" hidden>
              <button type="button" role="menuitem" id="reader-copy-link">Copy story link</button>
              <button type="button" role="menuitem" id="reader-copy-title">Copy story title</button>
              <button type="button" role="menuitem" id="reader-open-new">Open standalone</button>
            </span>
          </span>
        </div>
        <img class="reader-cover" id="reader-image" src="data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%201200%20800%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22g%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23493f2b%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23c09a5b%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%221200%22%20height%3D%22800%22%20fill%3D%22url(%23g)%22%2F%3E%3Ccircle%20cx%3D%22960%22%20cy%3D%22180%22%20r%3D%22150%22%20fill%3D%22%23fff%22%20opacity%3D%22.08%22%2F%3E%3Cpath%20d%3D%22M0%20640%20C220%20520%20410%20730%20620%20600%20S980%20470%201200%20620%20V800%20H0Z%22%20fill%3D%22%23000%22%20opacity%3D%22.14%22%2F%3E%3C%2Fsvg%3E" alt="Story cover" />
        <div class="reader-body" id="reader-body"></div>
      </article>
    </div>
    <div class="reader-actions">
      <div class="reader-stats-row" aria-label="Story engagement">
        <button class="reader-stat" id="reader-applaud" type="button" aria-label="Applaud" aria-pressed="false">
          <span class="reader-stat-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12.6 5.8 9.4a1.9 1.9 0 0 0-2.7 2.7l5.6 5.6a4.7 4.7 0 0 0 6.6 0l2.1-2.1a4.8 4.8 0 0 0 .8-5.7l-1.8-3.1"/><path d="m8 10.6 2.2-2.2a2 2 0 0 1 2.8 0l2.9 2.9"/><path d="m6.6 8.4 1.5-1.5a1.8 1.8 0 0 1 2.6 0l4.1 4.1"/><path d="m11.2 6.5 1-1a1.8 1.8 0 0 1 2.6 0l3.4 3.4"/></svg></span><span class="reader-stat-count" id="reader-applaud-count">0</span>
        </button>
        <button class="reader-stat" id="reader-respond" type="button" aria-label="Respond">
          <span class="reader-stat-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.8 3.5.8-3.5H6.5A2.5 2.5 0 0 1 4 12.5z"/></svg></span><span class="reader-stat-count" id="reader-response-stat-count">0</span>
        </button>
        <button class="reader-stat" id="reader-repost" type="button" aria-label="Repost" aria-pressed="false">
          <span class="reader-stat-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 3-3 3 3"/><path d="M10 4v9a4 4 0 0 0 4 4h4"/><path d="m17 14 3 3-3 3"/></svg></span><span class="reader-stat-count" id="reader-repost-count">0</span>
        </button>
        <button class="reader-stat reader-stat-bookmark" id="reader-bookmark" type="button" aria-label="Save story" aria-pressed="false">
          <span class="reader-stat-icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 4.5h11v15l-5.5-3.3-5.5 3.3z"/></svg></span>
        </button>
      </div>
      <button class="reader-finished" id="reader-read" type="button" aria-describedby="reader-finish-hint">Mark as finished</button>
      <span class="visually-hidden" id="reader-finish-hint">Available after reading near the end of the article.</span>
    </div>
    <section class="reader-social" id="reader-social" hidden aria-label="Story responses">
      <div class="reader-social-heading"><strong id="reader-response-count">0 responses</strong><span>Join the conversation</span></div>
      <form class="reader-response-form" id="reader-response-form">
        <label class="visually-hidden" for="reader-response-input">Write a response</label>
        <textarea id="reader-response-input" maxlength="1200" rows="4" placeholder="Write a thoughtful response..."></textarea>
        <div class="reader-response-actions"><button class="reader-action" id="reader-respond-cancel" type="button">Cancel</button><button class="reader-action primary" type="submit">Post response</button></div>
      </form>
      <div class="reader-response-list" id="reader-response-list" aria-live="polite"></div>
    </section>
  </dialog>

  <dialog class="utility-dialog" id="profile-dialog" aria-labelledby="profile-title">
    <div class="utility-dialog-head"><div><p class="eyebrow">Reader</p><h2 id="profile-title">Your profile</h2><p>Saved locally on this device. It is not an account yet.</p></div><button class="utility-dialog-close" id="profile-close" type="button" aria-label="Close profile">×</button></div>
    <form class="profile-form" id="profile-form">
      <label>Display name<input id="profile-name" maxlength="60" autocomplete="nickname" placeholder="Your name"></label>
      <label>Bio<textarea id="profile-bio" maxlength="240" rows="4" placeholder="A few words about what you like to read."></textarea></label>
      <div class="profile-summary"><span><strong id="profile-following-count">0</strong> following</span><span><strong id="profile-saved-count">0</strong> saved</span><span><strong id="profile-finished-count">0</strong> finished</span></div>
      <div class="utility-dialog-actions"><button class="composer-button" id="profile-cancel" type="button">Cancel</button><button class="composer-button primary" type="submit">Save profile</button></div>
    </form>
  </dialog>

  <dialog class="utility-dialog" id="writers-dialog" aria-labelledby="writers-title">
    <div class="utility-dialog-head"><div><p class="eyebrow">Discover</p><h2 id="writers-title">Find writers</h2><p>Search writers already represented in ink.gs and follow them from one place.</p></div><button class="utility-dialog-close" id="writers-close" type="button" aria-label="Close writer discovery">×</button></div>
    <label class="writer-search-label" for="writer-search">Search writers</label>
    <input class="writer-search" id="writer-search" type="search" maxlength="100" placeholder="Name or publication" autocomplete="off">
    <p class="writer-search-status" id="writer-search-status" role="status" aria-live="polite"></p>
    <div class="writer-list" id="writer-list" aria-live="polite"></div>
    <button class="load-more writer-load-more" id="writer-load-more" type="button" hidden>Load more writers</button>
  </dialog>

  <dialog class="utility-dialog game-dialog" id="games-dialog" aria-labelledby="games-title">
    <div class="utility-dialog-head"><div><p class="eyebrow">Games</p><h2 id="games-title">Ink Match</h2><p>Match a topic to its story in five quick rounds.</p></div><button class="utility-dialog-close" id="games-close" type="button" aria-label="Close games">×</button></div>
    <div class="game-stats"><span>Round <strong id="game-round">1</strong>/<strong id="game-total">5</strong></span><span>Score <strong id="game-score">0</strong></span></div>
    <div class="game-prompt" id="game-prompt">Loading...</div>
    <div class="game-options" id="game-options"></div>
    <p class="game-feedback" id="game-feedback" role="status" aria-live="polite"></p>
    <button class="composer-button primary" id="game-restart" type="button">Start over</button>
  </dialog>
<footer class="site-footer" aria-label="Site information">
    <section id="about">
      <p class="eyebrow">About</p>
      <h2>ink.gs</h2>
      <p>A reading-room prototype for exploring stories, publishing workflows, local reading state, and lightweight social interaction.</p>
    </section>
    <section id="help">
      <p class="eyebrow">Help</p>
      <h2>Using the site</h2>
      <p>Open a story to read and save progress. Use Profile for browser-local preferences, Find writers to follow authors represented in the feed, and Games for a short topic-matching activity. Editor publishing requires the Cloudflare Worker runtime.</p>
    </section>
    <section id="terms">
      <p class="eyebrow">Terms</p>
      <h2>Prototype terms</h2>
      <p>Stories shown as local samples are demonstration content. Published online stories, reactions, and responses are stored by the Worker according to the project configuration. Do not enter confidential information into public responses.</p>
    </section>
  </footer>
  <div class="toast" role="status" aria-live="polite"></div>
`;

export default function App() {
  return <div className="ink-react-app" dangerouslySetInnerHTML={{ __html: APP_MARKUP }} />;
}
