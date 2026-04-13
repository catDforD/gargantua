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
});
