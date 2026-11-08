import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

/**
 * Generates the app icons in public/ from the brand mark.
 * Regenerate after changing public/favicon.svg:  npm run icons
 */
export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    // Maskable and Apple icons are padded; fill the padding with the brand navy so they read as one tile.
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background: '#0f1b2d' } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background: '#0f1b2d' } },
  },
  images: ['public/favicon.svg'],
})
