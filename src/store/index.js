import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    counter: 0
  },
  mutations: {
    INCR_CNTR: (state, payload) => {
      console.log('INCR_CNTR')
      state.counter = state.counter + payload
    }
  },
  actions: {
    modifyCounter ({ commit }) {
      console.log('modifyCounter')
      const step = 1
      commit('INCR_CNTR', step)
    }
  },
  modules: {
  }
})
