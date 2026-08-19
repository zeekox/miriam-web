export interface ImageSlide {
  readonly kind: 'image'
  readonly src: string
  readonly alt: string
}

export interface VideoSlide {
  readonly kind: 'video'
  readonly mp4: string
  readonly poster: string
  readonly alt: string
}

export type Slide = ImageSlide | VideoSlide

const slides: readonly Slide[] = [
  {
    kind: 'video',
    mp4: 'src/assets/video/pollen.mp4',
    poster: 'src/assets/video/pollen-poster.jpg',
    alt: 'Pollen',
  },
  {
    kind: 'image',
    src: 'src/assets/slides/ausstellungssituation.jpg',
    alt: 'Ausstellungssituation',
  },
  {
    kind: 'image',
    src: 'src/assets/slides/vulkan.jpg',
    alt: 'Vulkan',
  },
  {
    kind: 'image',
    src: 'src/assets/slides/fallen.jpg',
    alt: 'Fallen',
  },
  {
    kind: 'image',
    src: 'src/assets/slides/stardust-detail.jpg',
    alt: 'Stardust',
  },
]

export default slides
