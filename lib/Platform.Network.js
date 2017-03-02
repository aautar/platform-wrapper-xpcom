Platform.Network = { };

/**
 * Network transport object
 *
 * @param {nsISocketTransportService} _socketTransport
 *
 */
Platform.Network.Transport = function(_socketTransport) {

    this.socketTransport = _socketTransport;
    this.outputStream = this.socketTransport.openOutputStream(1, 0, 0);
    this.outputInterface = Components.classes["@mozilla.org/binaryoutputstream;1"].createInstance(Components.interfaces.nsIBinaryOutputStream);
    this.outputInterface.setOutputStream(this.outputStream);

    this.inputStream = this.socketTransport.openInputStream(0, 0, 0);

    this.pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(Components.interfaces.nsIInputStreamPump);
    this.pump.init(this.inputStream, -1, -1, 0, 0, true);

    /**
     * Send bytes over the transport
     *
     * @param {Uint8Array} _bytes
     */
    this.sendBytes = function(_bytes) {
        this.outputInterface.writeByteArray(_bytes, _bytes.length);
    };


    /**
    * Callback for receiver bytes received
    * @callback receiverBytesReceived
    * @param {Uint8Array} _bytes
    */

    /**
     * Setup a receiver, a function that will execute when bytes are received from the server
     *
     * @param {receiverBytesReceived} _onBytesReceived
     */
    this.setupReceiver = function(_onBytesReceived) {

        var listener = {
            onStartRequest: function(request, context) { },
            onDataAvailable: function(request, context, stream, offset, count) {

                var inputInterface = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);
                inputInterface.setInputStream(stream);

                var dataOut = inputInterface.readByteArray(count);
                _onBytesReceived(new Uint8Array(dataOut));
            },
            onStopRequest: function(request, context, result) {
                if (!Components.isSuccessCode(result)) {
                        // Error handling here
                }
            }
        };

        this.pump.asyncRead(listener, null);
        return true;
    };

};

/**
 * Create a Socket Transport
 *
 * @param {String} _host
 * @param {int} _port
 * @returns Platform.Network.createSocketTransport
 */
Platform.Network.createSocketTransport = function(_host, _port) {
    var transport = Components.classes["@mozilla.org/network/socket-transport-service;1"].getService(Components.interfaces.nsISocketTransportService).createTransport(null, 0, _host, _port, null);
    return new Platform.Network.Transport(transport);
};
