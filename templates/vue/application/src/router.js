import Vue from "vue";
import Router from "vue-router";

import auth from "./auth";

<%=^empty%>import Home from "./views/home";
import Profile from "./views/profile";
import DisplayData from "./views/display-data";
<%=/empty%>import defaultLayout from "./layouts/<%=layout%>";
import simpleLayout from "./layouts/single-card";

Vue.use(Router);

const router = new Router({
  routes: [<%=^empty%>
    {
      path: "/home",
      name: "home",
      meta: { requiresAuth: true },
      components: {
        layout: defaultLayout,
        content: Home
      }
    },
    {
      path: "/profile",
      name: "profile",
      meta: { requiresAuth: true },
      components: {
        layout: defaultLayout,
        content: Profile
      }
    },
    {
      path: "/display-data",
      name: "display-data",
      meta: { requiresAuth: true },
      components: {
        layout: defaultLayout,
        content: DisplayData
      }
    },<%=/empty%>
    <%=#empty%>{
      path: "/",
      components: {
        layout: defaultLayout
      }
    },<%=/empty%>
    {
      path: "/login-form",
      name: "login-form",
      meta: { requiresAuth: false },
      components: {
        layout: simpleLayout,
        // route level code-splitting
        // this generates a separate chunk (login.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        content: () =>
          import(/* webpackChunkName: "login" */ "./views/login-form")
      }
    },<%=^empty%>
    {
      path: "/",
      redirect: "/home"
    },
    {
      path: "/recovery",
      redirect: "/home"
    },
    {
      path: "*",
      redirect: "/home"
    }<%=/empty%>
    <%=#empty%>{
      path: "*",
      redirect: "/"
    }<%=/empty%>
  ]
});

router.beforeEach((to, from, next) => {

  if (to.name === "login-form" && auth.authenticated()) {
    next({ name: "home" });
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.authenticated()) {
      next({
        name: "login-form",
        query: { redirect: to.fullPath }
      });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;
