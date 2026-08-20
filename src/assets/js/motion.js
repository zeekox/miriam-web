const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const SLIDE_INTERVAL_MS = 3000

for (const video of document.querySelectorAll('[data-pause-when-reduced]')) {
  if (!prefersReducedMotion) continue
  video.autoplay = false
  video.pause()
}

for (const carousel of document.querySelectorAll('[data-carousel]')) {
  const track = carousel.querySelector('[data-carousel-track]')
  const slideCount = track.children.length
  if (prefersReducedMotion || slideCount < 2) continue

  let timer = null
  let focusInside = false

  const advance = () => {
    const width = track.clientWidth
    const next = (Math.round(track.scrollLeft / width) + 1) % slideCount
    track.scrollTo({ left: next * width, behavior: 'smooth' })
  }

  const stop = () => {
    if (timer === null) return
    clearInterval(timer)
    timer = null
  }

  const start = () => {
    if (timer !== null || focusInside || document.hidden) return
    timer = setInterval(advance, SLIDE_INTERVAL_MS)
  }

  carousel.addEventListener('focusin', () => {
    focusInside = true
    stop()
  })

  carousel.addEventListener('focusout', () => {
    focusInside = false
    start()
  })
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))

  start()
}
