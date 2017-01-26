/*jshint node:true, esversion:6 */
'use strict';

var TProEcc = require('tproecc_server');
var express_utils = require('./shared_libs/express_utils');
var tProEcc = new TProEcc();
var users_db = require('./shared_libs/users_db');

// start express server hosting lessons' static files
// port=3200, lesson number=2
var app = express_utils.startExpressServer(3200, 2);

// redirect root directory to particular tutorial html page
app.get('/', function (req, res) {
    res.redirect("lesson02.html");
});

/*
   GET /registerUser/{userId}/{publicKeyHex}

   Request arguments:
   •	userId (required) – name of the user to be created
   •	publicKeyHex (required) – hex representation of the public key linked with the user

   Request response:
   Returned if the user was successfully registered.

   HTTP/1.1 201 Created
   Content-Type: text/html; charset=utf-8
   ok
*/
app.get('/registerUser/:userId/:publicKeyHex', function (req, res) {
    var userId = req.params.userId;
    var publicKeyHex = req.params.publicKeyHex;

    // check if provided public key is valid (format and point on elliptic curve)
    var result = tProEcc.validatePublicKey(publicKeyHex);
    if (result.err !== null) {
        res.status(400).send("invalid public key:" + result.err);
        return;
    }

    // store public key in database as a part of user's record,
    // which allows us to identify, that this particular user
    // owns token with corresponding public key
    users_db.registerUser(userId, publicKeyHex, function (err, data) {
        if (err) {
            res.status(500).send(err);
            return;
        }
        if (data) res.status(201).send("ok");
        else
            res.status(400).send("user already exists");
    });
});
/*
   GET /verifySignature/{userId}/{messageDigest}/{signatureHex}

   Request arguments:
   •	userId (required) – name of the user, public key of the user will be used for verification
   •	messageDigest (required) – digest of the signed message (hex format)
   •	signature (required) – signature (hex format)

   Request response:
   Returned if userId was already registered

   HTTP/1.1 200 Created
   Content-Type: text/html; charset=utf-8
   true|false
*/
app.get('/verifySignature/:userId/:messageDigest/:signature',
    function (req, res) {
        var userId = req.params.userId,
            messageDigest = req.params.messageDigest,
            signatureHex = req.params.signature;

        users_db.getUserPublicKey(userId, function (err, data) {
            if (err) {
                res.status(500).send(err);
                return;
            }
            if (!data) {
                res.status(400).send("no such user");
                return;
            }
            // check if provided public key is valid (format and point on elliptic curve)
            var result = tProEcc.validatePublicKey(data);
            if (result.err !== null) {
                console.log(result);
                res.status(400).send("Public key:" + result.err);
                return;
            }

            var verifyResult = tProEcc.verifySignature(result.publicKey, messageDigest,
                signatureHex);
            if (!verifyResult.result) {
                res.status(400).send(verifyResult.result.toString() + ":" + verifyResult.err);
                return;
            }
            res.status(201).send(verifyResult.result.toString());
        });
    });
