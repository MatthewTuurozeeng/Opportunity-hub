// Applies the saved theme before the page paints, so there is no flash of the
// wrong theme. Kept as a file (not inline) because the Content-Security-Policy
// only allows scripts from this site. Mirrors src/features/theme/themeStore.ts.
;(function () {
  try {
    var preference = localStorage.getItem('opportunityhub-theme')
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    var isDark = preference === 'dark' || ((preference === null || preference === 'system') && prefersDark)
    document.documentElement.classList.toggle('dark', isDark)
  } catch (error) {
    // Storage can be unavailable (e.g. blocked cookies); fall back to the light theme.
  }
})()
