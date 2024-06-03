// const { align } = require('@mdit/plugin-align')
(async () => {
  const align = await import('@mdit/plugin-align');
})();
// ------------------------------------
// Markdown - Align
// ------------------------------------

module.exports = {
  init (md, conf) {
    md.use(align)
  }
}
