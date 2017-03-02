Platform.Network.SocketBridge = { };

Platform.Network.SocketBridge.PACKET_HEADER_SIZE = 16;
Platform.Network.SocketBridge.PACKET_TYPE_OUT = 0;

/**
 * SocketBridge Packet
 *
 * @param {int} _packetId
 * @param {int} _routingKey
 * @param {int} _type
 * @param {Uint8Array} _data
 */
Platform.Network.SocketBridge.Packet = function(_packetId, _routingKey, _type, _data) {

	this.pid = _packetId;
    this.routingKey = _routingKey;
    this.type = _type;
	this.size = _data.length;
	this.data = _data;

    /**
     * Convert the packet to bytes
     *
     * @return {Uint8Array}
     */
    this.toBytes = function() {

        var thisPacket = this;

        var buffer = new ArrayBuffer(Platform.Network.SocketBridge.PACKET_HEADER_SIZE);
        var dataView = new DataView(buffer);

        dataView.setUint32(0, this.pid);
        dataView.setUint32(4, this.routingKey);
        dataView.setUint32(8, this.type);
        dataView.setUint32(12, this.size);

        var result = new Uint8Array(Platform.Network.SocketBridge.PACKET_HEADER_SIZE + thisPacket.size);
        result.set(new Uint8Array(buffer), 0);
        result.set(this.data, Platform.Network.SocketBridge.PACKET_HEADER_SIZE);

        return result;

    };

};

/**
 * SocketBridge Runner
 *
 * @param {Platform.Network.Transport} _transport
 */
Platform.Network.SocketBridge.Runner = function(_transport) {

    var thisRunner = this;

    /**
    * @type {int}
    */
    this.nextPacketId = 1;

    /**
    * @type {Array}
    */
    this.packetIdToResponseHandlerMap = new Array();

    /**
    * @type {Platform.Network.Transport}
    */
    this.netTransport = _transport;

    /**
    * @type {Platform.Network.SocketBridge.Packet}
    */
    this.incomingPacket = null;

    this.incomingPacketDataBytesRecvd = 0;

    /**
     * Send a request across the bridge
     *
     * @param {int} _routingKey
     * @param {Uint8Array} _data
     * @param {function} _responseFunc
     */
    this.send = function(_routingKey, _data, _responseFunc) {

        var pid = thisRunner.nextPacketId++;

        var packet = new Platform.Network.SocketBridge.Packet(
            pid,
            _routingKey,
            Platform.Network.SocketBridge.PACKET_TYPE_OUT,
            _data);

        this.packetIdToResponseHandlerMap[pid] = _responseFunc;

        thisRunner.netTransport.sendBytes(packet.toBytes());
    };

    this.netTransport.setupReceiver(function(_data) {

        var bytesReadFromData = 0;
        var dv = new DataView(_data.buffer);

        if (_data.length >= Platform.Network.SocketBridge.PACKET_HEADER_SIZE && thisRunner.incomingPacket === null) {
            var packetId = dv.getUint32(0);
            var routingKey = dv.getUint32(4);
            var packetType = dv.getUint32(8);
            var dataSize = dv.getUint32(12);

            thisRunner.incomingPacket = new Platform.Network.SocketBridge.Packet(packetId, routingKey, packetType, new Uint8Array(dataSize));

            thisRunner.incomingPacketDataBytesRecvd = 0;
            bytesReadFromData += Platform.Network.SocketBridge.PACKET_HEADER_SIZE;
        }

        if (thisRunner.incomingPacket !== null && thisRunner.incomingPacketDataBytesRecvd < thisRunner.incomingPacket.size) {

            var bytesToRead = _data.length - bytesReadFromData;

            var dataSlice = _data.slice(bytesReadFromData, Math.min(bytesReadFromData+thisRunner.incomingPacket.size, _data.length));
            thisRunner.incomingPacket.data.set(dataSlice, thisRunner.incomingPacketDataBytesRecvd);

            thisRunner.incomingPacketDataBytesRecvd += bytesToRead;
        }

        if(thisRunner.incomingPacketDataBytesRecvd >= thisRunner.incomingPacket.size) {
            thisRunner.packetIdToResponseHandlerMap[packetId](thisRunner.incomingPacket.data);
            thisRunner.incomingPacketDataBytesRecvd = 0;
            thisRunner.incomingPacket = null;
        }

    });
};
