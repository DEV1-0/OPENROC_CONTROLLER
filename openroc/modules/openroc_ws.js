/*******************************************************************************
 * PROJET : OpenROC
 * @author 2015-2016 Eric Papet <e.papet@dev1-0.com.com>
 * @see The GNU Public License (GPL)
 *
 *******************************************************************************
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 * or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 *******************************************************************************/
var logger = require('log4js').getLogger('openroc_core');
var util = require('util');
//Horodatage
var moment = require('moment');
moment.locale('fr');
//
var model;

function WebSocket(m) {
    model = m;
    logger.debug("WebSocket Model instantiate \n [%s]", util.inspect(model));
}

WebSocket.prototype.start = function start(nodes, httpd, cb) {
    //
    sio.listen(httpd, {log: false});
    logger.debug("WebSocket Started");
    sio.sockets.on('connection', function (socket) {
        logger.debug("Websocket Page Connected with Ip: [%s]", socket.handshake.address);
        // service
        sio.sockets.emit("init_services", model);
        // gw
        nodes.initAllSensors();
    });
    cb();
}

module.exports = WebSocket;

