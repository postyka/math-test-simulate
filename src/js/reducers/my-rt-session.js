import * as rt from '../lib/gamesparks-rt';

var myRTSession = function() {};

myRTSession.started = false;
myRTSession.onPlayerConnectCB = null;
myRTSession.onPlayerDisconnectCB = null;
myRTSession.onReadyCB = null;
myRTSession.onPacketCB = null;
myRTSession.session = null;

myRTSession.start = function(connectToken, host, port) {
    var index = host.indexOf(":");
    var theHost;

    if (index > 0) {
        theHost = host.slice(0, index);
    } else {
        theHost = host;
    }

    console.log(theHost + " : " + port);

    myRTSession.session = GameSparksRT.getSession(connectToken, theHost, port, myRTSession);
    if (myRTSession.session != null) {
        myRTSession.started = true;

        myRTSession.session.start();
    } else {
        myRTSession.started = false;
    }
};

myRTSession.stop = function() {
    myRTSession.started = false;

    if (myRTSession.session != null) {
        myRTSession.session.stop();
    }
};

myRTSession.log = function(message) {
    var peers = "|";

    for (var k in myRTSession.session.activePeers) {
        peers = peers + myRTSession.session.activePeers[k] + "|";
    }

    console.log(myRTSession.session.peerId + ": " + message + " peers:" + peers);
};

myRTSession.onPlayerConnect = function(peerId) {
    myRTSession.log(" OnPlayerConnect:" + peerId);

    if (myRTSession.onPlayerConnectCB != null) {
        myRTSession.onPlayerConnectCB(peerId);
    }
};

myRTSession.onPlayerDisconnect = function(peerId) {
    myRTSession.log(" OnPlayerDisconnect:" + peerId);

    if (myRTSession.onPlayerDisconnectCB != null) {
        myRTSession.onPlayerDisconnectCB(peerId);
    }
};

myRTSession.onReady = function(ready) {
    myRTSession.log(" OnReady:" + ready.toString());

    if (myRTSession.onReadyCB != null) {
        myRTSession.onReadyCB(ready);
    }
};

export default myRTSession;
