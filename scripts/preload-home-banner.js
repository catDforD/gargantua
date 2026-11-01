hexo.extend.filter.register('after_render:html', function(html, data) {
  if (data.path !== 'index.html') return html;

  const banner = this.theme.config.index.banner_img;
  if (!banner || typeof banner !== 'string') return html;
  const url = /^(?:[a-z]+:)?\/\//i.test(banner)
    ? banner
    : this.config.root + banner.replace(/^\/+/, '');
  const escapedUrl = url.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
  const preload = `<link rel="preload" as="image" fetchpriority="high" href="${escapedUrl}">`;
  return html.replace(/<head(\s[^>]*)?>/i, (head) => `${head}\n  ${preload}`);
});
