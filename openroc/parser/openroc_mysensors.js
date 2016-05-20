/**
 * Created by epa on 20/05/16.
 */

/*******************************************************************************
 * PROJET : OpenROC
 * @author 2015-2016 Eric Papet <e.papet@dev1-0.com.com>
 * @see The GNU Public License (GPL)
 * Description : This is the OpenRoc Http Server
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
var nodes;
var db;
var gw;

function parser(n, d, s) {
    nodes = n;
    db = d;
    gw = s;
}

parser.prototype.parse = function (data) {
    parserMySensor(data);
}

function parserMySensor(data) {
    var json;
    var datas;
    var sender;
    var sensor;
    var command;
    var ack;
    var type;
    var payload;
    //
    var current_node = null;
    var current_sensor = null;
    //
    logger.debug("<- incomming message %s", util.inspect(data));
    if ((data != null) && (data != "")) {
        if (data.charAt(0) == '{') {// message provenant de Nodes OpenRoc Teensy [Protocole Synchrone, type: JSON]
            json = JSON.parse(data);//TODO try catch
            sender = json.node_id;
            sensor = json.sensor_id;
            command = json.type;
            ack = 0;
            type = json.type_value;
            payload = json.value;
        } else {// Messages provenant de Node MySensors.org Arduino [Protocole Asynchrone, type: String Message ]
            //debug('<- ' + data);
            // decoding message
            datas = data.toString().split(";");//TODO try catch
            sender = +datas[0];
            sensor = +datas[1];
            command = +datas[2];
            ack = +datas[3];
            type = +datas[4];
            var rawpayload = "";
            if (datas[5]) {
                rawpayload = datas[5].trim();
            }
            //var payload;
            // firmeware update
            if (command == C_STREAM) {
                payload = [];
                for (var i = 0; i < rawpayload.length; i += 2)
                    payload.push(parseInt(rawpayload.substring(i, i + 2), 16));
            } else {
                payload = rawpayload;
            }
            //
        }

        current_node = nodes.registerNode(sender);
        //current_sensor = registerSensor[sender,sensor];
        // decision on appropriate response
        switch (command) {
            //
            case C_PRESENTATION:
                if (sensor == NODE_SENSOR_ID) {// Presention du Node
                    //saveProtocol(sender, payload, db);
                    logger.debug("<- [C_PESENTATION:Node <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", sender, sensor, command, type, payload, ack);
                    current_node.version = payload;
                    nodes.updateNode(current_node);
                } else {// presenation d'un sensor
                    debug("<- [C_PESENTATION:Sensor <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", sender, sensor, command, type, payload, ack);
                    current_sensor = registerSensor(sender, sensor);
                    current_sensor.presentation = GLOBAL.PRESENTATION[type];
                    current_sensor.model = payload;
                    nodes.updateSensor(current_sensor);
                }

                //saveSensor(sender, sensor, type, db);
                break;
            case C_SET:
                logger.debug("<- %s [C_SET <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                //Monitoring Node
                if (current_node.status != true) {
                    current_node.status = true;
                    nodes.updateNode(current_node);
                }

                // Si ce n'est pas une donnée sensors mais la réponse à V_VAR1...5 TODO inplémenter une table d'états sur les ack
                // current_sensor = registerSensor(sender, sensor);
                if (sensor != 255) {
                    current_sensor = registerSensor(sender, sensor);
                    current_sensor.last_update = moment().format('X');
                    if (type != V_VAR1) { // Metric
                        current_sensor.type = GLOBAL.METRIC[type];
                        current_sensor.value = payload;
                        db.saveMetric(current_sensor);
                    } else {
                        current_sensor.model = payload;
                    }
                    nodes.updateSensor(current_sensor);
                    //saveMetric(current_sensor);
                }

                // saveValue(sender, sensor, type, payload, db);
                break;
            case C_REQ:
                logger.debug("<- %s [C_REQ <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                break;
            case C_INTERNAL:

                switch (type) {
                    case I_BATTERY_LEVEL:
                        logger.debug("<- %s [C_INTERNAL:: I_BATTERY_LEVEL <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        if (current_node.status != true) {
                            current_node.status = true;
                        }
                        current_node.battery_level = payload;
                        current_node.last_update = moment().format('X');
                        nodes.updateNode(current_node);
                        db.saveMetricBattery(current_node);
                        // Presentation
                        if (current_node.presentation == null || current_node.version == null) {//request node and sensors presenation
                            gw.sendMessage(current_node.node_id, 255, C_REQ, 0, V_VAR1, '');
                        }

                        // Si ce n'est pas une donnée sensors mais la réponse à un ACK message TODO inplémenter une table d'états sur les ack
                        //current_sensor = registerSensor(sender, sensor);
                        // saveBatteryLevel(sender, payload, db);
                        break;
                    case I_TIME:
                        logger.debug("<- %s [C_INTERNAL:: I_TIME <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        gw.sendTime(sender, sensor);
                        break;
                    case I_VERSION:
                        logger.debug("<- %s [C_INTERNAL:: I_VERSION <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        // current_node = registerNode(sender);
                        current_node.version = payload;
                        nodes.updateNode(current_node);
                        break;
                    case I_ID_REQUEST:
                        logger.debug("<- %s [C_INTERNAL:: I_ID_REQUEST <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        nodes.getNextNodeId(function (next) {
                            if (next != null) {
                                logger.debug("next  next id %d", next);
                                gw.sendMessage(255, 255, C_INTERNAL, 1, I_ID_RESPONSE, next);
                            }
                            else
                                logger.error("error send next id ");
                        });
                        //sendNextAvailableSensorId(db, gw);
                        break;
                    case I_ID_RESPONSE:
                        logger.debug("<- %s [C_INTERNAL:: I_ID_RESPONSE <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        break;
                    case I_INCLUSION_MODE:
                        logger.debug("<- %s [C_INTERNAL:: I_INCLUSION_MODE <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        break;
                    case I_CONFIG: // system metric true= Celsus, false = Faranrhiet
                        logger.debug("<- %s [C_INTERNAL:: I_CONFIG <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        gw.sendMessage(sender, sensor, C_INTERNAL, '0', I_CONFIG, 'M');
                        logger.debug("-> %s [C_INTERNAL:: I_CONFIG -> sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        break;
                    case I_PING:
                        logger.debug("<- %s [C_INTERNAL:: I_PING <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        break;
                    case I_PING_ACK:
                        logger.debug("<- %s [C_INTERNAL:: I_PING_ACK <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);

                        break;
                    case I_LOG_MESSAGE:
                        logger.debug("<- %s [C_INTERNAL:: I_LOG_MESSAGE <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);

                        break;
                    case I_CHILDREN:
                        logger.debug("<- %s [C_INTERNAL:: I_CHILDREN <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);

                        break;
                    case I_SKETCH_NAME:
                        logger.debug("<- %s [C_INTERNAL:: I_SKETCH_NAME <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        // current_node = registerNode[sender];
                        current_node.presentation = payload;
                        nodes.updateNode(current_node);
                        // saveSketchName(sender, payload, db);
                        break;
                    case I_SKETCH_VERSION:
                        logger.debug("<- %s [C_INTERNAL:: I_SKETCH_VERSION <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        //  current_node = registerNode[sender];
                        current_node.sketch_version = payload;
                        nodes.updateNode(current_node);
                        // saveSketchVersion(sender, payload, db);
                        break;
                    case I_REBOOT:
                        logger.debug("<- %s [C_INTERNAL:: I_REBOOT <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        break;
                    case I_GATEWAY_READY :
                        // create GW
                        logger.debug("<- %s [C_INTERNAL:: I_GATEWAY_READY  <- sender:%d,sensor:%d,command:%d,type:%s,payload:%s, ack:%s]", data, sender, sensor, command, type, payload, ack);
                        // current_node = registerNode(sender);
                        current_node.presentation = "OpenRoc " + payload + " Gateway";
                        // request version to Gateway
                        if (current_node.version == null) // demande de version à la GateWay
                            gw.sendMessage('0', '0', C_INTERNAL, '0', I_VERSION, '');

                        //sendMessage('0','0',C_INTERNAL,'0','20' ,'INIT');
                        //TODO boucle d'initialisation envoie 1 à 254 messages de type C_INTERNAL V_ARG1 Broadcast les sensors répondent avec leurs présenations
                        break;
                }
                break;
            case C_STREAM:
                switch (type) {
                    case ST_FIRMWARE_CONFIG_REQUEST:
                        var fwtype = pullWord(payload, 0);
                        var fwversion = pullWord(payload, 2);
                        // sendFirmwareConfigResponse(sender, fwtype, fwversion, db, gw);
                        break;
                    case ST_FIRMWARE_CONFIG_RESPONSE:
                        break;
                    case ST_FIRMWARE_REQUEST:
                        var fwtype = pullWord(payload, 0);
                        var fwversion = pullWord(payload, 2);
                        var fwblock = pullWord(payload, 4);
                        //sendFirmwareResponse(sender, fwtype, fwversion, fwblock, db, gw);
                        break;
                    case ST_FIRMWARE_RESPONSE:
                        break;
                    case ST_SOUND:
                        break;
                    case ST_IMAGE:
                        break;
                }
                break;
        }
        // checkRebootRequest(sender, db, gw);
    }
}

module.exports = parser;
