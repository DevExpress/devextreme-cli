let authenticated = true;
export default {
  athenticated() {
    return authenticated;
  },
  logIn() {
    authenticated = true;
  },
  logOut() {
    authenticated = false;
  }
};
