/*******************************************************************************
 * PROJET : OpenROC
 * @author 2015-2016 Eric Papet <e.papet@dev1-0.com.com>
 * @see The GNU Public License (GPL)
 * Description : This is the Serial GateWay Prototype
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
const fwSketches = [];
const fwDefaultType = 0xFFFF; // index of hex file from array above (0xFFFF

const FIRMWARE_BLOCK_SIZE = 16;
const BROADCAST_ADDRESS = 255;
const NODE_SENSOR_ID = 255;

const C_PRESENTATION = 0;
const C_SET = 1;
const C_REQ = 2;
const C_INTERNAL = 3;
const C_STREAM = 4;

const V_TEMP = 0;
const V_HUM = 1;
const V_LIGHT = 2;
const V_DIMMER = 3;
const V_PRESSURE = 4;
const V_FORECAST = 5;
const V_RAIN = 6;
const V_RAINRATE = 7;
const V_WIND = 8;
const V_GUST = 9;
const V_DIRECTION = 10;
const V_UV = 11;
const V_WEIGHT = 12;
const V_DISTANCE = 13;
const V_IMPEDANCE = 14;
const V_ARMED = 15;
const V_TRIPPED = 16;
const V_WATT = 17;
const V_KWH = 18;
const V_SCENE_ON = 19;
const V_SCENE_OFF = 20;
const V_HEATER = 21;
const V_HEATER_SW = 22;
const V_LIGHT_LEVEL = 23;
const V_VAR1 = 24;
const V_VAR2 = 25;
const V_VAR3 = 26;
const V_VAR4 = 27;
const V_VAR5 = 28;
const V_UP = 29;
const V_DOWN = 30;
const V_STOP = 31;
const V_IR_SEND = 32;
const V_IR_RECEIVE = 33;
const V_FLOW = 34;
const V_VOLUME = 35;
const V_LOCK_STATUS = 36;

const I_BATTERY_LEVEL = 0;
const I_TIME = 1;
const I_VERSION = 2;
const I_ID_REQUEST = 3;
const I_ID_RESPONSE = 4;
const I_INCLUSION_MODE = 5;
const I_CONFIG = 6;
const I_PING = 7;
const I_PING_ACK = 8;
const I_LOG_MESSAGE = 9;
const I_CHILDREN = 10;
const I_SKETCH_NAME = 11;
const I_SKETCH_VERSION = 12;
const I_REBOOT = 13;
const I_GATEWAY_READY = 14;

const S_DOOR = 0;
const S_MOTION = 1;
const S_SMOKE = 2;
const S_LIGHT = 3;
const S_DIMMER = 4;
const S_COVER = 5;
const S_TEMP = 6;
const S_HUM = 7;
const S_BARO = 8;
const S_WIND = 9;
const S_RAIN = 10;
const S_UV = 11;
const S_WEIGHT = 12;
const S_POWER = 13;
const S_HEATER = 14;
const S_DISTANCE = 15;
const S_LIGHT_LEVEL = 16;
const S_ARDUINO_NODE = 17;
const S_ARDUINO_REPEATER_NODE = 18;
const S_LOCK = 19;
const S_IR = 20;
const S_WATER = 21;
const S_AIR_QUALITY = 22;

const ST_FIRMWARE_CONFIG_REQUEST = 0;
const ST_FIRMWARE_CONFIG_RESPONSE = 1;
const ST_FIRMWARE_REQUEST = 2;
const ST_FIRMWARE_RESPONSE = 3;
const ST_SOUND = 4;
const ST_IMAGE = 5;

const P_STRING = 0;
const P_BYTE = 1;
const P_INT16 = 2;
const P_UINT16 = 3;
const P_LONG32 = 4;
const P_ULONG32 = 5;
const P_CUSTOM = 6;

//
var serial = require('serialport');
var SerialPort = serial.SerialPort;
var gw;
var model;
var nodes;
var db
var parser;
var Parser = require('../parser/openroc_mysensors');
var parser;

function SerialGateWay(d, m, n) {
    db = d;
    nodes = n;
    model = m;
    parser = new Parser(nodes, db, this);
    //
    model.port = GLOBAL.config.SERIAL.port;
    model.baud = GLOBAL.config.SERIAL.speed;
    model.status = true;
    model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
    //
    logger.debug("Serial GateWay Model instantiate \n [%s]", util.inspect(model));
}
SerialGateWay.prototype.connect = function () {
    start();
}

SerialGateWay.prototype.sendTime = function (destination, sensor) {
    var payload = moment().format('X') / 1000;
    //var payload = new Date().getTime()/1000;
    var command = C_INTERNAL;
    var acknowledge = 0; // no ack
    var type = I_TIME;
    var td = encode(destination, sensor, command, acknowledge, type, payload);
    logger.debug('C_INTERNAL::I_TIME-> ' + td.toString());
    //gw.write(td);
    gw.write(td);
}

SerialGateWay.prototype.sendMessage = function (destination, sensor, command, ack, type, value) {
    var req = encode(destination, sensor, command, ack, type, value);// Request presentation to node
    try {
        if (model.status) {
            gw.write(req);
            logger.debug("-> [send message] %s ", req);
        } else {
            logger.debug("-> [send message error serial disconected] %s ", req);
        }
    } catch (err) {
        logger.error("-> %s [send message error :%s]", req, util.inspect(err));
    }
}

//------------------------------------------
//-
//----------------------------------------
function start() {
    //----------------------------------------
    // Connection to serial initialisation
    //---------------------------------------------
    try {
        gw = new SerialPort(GLOBAL.config.SERIAL.port, {
            baudRate: GLOBAL.config.SERIAL.speed,
            dataBits: GLOBAL.config.SERIAL.dataBits,
            parity: GLOBAL.config.SERIAL.parity,
            stopBits: GLOBAL.config.SERIAL.stopBits,
            parser: serial.parsers.readline(GLOBAL.config.SERIAL.newline),
            flowControl: GLOBAL.config.SERIAL.flowControl
        });
    } catch (err) {
        logger.error(" GW Serial Error :%s", util.inspect(err));
        if (model.status) {
            model.status = false;
            model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
            sio.sockets.emit('serial_connected', model);
            //
            nodes.initAllSensors(false);
            //
            connectWithTimeOut();
        }
    }
    //-------------------------------------------------------------
    // Connect Event
    //------------------------------------------------------------
    gw.on("open", function () {
        logger.debug("Serial is Connected at port :" + GLOBAL.config.SERIAL.port + " with speed :" + GLOBAL.config.SERIAL.speed);
        model.status = true;
        model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
        model.port = GLOBAL.config.SERIAL.port;
        // modelServices.serial.error = null;
        // TODO save serial status in redis
        sio.sockets.emit('serial_connected', model);
        //sendToRedis(json, 3000);
        // on affiche tous les nodes
        nodes.initAllSensors(true);

    });
    //-------------------------------------------------------
    // Serial incoming data
    //-------------------------------------------------------
    gw.on('data', function (data) {
        logger.debug("Incomming Serial GW data %s", data);
        parser.parse(data);
    });
    //--------------------------------------------------
    // Serial Close Event
    //------------------------------------------------
    gw.on('close', function () {
        if (model.status) {
            logger.debug('Serial  is disconnected [evt :close]');
            //now = moment();
            model.status = false;
            model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
            //
            sio.sockets.emit('serial_connected', model);
            //sendToRedis(json, 3000);
            nodes.initAllSensors(false);
        }
        connectWithTimeOut();
        //debug('CONNECTED TO SERIAL OpenRoc GW');
    });
    //---------------------------------------------
    // Serial Error Event
    //----------------------------------------------
    gw.on('error', function (err) {
        if (model.status != false) {
            logger.error(" Error event Serial try to connect at port :" + GLOBAL.config.SERIAL.port + " with speed :" + GLOBAL.config.SERIAL.speed + " error : " + util.inspect(err));
            model.status = false;
            model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
            model.port = util.inspect(err);
            sio.sockets.emit('serial_connected', model);
            nodes.initAllSensors(false);
            // serial_status = false;
        }
        connectWithTimeOut();
    });
}// end connect

//-----------------------
//
//------------------------
function connectWithTimeOut() {
    setTimeout(function () {
        start();
    }, GLOBAL.config.SERIAL.timeOut);
}// end connectWithTimeOut

//--------------------------
//_ encode message
//-----------------------
function encode(destination, sensor, command, acknowledge, type, payload) {
    var msg = destination.toString(10) + ";" + sensor.toString(10) + ";" + command.toString(10) + ";" + acknowledge.toString(10) + ";" + type.toString(10) + ";";
    if (command == 4) {
        for (var i = 0; i < payload.length; i++) {
            if (payload[i] < 16)
                msg += "0";
            msg += payload[i].toString(16);
        }
    } else {
        msg += payload;
    }
    msg += '\n';
    return msg.toString();
}

module.exports = SerialGateWay;