const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const exjwt = require('express-jwt')

// instantiating the express app
const app = express()

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
  next()
})

// setting up bodyparser to use json and set it to req.body
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// instantiating the express-jwt middleware
const jwtMW = exjwt({
  secret: 'secret'
})

// Mocking DB just for test
let users = [
  {
    id: 1,
    email: 'start@inc.com',
    password: 'hello'
  },
  {
    id: 2,
    email: 'me@yahoo.com',
    password: 'me'
  }
]

// login route
app.post('/login', (req, res) => {
  const { email, password } = req.body

  // promise used here to check if user credentials are correct, if not, return unathorized
  new Promise((resolve, reject) => {
    let respJSON = {
      success: false,
      token: null,
      err: 'Email or password is incorrect'
    }

    for (let user of users) {
      if (email === user.email && password === user.password) {
        // if all credentials are correct do this
        let token = jwt.sign({ id: user.id, email: user.email }, 'secret', { expiresIn: 129600 })
        let respJSON = {
          success: true,
          err: null,
          token
        }
        resolve(respJSON)
      }
    }

    if (respJSON.success === false) {
      reject(respJSON)
    }
  }).then(function (result) {
    res.json(result)
  })
    .catch((err) => res.status(401).json(err))
})

app.get('/', jwtMW, (req, res) => {
  res.send('You are authenticated') // sending some response when authenticated
})

// error handling
app.use(function (err, req, res, next) {
  if (err.name === 'AnauthorizedError') { // send error rather than show it on the console
    res.status(401).send(err)
  } else {
    next(err)
  }
})

// starting the app on PORT 3000
// hence server PORT 8080
const PORT = 8080
app.listen(PORT, () => {
  console.log(`Magic happens on port ${PORT}`)
})
