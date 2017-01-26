/*jshint node:true, esversion:6 */
'use strict';

var TProEcc = require('tproecc_server');
var express_utils = require('./shared_libs/express_utils');
var tProEcc = new TProEcc();
var users_db = require('./shared_libs/users_db');
var session = require('express-session');
const  hash_lib = require('hash.js');


// start express server hosting lessons' static files
// port=3200, lesson number=2
var app = express_utils.startExpressServer(3300, 3);

// Use the session middleware
app.use(session({
    secret: 'session_secret', // secret used by express session middleware, please consult express session documentation for details
    saveUninitialized: false,
    resave: false,
    cookie: {
        maxAge: 60000
    }
}));

// redirect root directory to particular tutorial html page
app.get('/', function (req, res) {
    res.redirect("lesson03.html");
});

/*
getAuthenticationToken
*/
app.get('/getAuthToken/:userId', function (req, res) {
    var userId = req.params.userId;
    var authToken = tProEcc.rand();

    // check if user exists
    users_db.getUserPublicKey(userId, function (err, data) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (!data) {
            ////  res.status(400).send("no such user");
            //    return;
        }


        req.session.authToken = authToken;
        req.session.authenticated = false;
        req.session.pubkey = data;
        res.status(200).send(authToken);
    });
});

app.get('/doAuth/:signedAuthToken', function (req, res) {
    var signedAuthToken = req.params.signedAuthToken;
    var sessionAuthToken = req.session.authToken;
    var sessionPubKey = req.session.pubkey;

    // check if provided public key is valid (format and point on elliptic curve)
    var result = tProEcc.validatePublicKey(sessionPubKey);
    if (result.err !== null) {
        res.status(400).send("Invalid Public key:" + result.err);
        return;
    }

    var verifyResult = tProEcc.verifySignature(result.publicKey, hash_lib.sha256().update(sessionAuthToken).digest(), signedAuthToken);
    if (!verifyResult.result) {
        res.status(400).send('invalid auth token signature'+verifyResult.err);
        return;
    }
    req.session.authenticated = true;
    res.status(201).send('ok');
});

app.get('/restrictedCall', function (req, res) {
    console.log(req.session);
    if (req.session.authenticated) {
        res.status(200).send('ok');
    } else {
        res.status(403).send('user not authenticated');
    }
});
