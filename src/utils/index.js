const { pipe } = require("ramda")
const { getState } = require("../redux/state")

const call = fn => obj => obj[fn]()

const authHeaders = ({ access_token }) => ({
  headers: {
    'Authorization': 'Bearer ' + access_token,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

const toJson = call('json')
const toText = call('text')

const getHeaders = pipe(
  getState,
  authHeaders
)

module.exports = {
  getHeaders,
  toJson,
  toText
}