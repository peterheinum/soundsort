const { state } = require('./state')

const setSpotifyCredentials = ({ access_token, refresh_token }) => {
  console.log(access_token, refresh_token)
  Object.assign(state, { access_token, refresh_token, timestamp: Date.now() })
}
const reducers = {
  setSpotifyCredentials
}

module.exports = {
  ...reducers
}