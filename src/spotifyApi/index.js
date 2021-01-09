const fetch = require('node-fetch')
const { prop, map, pipe, project, addIndex, path, tap } = require('ramda')
const { getState } = require('../redux/state')
const { getHeaders, toJson } = require('../utils')
const mapIndexed = addIndex(map)

const BASEURL = 'https://api.spotify.com'

const getUserId = path(['owner', 'id'])

const filterOwnPlaylists = (playlists) => {
  const userId = getUserId(playlists.find(({owner}) => owner.display_name !== owner.id))
  return playlists.filter(({owner}) => owner.id === userId)
}
const getUserPlaylists = () => fetch(`${BASEURL}/v1/me/playlists?limit=50`, getHeaders())
.then(toJson)
.then(pipe(
  prop('items'),
  project(['id', 'name', 'owner']),
  filterOwnPlaylists,
  mapIndexed((obj, index) => ({ ...obj, index }))
))

const createNewPlaylist = (playlist) => fetch(`${BASEURL}/v1/users/${getUserId(playlist)}/playlists`, {
  ...getHeaders(),
  method: 'post',
  body: JSON.stringify({
    public: true,
    name: prop('name')(playlist) + '_sorted'
  })
})
.then(toJson)
.then(prop('id'))

const original = '1wYRmxrSdQ9LK1amh41YfA'

const TEMP = '5xVPM4WbWnTXRfM2OtwvGt'

const getPlaylistTracks = ({id}) => fetch(`${BASEURL}/v1/playlists/${id}/tracks`, getHeaders())
  .then(toJson)
  .then(pipe(
    prop('items'),
    map(path(['track', 'id']))
  ))

const sortAndFormatUris = (tracks) => tracks
.sort((a, b) => a.tempo - b.tempo)
.map(prop('id'))
.map(id => `spotify:track:${id}`)

const createSortedPlaylist = playlist => getPlaylistTracks(playlist)
  .then(tracks => Promise.all([createNewPlaylist(playlist), getAudioFeaturesForTracks(tracks)]))
  .then(tap(([newPlaylistId, tracks]) => {
    console.log(newPlaylistId) 
    console.log(sortAndFormatUris(tracks))
  }))
  .then(([newPlaylistId, tracks]) => fetch(`${BASEURL}/v1/playlists/${newPlaylistId}/tracks`, {
    ...getHeaders(),
    method: 'post',
    body: JSON.stringify({
      uris: sortAndFormatUris(tracks)
    })
  }))
  .then(toJson)

const getAudioFeaturesForTracks = ids => fetch(`${BASEURL}/v1/audio-features?ids=${ids.join(',')}`, getHeaders())
  .then(toJson)
  .then(prop('audio_features'))
  .then(project(['tempo', 'id'])) 

  // todo allow sorting with all these props (maybe)
  // danceability: 0.387,
  // energy: 0.687,
  // key: 10,
  // loudness: -8.694,
  // mode: 0,
  // speechiness: 0.0948,
  // acousticness: 0.0118,
  // instrumentalness: 0.00432,
  // liveness: 0.39,
  // valence: 0.117,
  // tempo: 89.968,
  // type: 'audio_features',
  // id: '4foN3AgfisWaOpiNX5bord',
  // uri: 'spotify:track:4foN3AgfisWaOpiNX5bord',
  // track_href: 'https://api.spotify.com/v1/tracks/4foN3AgfisWaOpiNX5bord',
  // analysis_url: 'https://api.spotify.com/v1/audio-analysis/4foN3AgfisWaOpiNX5bord',
  // duration_ms: 412868,
  // time_signature: 4

module.exports = { 
  getUserPlaylists,
  createNewPlaylist,
  createSortedPlaylist
}