import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  // {
  //   path: '/',
  //   name: 'Home',
  //   component: Home
  // },

  {
    path: '/',
    name: 'layers',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "about" */ '../components/ThePanelTabsHorizontal.vue'
      ),
  },
  //{
  // path: '/suitability',
  // name: 'suitability',
  // route level code-splitting
  // this generates a separate chunk (about.[hash].js) for this route
  // which is lazy-loaded when the route is visited.
  // component: () => import(/* webpackChunkName: "about" */ '../components/ThePanelTabsHorizontal.vue')
  //  },
  {
    path: '/create',
    name: 'create',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "about" */ '../components/ThePanelTabsHorizontal.vue'
      ),
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),

  routes,
});

export default router;
