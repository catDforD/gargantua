document.addEventListener('DOMContentLoaded', function() {
  var photographyGrid = document.querySelector('.photography-grid');
  if (photographyGrid) {
    var updatePhotographyGridWidth = function() {
      var parent = photographyGrid.parentElement;
      if (!parent) return;

      var styles = window.getComputedStyle(photographyGrid);
      var columnWidth = parseFloat(styles.columnWidth);
      var columnGap = parseFloat(styles.columnGap);
      var availableWidth = parent.clientWidth;

      if (!Number.isFinite(columnWidth) || columnWidth <= 0) {
        return;
      }

      if (!Number.isFinite(columnGap) || columnGap < 0) {
        columnGap = 0;
      }

      var columnCount = Math.max(1, Math.floor((availableWidth + columnGap) / (columnWidth + columnGap)));
      var exactWidth = columnCount * columnWidth + Math.max(0, columnCount - 1) * columnGap;

      photographyGrid.style.width = Math.min(availableWidth, exactWidth) + 'px';
    };

    updatePhotographyGridWidth();
    window.addEventListener('resize', updatePhotographyGridWidth);

    if (typeof ResizeObserver !== 'undefined') {
      var resizeObserver = new ResizeObserver(updatePhotographyGridWidth);
      resizeObserver.observe(photographyGrid.parentElement);
    }
  }

  var qqIconLink = document.querySelector('.about-icons a[aria-label^="QQ:"]');
  if (qqIconLink) {
    qqIconLink.removeAttribute('href');
    qqIconLink.removeAttribute('target');
    qqIconLink.classList.add('icon-static');
  }

  var momentsFeed = document.querySelector('#moments-feed');
  if (!momentsFeed) return;

  var escapeHtml = function(value) {
    var element = document.createElement('span');
    element.textContent = value == null ? '' : String(value);
    return element.innerHTML;
  };

  var formatMomentDate = function(value) {
    var date = new Date(String(value).replace(' ', 'T'));
    if (Number.isNaN(date.getTime())) return escapeHtml(value);

    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  var renderMoment = function(moment) {
    var card = document.createElement('article');
    card.className = 'moment-card';

    var header = document.createElement('header');
    header.className = 'moment-card__header';
    header.innerHTML = [
      '<img class="moment-card__avatar" src="/img/avatar.png" alt="Gargantua 的头像">',
      '<div class="moment-card__identity">',
      '<strong>Gargantua</strong>',
      '<div class="moment-card__meta">',
      '<time datetime="', escapeHtml(moment.date), '">', formatMomentDate(moment.date), '</time>',
      moment.location ? '<span>· ' + escapeHtml(moment.location) + '</span>' : '',
      moment.mood ? '<span class="moment-card__mood">' + escapeHtml(moment.mood) + '</span>' : '',
      '</div>',
      '</div>'
    ].join('');

    var body = document.createElement('div');
    body.className = 'moment-card__body';
    body.innerHTML = moment.html || '';

    card.appendChild(header);
    card.appendChild(body);

    if (Array.isArray(moment.images) && moment.images.length) {
      var images = document.createElement('div');
      images.className = 'moment-card__images';
      images.dataset.count = String(moment.images.length);
      moment.images.forEach(function(image) {
        var figure = document.createElement('figure');
        figure.innerHTML = '<img src="' + escapeHtml(image.src) + '" alt="' + escapeHtml(image.alt) + '" loading="lazy">';
        var imageElement = figure.querySelector('img');
        imageElement.tabIndex = 0;
        imageElement.setAttribute('role', 'button');
        imageElement.setAttribute('aria-label', '点击放大图片');
        images.appendChild(figure);
      });
      card.appendChild(images);
    }

    return card;
  };

  var lightbox = document.createElement('div');
  lightbox.className = 'moment-lightbox';
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', '图片预览');
  lightbox.setAttribute('aria-hidden', 'true');
  lightbox.innerHTML = [
    '<button class="moment-lightbox__close" type="button" aria-label="关闭图片预览">×</button>',
    '<img class="moment-lightbox__image" alt="">'
  ].join('');
  document.body.appendChild(lightbox);

  var lightboxImage = lightbox.querySelector('.moment-lightbox__image');
  var closeLightbox = function() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('moment-lightbox-open');
    lightboxImage.removeAttribute('src');
  };

  var openLightbox = function(image) {
    lightboxImage.src = image.currentSrc || image.src;
    lightboxImage.alt = image.alt || '动态图片';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('moment-lightbox-open');
    lightbox.querySelector('.moment-lightbox__close').focus();
  };

  momentsFeed.addEventListener('click', function(event) {
    var image = event.target.closest('.moment-card__images img');
    if (image) openLightbox(image);
  });

  momentsFeed.addEventListener('keydown', function(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    var image = event.target.closest('.moment-card__images img');
    if (!image) return;
    event.preventDefault();
    openLightbox(image);
  });

  lightbox.addEventListener('click', function(event) {
    if (event.target === lightbox || event.target.closest('.moment-lightbox__close')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });

  fetch('/moments/data.json')
    .then(function(response) {
      if (!response.ok) throw new Error('Unable to load moments');
      return response.json();
    })
    .then(function(moments) {
      momentsFeed.replaceChildren();
      if (!moments.length) {
        momentsFeed.innerHTML = '<p class="moments-status">还没有动态，写下第一条吧。</p>';
        return;
      }
      moments.forEach(function(moment) {
        momentsFeed.appendChild(renderMoment(moment));
      });
    })
    .catch(function() {
      momentsFeed.innerHTML = '<p class="moments-status">动态暂时无法加载，请稍后再试。</p>';
    });
});
