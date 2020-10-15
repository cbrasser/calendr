// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import firebase from 'firebase';
import LoadScript from 'vue-plugin-load-script';

import Vue from 'vue';
import App from './App';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.use(LoadScript);

const firebaseConfig = {
  apiKey: 'AIzaSyAKZ3cn_50icodj1HyBqSq-2I0i-Vhcc5g',
  authDomain: 'calendr-771d1.firebaseapp.com',
  databaseURL: 'https://calendr-771d1.firebaseio.com',
  projectId: 'calendr-771d1',
  storageBucket: 'calendr-771d1.appspot.com',
  messagingSenderId: '268265568262',
  appId: '1:268265568262:web:e4cbd42607b8a311efab87',
  measurementId: 'G-RR3ZN6JPLF',
};
firebase.initializeApp(firebaseConfig);

/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
