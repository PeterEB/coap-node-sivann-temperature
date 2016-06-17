var Temperature = module.exports = function Temperature(options) {
    if (!(this instanceof Temperature)) { return new Temperature(options); }
    var self = this;

    if (!options) {
        options = {};
    }

    this.oid = options.oid || 'temperature';
    this.iid = options.iid;
    this.resrcs = options.resrcs || {
        sensorValue: {
            read: function (cb) {
                tempRead(self._board, cb);
            }
        },
        units: 'C'
    };

    this.pinMode = options.pinMode || { pin: 'I2C', mode: 'I2C'};
    this.interval = options.interval || 1000;
    this.readResrcHdlr = options.readResrcHdlr || null;

    this._board = null;
};

Temperature.prototype.init = function (hal, iid) {
    if (!hal) throw Error('hal does not exist.'); 

    this._board = hal;

    if (iid) 
        this.iid = iid;

    this._board.i2cConfig();
};

function tempRead(board, callback) {
    board.i2cWrite(0x40, [0xF3]);

    setTimeout(function () {
        board.i2cReadOnce(0x40, 3, function (tBuf) {
            var tRaw = tBuf[0] * 256 + tBuf[1],
                t = (175.72 * tRaw / 65536) - 46.85;

            callback(null, t.toFixed(2));
        });
    }, 100);
}
