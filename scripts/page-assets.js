hexo.extend.filter.register('after_render:html', function(html, data) {
  if (!data.page) return html;

  const assets = [];
  if (data.page.recommendations_page) assets.push('recommendations');
  if (data.page.leetcode_page) assets.push('leetcode');
  if (!assets.length) return html;

  const root = this.config.root;
  const styles = assets.map((name) => `<link rel="stylesheet" href="${root}css/${name}.css">`).join('\n');
  const scripts = assets.map((name) => `<script src="${root}js/${name}.js"></script>`).join('\n');
  return html.replace('</head>', `${styles}\n</head>`).replace('</body>', `${scripts}\n</body>`);
});
