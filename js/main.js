/* ============================================================
   EXIFSHARE — main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     MODAL HELPERS
     ============================================================ */
  function openModal(el)  { el.classList.add('open');    document.body.style.overflow = 'hidden'; }
  function closeModal(el) { el.classList.remove('open'); document.body.style.overflow = ''; }

  /* ============================================================
     MODAL — Thêm bài viết mới
     ============================================================ */
  const modalNewPost = document.getElementById('modal-new-post');
  const btnNewPost   = document.getElementById('btn-new-post');
  const modalClose   = document.getElementById('modal-close');
  const modalBack    = document.getElementById('modal-back');
  const btnPublishTop= document.getElementById('btn-publish-top');
  const fileInput    = document.getElementById('file-input');
  const uploadZone   = document.getElementById('upload-zone');
  const editZone     = document.getElementById('edit-zone');
  const previewImg   = document.getElementById('preview-img');
  const modalInner   = modalNewPost?.querySelector('.modal--create-post');

  // Load EXIF parser dynamically
  const exifrScript = document.createElement('script');
  exifrScript.src = 'https://cdn.jsdelivr.net/npm/exifr/dist/lite.umd.js';
  document.head.appendChild(exifrScript);

  function extractExif(file) {
    const inputs = document.querySelectorAll('.exif-input-group input');
    if (inputs.length < 4) return;
    
    // Set loading state
    inputs.forEach(i => i.value = '...');
    
    const fillMock = () => {
      setTimeout(() => {
        inputs[0].value = (Math.random() * (2.8 - 1.4) + 1.4).toFixed(1);
        inputs[1].value = [100, 200, 400, 800][Math.floor(Math.random()*4)];
        inputs[2].value = `1/${[100, 250, 500, 1000, 2000][Math.floor(Math.random()*5)]}`;
        inputs[3].value = [24, 35, 50, 85][Math.floor(Math.random()*4)];
      }, 500);
    };

    if (window.exifr) {
      exifr.parse(file).then(exifData => {
        if (exifData && (exifData.FNumber || exifData.ISO || exifData.ExposureTime || exifData.FocalLength)) {
          inputs[0].value = exifData.FNumber ? exifData.FNumber : '';
          inputs[1].value = exifData.ISO ? exifData.ISO : '';
          inputs[2].value = exifData.ExposureTime ? `1/${Math.round(1/exifData.ExposureTime)}` : '';
          inputs[3].value = exifData.FocalLength ? Math.round(exifData.FocalLength) : '';
        } else {
          fillMock(); // Simulate if no EXIF found
        }
      }).catch(err => {
        console.error('EXIF error:', err);
        fillMock();
      });
    } else {
      fillMock();
    }
  }

  function showEditZone() {
    uploadZone.style.display = 'none';
    editZone.style.display = 'flex';
    if (modalInner) modalInner.classList.add('expanded');
    if (modalClose) modalClose.style.display = 'none';
    if (modalBack) modalBack.style.display = 'block';
    if (btnPublishTop) btnPublishTop.style.display = 'block';
  }

  function resetNewPostModal() {
    uploadZone.style.display = 'flex';
    editZone.style.display = 'none';
    if (modalInner) modalInner.classList.remove('expanded');
    if (modalClose) modalClose.style.display = 'block';
    if (modalBack) modalBack.style.display = 'none';
    if (btnPublishTop) btnPublishTop.style.display = 'none';
    previewImg.src = '';
    if (fileInput) fileInput.value = '';
    const cap = document.querySelector('.modal-caption');
    if (cap) cap.value = '';
    document.querySelectorAll('.exif-input-group input').forEach(i => i.value = '');
  }

  btnNewPost?.addEventListener('click', () => {
    resetNewPostModal();
    openModal(modalNewPost);
  });
  
  modalClose?.addEventListener('click', () => closeModal(modalNewPost));
  modalBack?.addEventListener('click', resetNewPostModal);
  
  modalNewPost?.addEventListener('click', e => { 
    if (e.target === modalNewPost) closeModal(modalNewPost); 
  });

  // File preview
  fileInput?.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    previewImg.src = URL.createObjectURL(file);
    showEditZone();
    extractExif(file);
  });

  // Drag & drop
  uploadZone?.addEventListener('dragover',  e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
  uploadZone?.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
  uploadZone?.addEventListener('drop', e => {
    e.preventDefault();
    uploadZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      previewImg.src = URL.createObjectURL(file);
      showEditZone();
      extractExif(file);
    }
  });

  // Publish
  btnPublishTop?.addEventListener('click', () => {
    closeModal(modalNewPost);
    resetNewPostModal();
  });

  /* ============================================================
     MODAL — Tìm kiếm
     ============================================================ */
  const modalSearch = document.getElementById('modal-search');
  const btnSearch   = document.getElementById('btn-search');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');

  btnSearch?.addEventListener('click', () => {
    openModal(modalSearch);
    setTimeout(() => searchInput?.focus(), 120);
  });
  searchClose?.addEventListener('click', () => closeModal(modalSearch));
  modalSearch?.addEventListener('click', e => { if (e.target === modalSearch) closeModal(modalSearch); });

  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      if (searchInput) { searchInput.value = tag.textContent; searchInput.focus(); }
    });
  });

  const btnSearchSubmit = document.getElementById('btn-search-submit');
  
  function performSearch() {
    const query = searchInput?.value.trim();
    if (!query) {
      alert('Vui lòng nhập từ khoá tìm kiếm!');
      return;
    }
    
    // Simulate search functionality
    alert('Đang tìm kiếm cho: ' + query);
    closeModal(modalSearch);
    
    if (searchInput) searchInput.value = '';
  }

  btnSearchSubmit?.addEventListener('click', performSearch);
  
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch();
    }
  });

  /* ============================================================
     KEYBOARD SHORTCUTS
     ============================================================ */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(modalNewPost); closeModal(modalSearch); }
  });

  /* ============================================================
     NAV ACTIVE STATE
     ============================================================ */
  document.querySelectorAll('.sidebar-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.sidebar-nav .nav-btn').forEach(b => b.classList.remove('nav-btn--active'));
      this.classList.add('nav-btn--active');
    });
  });

  /* ============================================================
     LIKE BUTTON TOGGLE
     ============================================================ */
  document.querySelectorAll('.action-btn--like').forEach(btn => {
    btn.addEventListener('click', () => {
      const isLiked = btn.classList.toggle('liked');
      const countEl = btn.querySelector('span');
      if (!countEl) return;
      let raw = countEl.dataset.raw ? parseInt(countEl.dataset.raw) : parseRawCount(countEl.textContent);
      countEl.dataset.raw = raw;
      raw = isLiked ? raw + 1 : raw - 1;
      countEl.dataset.raw = raw;
      countEl.textContent = formatCount(raw);
      btn.style.transform = 'scale(1.25)';
      setTimeout(() => btn.style.transform = '', 200);
    });
  });

  /* ============================================================
     SAVE BUTTON TOGGLE
     ============================================================ */
  document.querySelectorAll('.action-btn--save').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('saved');
      btn.style.transform = 'scale(1.3) rotate(-8deg)';
      setTimeout(() => btn.style.transform = '', 220);
    });
  });

  /* ============================================================
     FOLLOW BUTTON TOGGLE
     ============================================================ */
  document.querySelectorAll('.btn-follow').forEach(btn => {
    btn.addEventListener('click', () => {
      const isFollowing = btn.classList.toggle('following');
      btn.textContent = isFollowing ? 'Đang theo' : 'Theo dõi';
    });
  });

  /* ============================================================
     SKELETON SCROLL LOADER
     ============================================================ */
  const feed = document.querySelector('.feed');
  let loadingMore = false;

  const sentinel = document.createElement('div');
  sentinel.style.height = '1px';
  feed.appendChild(sentinel);

  const skStyle = document.createElement('style');
  skStyle.textContent = `
    .skel { background: linear-gradient(90deg,#1a1a1a 25%,#252525 50%,#1a1a1a 75%); background-size:200% 100%; animation:shimmer 1.4s infinite; border-radius:6px; }
    .skel-circle { width:38px; height:38px; border-radius:50%; flex-shrink:0; }
    .skel-line   { height:13px; }
    .skel-image  { width:100%; aspect-ratio:3/4; border-radius:0; }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `;
  document.head.appendChild(skStyle);

  new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !loadingMore) {
        loadingMore = true;
        const sk = document.createElement('article');
        sk.className = 'post skeleton-post';
        sk.innerHTML = `
          <div style="padding:14px 16px;display:flex;gap:10px;align-items:center;">
            <div class="skel skel-circle"></div>
            <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
              <div class="skel skel-line" style="width:40%"></div>
              <div class="skel skel-line" style="width:25%"></div>
            </div>
          </div>
          <div class="skel skel-image"></div>
          <div style="padding:12px 16px;display:flex;flex-direction:column;gap:8px;">
            <div class="skel skel-line" style="width:90%"></div>
            <div class="skel skel-line" style="width:70%"></div>
          </div>`;
        feed.insertBefore(sk, sentinel);
        setTimeout(() => {
          sk.style.cssText = 'opacity:0;transform:translateY(-10px);transition:0.3s ease';
          setTimeout(() => { sk.remove(); loadingMore = false; }, 300);
        }, 1400);
      }
    });
  }, { rootMargin: '200px' }).observe(sentinel);

  /* ============================================================
     POST HOVER BORDER
     ============================================================ */
  document.querySelectorAll('.post').forEach(post => {
    post.addEventListener('mouseenter', () => { post.style.borderColor = '#333'; post.style.transition = 'border-color .2s'; });
    post.addEventListener('mouseleave', () => { post.style.borderColor = ''; });
  });

  /* ============================================================
     UTILITIES
     ============================================================ */
  function parseRawCount(str) {
    str = str.trim().toLowerCase();
    if (str.endsWith('k')) return Math.round(parseFloat(str) * 1000);
    return parseInt(str) || 0;
  }
  function formatCount(n) {
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k' : String(n);
  }

});