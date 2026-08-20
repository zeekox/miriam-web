const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

for (const video of document.querySelectorAll('[data-pause-when-reduced]')) {
  if (!prefersReducedMotion) continue
  video.autoplay = false
  video.pause()
}

for (const button of document.querySelectorAll('[data-video-toggle]')) {
  const video = button.closest('li')?.querySelector('video')
  if (!video) continue

  const syncLabel = () => {
    button.textContent = video.paused ? 'Play' : 'Pause'
  }

  button.addEventListener('click', () => {
    if (video.paused) video.play().catch(() => {})
    else video.pause()
  })
  video.addEventListener('play', syncLabel)
  video.addEventListener('pause', syncLabel)

  button.hidden = false
  syncLabel()
}
