const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const SLIDE_INTERVAL_MS = 5000

for (const video of document.querySelectorAll('[data-pause-when-reduced]')) {
  if (!prefersReducedMotion) continue
  video.autoplay = false
  video.pause()
}

for (const carousel of document.querySelectorAll('[data-carousel]')) {
  const track = carousel.querySelector('[data-carousel-track]')
  const toggle = carousel.querySelector('[data-carousel-toggle]')
  const video = carousel.querySelector('video')
  const slideCount = track.children.length
  if (prefersReducedMotion || slideCount < 2) continue

  let timer = null
  let stoppedByVisitor = false
  let pointerInside = false

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
    if (timer !== null || stoppedByVisitor || pointerInside || document.hidden) return
    timer = setInterval(advance, SLIDE_INTERVAL_MS)
  }

  const suspend = () => {
    pointerInside = true
    stop()
  }

  const resume = () => {
    pointerInside = false
    start()
  }

  carousel.addEventListener('pointerenter', suspend)
  carousel.addEventListener('pointerleave', resume)
  carousel.addEventListener('focusin', suspend)
  carousel.addEventListener('focusout', resume)
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()))

  if (toggle) {
    toggle.addEventListener('click', () => {
      stoppedByVisitor = !stoppedByVisitor
      toggle.textContent = stoppedByVisitor ? 'Play' : 'Pause'
      if (stoppedByVisitor) {
        stop()
        video?.pause()
      } else {
        video?.play().catch(() => {})
        start()
      }
    })
    toggle.hidden = false
  }

  start()
}
