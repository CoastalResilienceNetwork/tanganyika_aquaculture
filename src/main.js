import { createApp } from 'vue';
import App from './App.vue';
import VueGtag from 'vue-gtag';
import router from './router';
import store from './store';
import { Quasar } from 'quasar';
import quasarUserOptions from './quasar-user-options';

const app = createApp(App);
app.use(VueGtag, {
  config: { id: 'G-6G07Q2S10N' },
});
app.use(store);
app.use(router);
app.use(Quasar, quasarUserOptions);
app.mount('#app');
