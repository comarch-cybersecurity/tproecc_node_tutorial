# tProEcc Node.js Tutorial
code version 1.0.96

> This project is dedicated for TProEcc device owners. If you don't posses TProEcc value of presented subjects will be very limited for you.

TProEcc is a cryptographical device based on Elliptic Curves Cryptography. If you want to know a little bit more about availability of the device and its features please refer to: http://tpro.comarch.com/.
Moreover, in order to gain basic intel onto accessing token's functionalities, please refer to [User's Guide](https://github.com/comarch-cybersecurity/tproecc_node_tutorial/tree/master/public_html/documentation). 


TProEcc tutorial is provided to gradually improve your understanding regarding TProEcc Token functionality and how to embed it into your own web application.

Complete tutorial is split into four lessons:

- Lesson 1 - token management (initialization, pin operations), user registration
- Lesson 2 - digital signature creation and verification
- Lesson 3 - web session authentication

Reason of the splitting is to make lessons as simple as possible and to avoid potential
confusion, what is really necessary to implemented to make lesson running.

## Installation
### Environment preparation

Tutorial requires [Node.js](https://nodejs.org/) v6+ to run. Please install version dedicated to your operating systems. Installation package is typically bundled with **npm** Node Package Manager tool. You can check completeness of your environment by running following commands (just using command line interface of your operating system).

```sh
> node --version
> npm version
```

Please check, whether reported node version is at least 6.0.0, expected npm version should be at least 3.10.5.

### Unpack and run

Download and extract [latest release](https://github.com/comarch-cybersecurity/tproecc_node_tutorial/archive/master.zip) of the tutorial archive or alternatively directly clone git repository by using shell command:
```sh
> git clone https://github.com/comarch-cybersecurity/tproecc_node_tutorial
```

Now it's time to install dependencies and start your chosen lesson. To do so again switch to command line interface, change directory in the location to which you extracted provided archive and type:

```sh
> cd tproecc_node_tutorial
> npm install
> node lesson01.js
```

You can access another lessons by running node with lesson name parameter:

For lesson02:
```sh
> node lesson02.js
```
For lesson03:
```sh
> node lesson03.js
```

Each lesson starts http server at unique port number, so that you can run several lessons simultaneously.
After starting chosen lesson, please launch your browser at open lesson's url, for lesson 1 - http://localhost:3100. __Corresponding url's are presented by every lesson after starting.__
>Please note, that lesson X browser code communicates with lesson X server code, so that you must start corresponding server code to play with particular lesson. For instance if you want to try lesson 3, you have to run "node lesson03.js" before this.

It's highly recommended to start your training from the first lesson, because latter lessons are based on operations (like user registration), which are available in previous ones.

## Tech
Complete integration of token into your application requires change at the browser side (communication with token) and server side (verification of signature and association between public key and token owner).
Provided tutorial is compatible at client side with any modern HTML5 browser, at server side it uses popular **Node.js** technology.
Node.js tutorial module relies on the following dependencies as defined in **package.json** file.

- [TProEcc_Server](http://npmjs.com/package/tproecc_server) - core API, which supports integration of TProEcc token into node.js applications
- [ExpressJs](http://expressjs.com) - minimalist web framework, used to expose RestAPI endpoints
- [ExpressSession](https://www.npmjs.com/package/express-session) - add-on to ExpressJs, which simplifies session management, used in web page authentication lesson
- [Tingodb](http://www.tingodb.com) - embeddable [MongoDB](http://www.mongodb.com) like NoSql database, used to store users' database with associated public keys
- [Morgan](https://www.npmjs.com/package/morgan) - http request logger utility, usable for accounting web service activity

## Files structure

### Directories
```sh
├───public_html                 -- client side files (http, js, styles, docs)
│   ├───documentation           -- contains "User's guide" for tPro Ecc in .pdf format
│   ├───doc_Client              -- contains documentation files for client API
│   ├───doc_Client_Simple       -- contains documentation files for simplified client API
│   ├───doc_Client_Server       -- contains documentation files for server API
│   ├───imgs                    -- images
│   ├───tproecc_client          -- browser module used to communicate with tProEcc device
│   └───tproecc_client_simple   -- simplified browser module used to communicate with tProEcc device
├───shared_libs                 -- shared libraries used by node server side lessons
└───users.db                    -- users database
```

## Contact
In case of any questions, doubts, comments, bugs - please [email us](mailto:tpro@comarch.com).
