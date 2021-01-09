const state = {
  access_token: null,
  refresh_token: null,
  timestamp: null
}

const getState = () => ({ ...state })

module.exports = { state, getState }