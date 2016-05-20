/*******************************************************************************
 * PROJET : OpenROC
 * @author 2015-2016 Eric Papet <e.papet@dev1-0.com.com>
 * @see The GNU Public License (GPL)
 * Description : Redis Database
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

//Modules Global variables
var logger = require('log4js').getLogger('openroc_core');
var util = require('util');
//Horodatage
var moment = require('moment');
moment.locale('fr');
var Redis = require('ioredis');
var db;
var model;
//var nodes;


function RedisDB(m, n) {
    model = m;
    //nodes = n;
    //
    model.port = GLOBAL.config.REDIS.port;
    model.host = GLOBAL.config.REDIS.host;
    model.status = true;
    model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
    logger.debug(" RedisDB Model instantiate  \n [%s]", util.inspect(model));

    this.connect = function (next) {
        //
        db = new Redis({
            port: GLOBAL.config.REDIS.port,          // Redis port
            host: GLOBAL.config.REDIS.host,   // Redis host
            family: GLOBAL.config.REDIS.ipFamily
        });
        //-----------------------------------------------------------
        //-
        //----------------------------------------------------------
        db.monitor(function (err, monitor) {
            if (err)
                debug(" redis monitor error :" + util.inspect(er));
            else
                monitor.on('monitor', function (time, args) {
                    //debug(" Redis Monitor Time :" + time + " Value :" + util.inspect(args));
                });
        });

        //-----------------------------------------------------------
        //-
        //----------------------------------------------------------
        db.on('connect', function (err) {
            //
            model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
            if (err) {
                if (model.status) {
                    debug(" Connection to redis failed : " + util.instect(err));
                }
                model.status = false;
                //json["error"] = util.inspect(err);
                model.error = util.inspect(err);
                //modelServices.redis["error"] = util.inspect(err);
            } else {
                logger.debug(" Redis is connected host :" + GLOBAL.config.REDIS.host + " port :" + GLOBAL.config.REDIS.port);
                model.status = true;
            }
            //
            sio.emit("redis_connected", model);
            //sendToRedis(json, 3000);
        });

        //------------------------------------------
        //-
        //---------------------------------------------
        db.on('close', function () {

            if (model.status) {
                logger.debug(" Redis is disconnected ..");
                //
                //redis_status = false;
                model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
                model.status = false;
                //
                // json["status"] = redis_status;
                //
                sio.emit("redis_connected", model);
            }


            //connectRedis();
        });
        next();
    }// end connect

    this.sendToRedis = function (json, timestamp, ttl) {
        // Build KEY
        var key;
        if (json.type != undefined && json.type != null)
            key = json.type + "-";
        else
            key = "F-";

        if (json.node_id != undefined && json.node_id != null)
            key += json.node_id + "-";

        if (json.model != undefined && json.model != null)
            key += json.model + "-";

        key += timestamp;

        db.set(key, JSON.stringify(json), function (err) {
            if (err)
                logger.error(" redis_client send error :" + util.inspect(err) + " key :" + key + " value :" + value);
            else {
                //sendToHbase();
            }
        });
        db.expire(key, ttl, function (err) {
            if (err)
                logger.error(" redis_client ttl error :" + util.inspect(err) + " key :" + key + " value :" + value);
        });
    } // end sendToRedis

    this.saveNode = function (node) {
        //var node = registerNode(node_id);
        if (node != undefined && node != null && node.node_id < 255) {
            toRedis(1, node.node_id, JSON.stringify(node), 100000, function (err) {
                if (err) {
                    logger.error("Write Redis Error %s", util.inspect(err));
                }
            });
        }

    }// end saveNode

    this.saveMetric = function (sensor, opentsdb) {
        //var node = registerNode(node_id);
        loogger.debug("saveMetric:", util.inspect(sensor));
        if (sensor != undefined && sensor.type != undefined && sensor.value != null) {
            var key = moment().format('X') + "-" + sensor.node_id + "-" + sensor.sensor_id + "-" + sensor.type.metric;
            toRedis(2, key, JSON.stringify(sensor), 100000, function (err) {
                if (err) {
                    logger.error("Write Redis Error %s", util.inspect(err));
                }
            });
            // send to TSDB
            var model = '' + sensor.model;// cast en string
            //debug(" model %s",model);
            var tags = {'node_id': sensor.node_id, 'sensor_id': sensor.sensor_id, 'model': model.replace(/ /g, '_')};
            opentsdb.pushToOpenTSDB(sensor.type.metric, sensor.value, sensor.last_update, tags, function (err) {
                if (err)
                    logger.error(" saveMetric Error %s", err.error);
            })
        }
    }// end saveMetric

    this.saveMetricBattery = function (current_node, opentsdb) {
        var tags = {'node_id': current_node.node_id, 'model': 'BATTRY'};
        opentsdb.pushToOpenTSDB('battry', current_node.battery_level, current_node.last_update, tags, function (err) {
            if (err)
                logger.error(" saveMetricBaterry Error %s", util.inspaect(err.error));
        })
    }// end saveMetricBattery

    this.getMetric = function (date, metric, node_id, se, sensor_id, callback) {
        db.select(2);//metric db
        //var key = date+'-'+
        db.get('foo', function (err, result) {
            if (err) {
                logger.error(err);
            } else {
                logger.debug(result);
            }
        });
    }// end getMetric

    this.getNodesIds = function (next) {
        if (model.status) {
            db.select(1);
            db.keys('*', function (err, result) {
                if (err) {
                    logger.error("getNodes retrieve keys Error  [%s]", util.inspect(err));
                    next(err, null, false);
                } else {
                    next(null, result, true);
                }
            });
        }
        next(null, null, false);
    }// end getNodes

    this.getNodeById = function (id, next) {
        if (model.status) {
            db.select(1);
            db.get(id, function (err, node) {
                if (err) {
                    logger.error('getNodeById id [%d], error [%s]', id, util.inspect(err));
                    next(err, null);
                } else {
                    logger.debug('getNodeById retrieve node [%s]', util.inspect(node));
                    next(null, node);
                }
            });
        }
    }
} // end RedisDB

function initNodes(model, nodes, next) {
    logger.debug('redis model \n [%s] ', util.inspect(model));
    if (model.status) {
        db.select(1);
        db.keys('*', function (err, result) {
            result.forEach(function (id) {
                    logger.debug(" id %s", id);
                    db.get(id, function (err, node) {
                        if (err) {
                            //throw err;
                            nodes.nodes = [];
                            next(err, false);
                        } else {
                            try {
                                nodes.nodes[id] = JSON.parse(node);
                            } catch (err) {
                                // throw err;
                                nodes.nodes = [];
                                next(err, false);
                            }
                            // debug("init_modele_nodes key %s node %s",id,util.inspect(GLOBAL.NODES[id]));
                        }
                    });
                }
            );
        });
        next(null, true);
    } else { //Mode restrient GLOBAL.NODES[];
        nodes.nodes = [];
        next(null, false);
        //logger.debug("Initialisation du model des Nodes mode DECOUVERTES");
    }
} // end initNodes

function toRedis(id, key, data, ttl, cb) {
    db.select(id);
    db.set(key, data, function (err) {
        if (err) {
            logger.error(" redis_client send error :" + util.inspect(err) + " key :" + key + " value :" + value);
            cb(err);
        }
    });
    db.expire(key, ttl, function (err) {
        if (err) {
            logger.error(" redis_client ttl error :" + util.inspect(err) + " key :" + key);
            cb(err);
        }
    });
}// end toRedis

module.exports = RedisDB;