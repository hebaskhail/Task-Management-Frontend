import { createStore } from 'vuex';

export default createStore({
  state: {
    user: null,
    token: null
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload.user;
      state.token = payload.token;
    },
    clearUser(state) {
      state.user = null;
      state.token = null;
    }
  }
});