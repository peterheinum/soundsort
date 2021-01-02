const express = require('express')
const router = express.Router()
const fetch = require('node-fetch')
const { path, tap } = require('ramda')
const { writeFileSync } = require('fs')
const { setSpotifyCredentials } = require('../redux/reducer')
const FormData = require('form-data')

const toJson = (response) => response.json()

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


const createFormData = (req) => {
  const form = new FormData()
  form.append('code', path(['query', 'code'])(req))
  form.append('grant_type', 'authorization_code')
  form.append('redirect_uri', 'http://localhost:3000/authorization/callback')
  return form
}

router.get('/callback', (req, res) => fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',    
    headers: {
      Authorization: 'Basic ' + (Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
      'Content-Type': 'application/json'
    },
    body: {
      form: createFormData(req)
    }
  })
  .then(tap(console.log))
  .then(toJson)
  .then(setSpotifyCredentials)
  .then(saveAuthOnFile)
  .then(() => res.redirect('/'))
)

module.exports = router