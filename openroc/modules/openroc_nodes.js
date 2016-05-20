/**
 * Created by epa on 19/05/16.
 */
/*******************************************************************************
 * PROJET : OpenROC
 * @author 2015-2016 Eric Papet <e.papet@dev1-0.com.com>
 * @see The GNU Public License (GPL)
 * Description : This is the Sensors database
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

var db;

function Nodes(d) {
    db = d;
    this.nodes = [];
    logger.debug("Nodes Model instantiate ")
}

//------------------------------------
// If node exist in database return it or create a new node and return it.
//------------------------------------
Nodes.prototype.registerNode = function registerNode(node_id) {
    if (this.nodes[node_id] != undefined) {
        return this.nodes[node_id];
    }
    if (node_id >= 255)
        return null;
    //
    this.nodes[node_id] = {
        "node_id": node_id, // 0 = GateWay
        "presentation": null,
        "type": null, //0 = Gateway ; 1 = Sensor Node ; 2 = Repeater Node
        "status": true,
        "version": null,
        "sketch_version": null,
        "battery_level": null,
        "sensors": [],
        "last_update": moment().format('X')
    }
    return this.nodes[node_id];
}// end registerNode

//----------------------------------
// Return the next node_id available
//----------------------------------
Nodes.prototype.getNextNodeId = function getNextNodeId(cb) {
    var new_id;
    var nodesId = [];
    this.nodes.forEach(function (node) {
        nodesId.push(node.node_id);
    });
    //
    if (nodesId.length > 0) {
        nodesId.sort();
        new_id = nodesId[nodesId.length - 1] + 1;
        console(" getNextNodeId last id is : %d", new_id);
    }
    //
    if (new_id != undefined && new_id < 254)
        cb(new_id);
    else
        cb(null);
} // end getNextNodeId

//-------------------------------------------
//- Save in Redis and update GUI
//------------------------------------------
Nodes.prototype.updateNode = function updateNode(node) {
    //debug("upadateNode :%s",util.inspect(node));
    db.saveNode(node);
    sio.sockets.emit('update_node', node);
}

//-------------------------------------------------
//- create or retrieve sensor by node_id and sensor_id
//-------------------------------------------------
Nodes.prototype.registerSensor = function registerSensor(node_id, sensor_id) {
    var _node = null;
    var _sensor = null;
    if (this.nodes[node_id] != undefined && this.nodes[node_id].sensors[sensor_id] != undefined && sensor_id != 255) {
        _node = this.nodes[node_id];
        // _node.sensor[sensor_id].status=true;
    } else {

        if (this.nodes[node_id].sensors[sensor_id] == undefined) {
            _node = this.nodes[node_id];
            _node.sensors[sensor_id] = {
                "node_id": node_id,
                "sensor_id": sensor_id,
                "presentation": null,
                "localisation": null,
                "type": null,
                "value": null,
                "model": null,
                "last_update": moment().format('X')
            }
        }
    }
    //debug("addSensor :%s",util.inspect(GLOBAL.NODES[node_id]))
    return this.nodes[node_id].sensors[sensor_id];
}// end registerSensor

//-------------------------------------------------
//- Save and update WEB GUI
//-------------------------------------------------
Nodes.prototype.updateSensor = function updateSensor(db, sensor) {
    //debug(" updateSensor :%s",util.inspect(sensor)) ;
    db.saveNode(this.nodes[sensor.node_id]);
    sio.sockets.emit('update_sensor', sensor);
}

//----------------------------------------------
//- Status Initialisation of all nodes
//---------------------------------------------
Nodes.prototype.initAllSensors = function initAllSensors(mode) {
    // on affiche tous les nodes
    this.nodes.forEach(function (node) {
        if (mode != undefined) {
            if (node.node_id == '0' && mode == true)
                node.status = mode;
            else
                node.status = !mode;
            if (mode == false)
                node.status = mode;
        }
        node.last_update = moment().format('X');
        this.nodes[node.node_id] = node;
        //debug("initAllSensors %s",u;til.inspect(GLOBAL.NODES[node.node_id]));
        this.updateNode(node);
        // saveNode(GLOBAL.NODES[node.node_id]);
        //sio.sockets.emit('update_node', GLOBAL.NODES[node.node_id]);
    });
}// end initAllSensors

Nodes.prototype.getNodes = function () {
    return this.nodes;
} // end initNodes


module.exports = Nodes;