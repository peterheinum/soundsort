const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { path, tap, prop } = require('ramda')
const { writeFileSync } = require('fs')
const { setSpotifyCredentials } = require('../redux/reducer')
const FormData = require('form-data')
const request = require('request')
const toJson = (response) => response.text()

const saveAuthOnFile = (state) => {
  console.log(state)
  writeFileSync('spotifyAuth.txt', JSON.stringify({ ...state }))
}

router.get('/', (req, res) => {
  const redirect_uri = encodeURIComponent('http://localhost:3000/authorization/callback')
  const scopes = 'playlist-read-collaborative%20playlist-read-private%20playlist-modify-private%20playlist-modify-public'
  const url = `https://accounts.spotify.com/authorize?client_id=${process.env.SPOTIFY_CLIENT_ID}&response_type=code&scope=${scopes}&redirect_uri=${redirect_uri}`
  res.redirect(url)
})

router.get('/callback', async (req, res) => {
  const options = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      'code': path(['query', 'code'])(req),
      'grant_type': 'authorization_code',
      'redirect_uri': 'http://localhost:3000/authorization/callback'
    },
    headers: {
      Authorization: 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64'))
    },
    json: true
  }

  const { body } = await request.post(options)
  const code = new URLSearchParams(body).get('code')
  console.log(code)
})

//   .then(setSpotifyCredentials)
//   .then(saveAuthOnFile)
//   // .then(() => res.redirect('/'))
// )

module.exports = router