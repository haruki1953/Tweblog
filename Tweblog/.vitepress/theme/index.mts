import Theme from "vitepress/theme"
import { onMounted, watch, nextTick, h } from 'vue';
import { useRoute } from 'vitepress';
import mediumZoom from "medium-zoom"

import "./custom.css"
import HomeWidgetbot from "./components/HomeWidgetbot.vue";

// 下面是在模仿 AutoBangumi 的官网
export default {
  extends: Theme,
  Layout: () => {
      return h(Theme.Layout, null, {
          // https://vitepress.dev/guide/extending-default-theme#layout-slots
          'home-features-after': () => h(HomeWidgetbot),
          // 'nav-bar-content-before': () => h(Documate, {
          //     endpoint: 'https://kp35gyb313.us.aircode.run/ask',
          // }),
      })
  },
  setup() {
    const route = useRoute();
    const initZoom = () => {
      /**
       * Allow images to be zoomed in on click
       * https://github.com/vuejs/vitepress/issues/854
       */
      // mediumZoom('[data-zoomable]', { background: 'var(--vp-c-bg)' })
      mediumZoom('.main img', { background: 'var(--vp-c-bg)' });
    };
    onMounted(() => {
      initZoom();
    });
    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    );
  },
};