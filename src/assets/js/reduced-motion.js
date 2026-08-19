if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  for (const player of document.querySelectorAll('[data-pause-when-reduced]')) {
    player.autoplay = false
    player.pause()
  }
}
