/*jshint node:true, esversion:6 */
'use strict';

var express_lib = require('express');
var morgan = require('morgan');

// publish public forlder via express module

var currentLessonNumber = 1;

// checks if requested file belongs to currently running lesson
function checkLessonURL(req, res, next) {
    var foundLesson = req.url.match(/\/lesson([0-9][0-9])\.html/);
    if (foundLesson) {
        var lessonNum = parseInt(foundLesson[1], 10);
        if (lessonNum !== currentLessonNumber) {
            res.send("If you want start another lesson, please run corresponding" +
                "server side as noted in readme file.");
            return;
        }
    }
    next();
}

// start express server on TCP_PORT
function startExpressServer(tcpPort, lessonNumber) {
    var app = express_lib();
    currentLessonNumber = lessonNumber;

    // add check lesson url middleware
    app.use(checkLessonURL);
    // add static html content middleware
    app.use(express_lib.static('public_html'));
    // enable morgan rest url logger
    app.use(morgan('combined'));

    app.listen(tcpPort, function () {
        console.log('TPro Ecc token rest application Lesson0' + lessonNumber + ' listening on port ' + tcpPort);
        console.log('Run you browser and open location http://localhost:' + tcpPort);
        console.log();
    });

    // catch exception to detect if server port is already opened
    process.on('uncaughtException', function (err) {
        // if port alreaady in use
        if (err.errno === 'EADDRINUSE') {
            console.log('Error - port: ' + tcpPort + ' already in use');
        } else {
            console.log(err);
        }
        process.exit(1);
    });
    return app;
}

module.exports.startExpressServer = startExpressServer;
