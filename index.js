/*jshint node:true, esversion:6 */
'use strict';

var TProEcc = require('tproecc_server');
var express_utils = require('./shared_libs/express_utils');
var tProEcc = new TProEcc();
var users_db = require('./shared_libs/users_db');




// var express = require('express');
// var app = express();

// app.set('port', (process.env.PORT || 5000));

// app.use(express.static(__dirname + '/public'));

// // views is directory for all template files
// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');

// app.get('/', function(request, response) {
  // response.render('pages/index');
// });

// app.listen(app.get('port'), function() {
  // console.log('Node app is running on port', app.get('port'));
// });









// start express server hosting lessons' static files
// port=3100, lesson number=1
var app = express_utils.startExpressServer((process.env.PORT || 5000), 1);

// redirect root directory to particular tutorial html page
app.get('/', function (req, res) {
    res.redirect("lesson01.html");
});

/*
   GET /registerUser/{userId}/{publicKeyHex}

   Request arguments:
   •  userId (required) – name of the user to be created
   •  publicKeyHex (required) – hex representation of the public key linked with the user

   Request response:
   Returned if the user was successfully registered.

   HTTP/1.1 201 Created
   Content-Type: text/html; charset=utf-8
   ok
*/
app.get('/registerUser/:userId/:publicKeyHex', function (req, res) {
    var userId = req.params.userId,
        publicKeyHex = req.params.publicKeyHex,
        result;

    // check if provided public key is valid (format and point on elliptic curve)
    result = tProEcc.validatePublicKey(publicKeyHex);

    if (result.err !== null) {
        res.status(400).send('invalid public key:' + result.err);
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
        if (data) {
            res.status(201).send('ok');
        } else {
            res.status(400).send('user already exists');
        }
    });
});
