/*jslint node: true */
'use strict';

var tingo_lib = require('tingodb')();
// access embedded database

function registerUser(userId, publicKeyHex, callback) {
    // store user in database if not already existing
    var collection = new tingo_lib.Db('users.db', {}).collection('users');

    collection.findOne({
        userid: userId
    }, function (err, result) {

        if (err !== null) {
            console.error(err);
            callback(err, false);
            return;
        }

        if (result !== null) {
            // user already exists
            callback(null, false);
            return;
        }

        collection.insert({
            userid: userId,
            pubkey: publicKeyHex
        }, function (err) {
            if (err !== null) {
                callback(err, false);
            }
            callback(null, true);
        });
    });
}

function getUserPublicKey(userId, callback) {
    var collection = new tingo_lib.Db('users.db', {}).collection('users');

    collection.findOne({
        userid: userId
    }, function (err, result) {
        if (err !== null) {
            console.error(err);
            callback(err, null);
            return;
        }
        if (result === null) {
            callback(null, null);
        } else {
            callback(null, result.pubkey);
        }
    });
}

module.exports.registerUser = registerUser;
module.exports.getUserPublicKey = getUserPublicKey;
