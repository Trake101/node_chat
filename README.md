Node Chat
=========

Node.JS chat that supports multiple rooms and switching between rooms.

Requirements
------------

This chat uses Node.JS so you obviously need that, it also uses MongoDB to store chat logs.

The following Node.JS modules are required:

* `express`
* `socket.io`
* `curl`
* `mongoose`
* `forever`

Installation
-----------

Pretty straight forward, just place the two files in the directory you wish to run it from.

You will need to make some changes in the code, in `chat.html` you will need to set the url for the chat and your desired port you want it to run over.  You will also need to update `app.js` to set the port as well.  Also, make sure that port is set to allow traffic.

Usage
-----

To run the chat on a temporary basis (good for testing):

	node app.js
	
To start the chat and never look back:

	forever start app.js