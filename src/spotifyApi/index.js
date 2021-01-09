const fetch = require('node-fetch')
const { prop, map, pipe, project, addIndex } = require('ramda')
const { getState } = require('../redux/state')
const { getHeaders, toJson } = require('../utils')
const mapIndexed = addIndex(map)

const BASEURL = 'https://api.spotify.com'

const filterOwnPlaylists = (playlists) => {
  const userId = playlists.find(({owner}) => owner.display_name !== owner.id).owner.id
  return playlists.filter(({owner}) => owner.id === userId)
}
const getUserPlaylists = () => fetch(`${BASEURL}/v1/me/playlists`, getHeaders())
.then(toJson)
.then(pipe(
  prop('items'),
  project(['id', 'name', 'owner']),
  filterOwnPlaylists,
  mapIndexed((obj, index) => ({ ...obj, index }))
))

module.exports = { 
  getUserPlaylists
}