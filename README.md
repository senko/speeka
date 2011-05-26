# Speeka - instant, anonymous chatrooms

Speeka is a web application for creating instant, anonymous chatrooms,
and is ideal for having quick conversations between people who aren't
neccessarily on the same social or IM network.

Speeka is written in node.js using now.js framework. The client side
is built using jQuery.

### Requirements

Speeka requires node.js and the following modules: nowjs, paperboy, uuid.

### Running Speeka

Since nowjs/socketio use websockets/flashsockets to connect the client
directly with the server, you can't run run Speeka behind a reverse proxy
that doesn't understand websockets.

In order to still be able to use it on a system that has port 80 served
by a normal web browser, nowjs is pulled from the port 7070 (expecting
the service to be listening there, and open to the public).

To customize this, change the port number in service.js as well as
the script url in web/index.html.

If you're running your own copy of Speeka, please run your own service
too, ie. don't connect to speeka.net server.

### Authors and Copyright

Speeka is open source and is licensed under a MIT-style license. See the
AUTHORS.txt file for the list of authors.

Patches and pull requests are welcome!
