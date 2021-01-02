require('dotenv').config()
const opn = require('opn')
const express = require('express')()
const http = require('http').createServer(express)
const bodyParser = require('body-parser')
const compression = require('compression')
const { state } = require('./redux/state')
//Express config
express.use(compression())
express.use(bodyParser.json())
express.use(bodyParser.urlencoded({ extended: true }))
express.use('/authorization', require('./authorization/spotifyAuth'))
express.use(require('express').static('public'))

express.get('/', (req, res) => {
  const { access_token, timestamp } = state
  if (!access_token || !(Date.now() - timestamp < 3600000)) {
    res.redirect('/authorization')
    return
  }

  console.log('Lets go')
})

opn('http://localhost:3000/', {app: ['chrome']})

http.listen(3000, () => console.log('Server is listening, port 3000'))
