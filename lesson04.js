const EC_lib = require('elliptic').ec;
const express_lib = require('express');
const crypto_lib = require('crypto');
const hash_lib=require('hash.js');
const tingo_lib = require('tingodb')();
const ec = new EC_lib('p256');
const njwt_lib = require('njwt');

// secret key used to sign authentication and authorization tokens
var JWT_TOKEN_KEY = "secret_key";

var express = express_lib();
// access embedded database
var db = new tingo_lib.Db('users.db', {});
var collection = db.collection('users');
express.use(express_lib.static('public'));


function sendDBErrorResponse(err, response) {
  console.log( err );
  response.status(500).send('db error - '+err);
}

function cryptoValidatePublicKey( publicKeyHex ) {
  var validated = false;
  try {
    //decode ecc public key from hex representation
    var publicKey = ec.keyFromPublic(publicKeyHex, 'hex');

    // validate if decoded public key is valid
    var validationResult = publicKey.validate();
    if( validationResult.result == false ) throw new Error(validationResult.reason);
    validated = true;
  }
  catch( err ) {
    console.log(err);
  }
  return validated;
}

function cryptoGenerateRand(){
  return crypto_lib.randomBytes(32).toString('hex');
}

/**
 *  @param {string} publicKey - hex public key to verify signature with
 *  @param {string} msg - message which pretends to be signatureValidation
 *  @param {string} signature - signature of message
 */
function cryptoVerifySignature( publicKey, msg, signature ){
  var result = {err:null, verified:false};

  // decode public key
  var publicKey = ec.keyFromPublic(result.pubkey, 'hex');
  // calculate digest
  var msgDigest = hash_lib.sha256().update(msg).digest();
  try
  {
    // validate signature
    result.verified = publicKey.verify( msgDigest, signature );
  }
  catch(err)
  {
    result.err = err;
  }
  return result;
}

/*
showdb
*/
express.get('/showdb', function (req, res) {
console.log("showdb");
collection.find({}).toArray(function(err, results){
    console.log(results);
    res.status(400).send(results);
});

});

/*
registerUser
*/
express.get('/registerUser/:userId/:publicKeyHex', function (req, res) {
  console.log( "* registerUser *");
  console.log(req.url);
  var userId = req.params['userId'];
  var publicKeyHex = req.params['publicKeyHex'];

  // check if provided public key is valid (format and point on elliptic curve)
  if( cryptoValidatePublicKey( publicKeyHex ) == false ) {
    res.status(400).send("invalid public key");
    return;
  }

  // store user in database if not already existing
  collection.findOne({userid:userId}, function(err,result) {
    if(err!=null) { sendDBErrorResponse(err, res); return; }
    if(result != null) { res.status(400).send('user already exists'); return; }

    collection.insert({userid:userId, pubkey:publicKeyHex}, function(err, result) {
      if(err!=null) { sendDBErrorResponse(err, res); return; }
      res.status(200).send('ok');
      console.log(result);
    });
  });

});

/*
getLogonToken
*/
express.get('/getAuthenticationToken/:user_id', function (req, res) {
  var userId = req.params['user_id'];
  var randString = cryptoGenerateRand();

  collection.findOne({userid:userId}, function(err,result) {
    if(err!=null) { sendDBErrorResponse(err, res); return; }
    if(result == null) { res.status(400).send('user not found'); return; }

    var jwt = njwt_lib.create( {user:userId, rand:randString, authenticated:"false"},
                               JWT_TOKEN_KEY);
    jwt.setExpiration(new Date().getTime() + (1*60*1000)); // One minute from now
    res.status(200).send(jwt.compact());
  });
});

/*
doAuthenticate
*/
express.get('/doAuthenticate/:authenticationToken/:signature', function (req, res) {
  var authenticationToken = req.params['authenticationToken'];
  var signature = req.params['signature'];

  njwt_lib.verify(authenticationToken,JWT_TOKEN_KEY,function(err,verifiedJwt){
    if(err){
      console.log("authentication token: err.message");
      res.status(400).send("authenticationToken"+err.userMessage);
      return;
    }
    console.log(verifiedJwt); // Will contain the header and body
    var userId = verifiedJwt.body.user;
    var authenticated = verifiedJwt.body.authenticated;

    if( authenticated != "false") {res.status(400).send('invalid authentication token'); return;}
    console.log( "tokenAuthenticated ");

    collection.findOne({userid:userId}, function(err,result) {
      if(err!=null) { sendDBErrorResponse(err, res); return; }
      if(result == null) {res.status(400).send('user not found'); return;}

      /*var verifyResult = cryptoVerifySignature( result.pubkey, authenticationToken, signature );
      if(verifyResult.err != null) {
        console.log(verifyResult.err);
        res.status(200).send('invalid signature format');
        return;
      }*/
      //console.log(verifyResult);
      var jwt = njwt_lib.create( {user:userId, authenticated:"true"},
                                 JWT_TOKEN_KEY);
      res.status(200).send(jwt.compact());
    });
  });
});

express.get('/restrictedAPI/:message/:authorizationToken', function (req, res) {
  var authorizationToken = req.params['authorizationToken'];
  var message = req.params['message'];

  njwt_lib.verify(authorizationToken,JWT_TOKEN_KEY,function(err,verifiedJwt){
    if(err){
      console.log("authorizationToken: err.message");
      res.status(400).send("authorizationToken:"+err.userMessage);
      return;
    }
    var userId = verifiedJwt.body.user;
    var authenticated = verifiedJwt.body.authenticated;
    if( authenticated != "true") {res.status(400).send('invalid authorization token'); return;}
    res.status(200).send("user: "+userId+ " your message: "+message);
  });
});



express.listen(3000, function () {
  console.log('TPro Ecc token rest application listening on port 3000!');
});
