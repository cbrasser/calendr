import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: undefined,
  },
  mutations: {
    setUser(state, user) {
      console.log(state);
      console.log(user);
      state.user = user;
    },
  },
  actions: {
    async updateUser({ commit }, payload) {
      let user;
      const { name, mail, photoUrl } = payload;
      if (payload) {
        user = {
          name,
          mail,
          photoUrl,
        };
      } else {
        user = payload;
      }
      console.log(user);
      commit('setUser', user);
    },
  },
  modules: {},
});
