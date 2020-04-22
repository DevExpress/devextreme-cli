let authenticated = true;
export default {
  authenticated() {
    return authenticated;
  },
  logIn() {
    authenticated = true;
  },
  logOut() {
    authenticated = false;
  }
};
