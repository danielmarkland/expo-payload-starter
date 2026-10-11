import { defineConfig } from '@neon/config/v1'
export default defineConfig({
  buckets: {
    'cms-media': { access: 'private' },
    'app-uploads': { access: 'private' },
    'site-transfer-archives': { access: 'private' },
  },
})
