const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');


const GuardPassword = require("../middleware/GuardPassword");
const GuardLimiter = require("../middleware/GuardLimiter");

router.post('/signup', GuardPassword, userCtrl.signup);
router.post('/login', GuardLimiter, userCtrl.login);

module.exports = router; 