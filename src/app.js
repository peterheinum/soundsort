require('dotenv').config()
const opn = require('opn')
const prompt = require('prompt')
const { join } = require('path')
const express = require('express')()
const http = require('http').createServer(express)
const bodyParser = require('body-parser')
const compression = require('compression')
const reducer = require('./redux/reducer')
const { getState } = require('./redux/state')
const { getUserPlaylists, createNewPlaylist, createSortedPlaylist } = require('./spotifyApi')
const { pipe, props, equals, prop } = require('ramda')

/* Express config */
express.use(compression())
express.use(bodyParser.json())
express.use(bodyParser.urlencoded({ extended: true }))
express.use('/authorization', require('./authorization/spotifyAuth'))
express.use(require('express').static('public'))

express.get('/', (req, res) => res.sendFile(join(`${__dirname}/public/index.html`)))

const init = async () => {
  const { access_token, timestamp } = getState()
  if(!access_token || !(Date.now() - timestamp < 3600000)) {
    opn('http://localhost:3000/authorization', {app: ['chrome'], allowNonzeroExitCode: true, wait: true}) 
    return
  }

  const playlists = await getUserPlaylists()
  playlists.forEach(pipe(
    props(['name', 'index']),
    ([name, index]) => console.log(`${index}: ${name}`)
  ))
  
  prompt.start()
  
  prompt.get(['choice'], (err, { choice }) => {
    const chosenPlaylist = playlists.find(playlist => playlist.index == choice)
    console.log(chosenPlaylist)
    createSortedPlaylist(chosenPlaylist).then(console.log)
  })
}

init()

http.listen(3000)
