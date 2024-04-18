'use strict';

import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';
// import adapter from "@sveltejs/adapter-static";
import node from '@sveltejs/adapter-node';

export default {
    kit: {
        adapter: node(),
        // adapter: adapter(),
    },

    preprocess: [preprocess(), vitePreprocess({})],
};
