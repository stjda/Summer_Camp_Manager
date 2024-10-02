/**
 * Express router
 */
const express = require('express');
const router = express.Router();
const auth = require('./api/GoogleAuthentication_routes')
const newUser = require('./api/newuser_routes')
const redis = require('./api/cacheWithRedis')
const admin = require('./api/administrators')
const formData = require('./api/form_data_routes');
const deleteData = require('./api/delete_Routes')
// const logout = require('./api/logout_routes')
const login = require('./api/login_routes')
// for ping
// const ping = require('./api/ping_route')
// router.use('/ping', ping)
//for deleting things
router.use('/delete', deleteData)

// for the dashboard
router.use('/forms', formData)
// for signing out
// router.use('/logout', logout)
// for loging in directly
router.use('/login', login)
// for authentication
router.use('/auth', auth)
router.use('/signup', newUser)
// for caching
router.use('/redis', redis)
router.use('/admin', admin)
router.use((req, res) => {
    console.log(`No route matched for: ${req.method} ${req.path}`);
    res.status(404).send("❗❗ We missed the router ❗❗")
  })

module.exports = router;    