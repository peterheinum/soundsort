const { state, getState } = require('./state')
const savedState = require('../../spotifyAuth.json')

const setSpotifyCredentials = ({ access_token, refresh_token }) => Object.assign(state, {
  access_token,
  refresh_token,
  timestamp: Date.now() 
})

const reducers = {
  setSpotifyCredentials
}

module.exports = {
  ...reducers
}

const init = () => setSpotifyCredentials(savedState)
init()
