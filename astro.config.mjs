// @ts-check
import { defineConfig } from 'astro/config';
import llmsTxt from './llms-txt.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://novibe.org',
  integrations: [llmsTxt()],
});
