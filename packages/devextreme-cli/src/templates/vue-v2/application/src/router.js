import Vue from "vue";
import Router from "vue-router";

import auth from "./auth";

<%=^empty%>import Home from "./views/home-page";
import Profile from "./views/profile-page";
import Tasks from "./views/tasks-page";
<%=/empty%>import defaultLayout from "./layouts/<%=layout%>";
import simpleLayout from "./layouts/single-card";

Vue.use(Router);

const router = new Router({
  routes: [<%=#empty%>
    {
      path: "/",
      components: {
        layout: defaultLayout
      }
    },<%=/empty%><%=^empty%>
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
      path: "/tasks",
      name: "tasks",
      meta: { requiresAuth: true },
      components: {
        layout: defaultLayout,
        content: Tasks
      }
    },<%=/empty%>
    {
      path: "/login-form",
      name: "login-form",
      meta: { requiresAuth: false },
      components: {
        layout: simpleLayout,
        content: () =>
          import(/* webpackChunkName: "login" */ "./views/login-form")
      },
      props: {
        layout: {
          title: "Sign In"
        }
      }
    },
    {
      path: "/reset-password",
      name: "reset-password",
      meta: { requiresAuth: false },
      components: {
        layout: simpleLayout,
        content: () =>
          import(/* webpackChunkName: "login" */ "./views/reset-password-form")
      },
      props: {
        layout: {
          title: "Reset Password",
          description: "Please enter the email address that you used to register, and we will send you a link to reset your password via Email."
        }
      }
    },
    {
      path: "/create-account",
      name: "create-account",
      meta: { requiresAuth: false },
      components: {
        layout: simpleLayout,
        content: () =>
          import(/* webpackChunkName: "login" */ "./views/create-account-form")
      },
      props: {
        layout: {
          title: "Sign Up"
        }
      }
    },
    {
      path: "/change-password/:recoveryCode",
      name: "change-password",
      meta: { requiresAuth: false },
      components: {
        layout: simpleLayout,
        content: () =>
          import(/* webpackChunkName: "login" */ "./views/change-password-form")
      },
      props: {
        layout: {
          title: "Change Password"
        }
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
    }<%=/empty%><%=#empty%>
    {
      path: "*",
      redirect: "/"
    }<%=/empty%>
  ]
});

router.beforeEach((to, from, next) => {

  if (to.name === "login-form" && auth.loggedIn()) {
    next({ name: "home" });
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!auth.loggedIn()) {
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
