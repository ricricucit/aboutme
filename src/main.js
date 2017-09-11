const css = require("./sass/main.scss"); //webpack-dev

import Vue from 'vue';
import App from './App.vue';
import router from './components/router';

//Vue.config.productionTip = false;

let root = new Vue({
  replace: true,
  router,
  render: h => h(App)
});

/* eslint-disable no-new */
// this is to mount the application at the right moment
// (after pre-rendered content has loaded...from the prerender-spa-plugin)
document.addEventListener('DOMContentLoaded', function () {

  root.$mount('#portfolio');

});
