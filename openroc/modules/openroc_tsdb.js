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

function OpenTsDB(host, port, model) {
    this.host = host;
    this.port = port;
    this.model = model;
    //
    this.model.host = host;
    this.model.port = port;
    this.model.status = false;
    this.model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
    //
    logger.debug("OpenTsDb Model instantiate \n [%s]", util.inspect(this.model));
}//

//----------------------------------------------------
//-
//----------------------------------------------------
OpenTsDB.prototype.store = function (dataPoints, next) {
    var error;
    var http_code
    var http = require('http');
    var dps = [];
    var datapointCount = 0;

    for (var i = 0; i < dataPoints.length; i++) {
        if (datapointCount == 50) {

            var dpsString = JSON.stringify(dps);

            var request = new http.request({
                hostname: this.host,
                port: this.port,
                path: "/api/put",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": dpsString.length
                }
            }, function (res) {
                //console.log(body);
                //console.log(res.statusCode);
                next(res.statusCode);
                //request.destroy();
            });
            request.on('error', function (err) {
                // Handle error
                //console.log(" node1opentsdb1 error :%s",err);
                next(null, err)
            });
            request.shouldKeepAlive = false;
            request.end(dpsString);

            dps = [];
            i--;
            datapointCount = 0;
        } else {
            dps.push(dataPoints[i]);
            datapointCount++;
        }

    }

    if (datapointCount != 0) {
        var dpsString = JSON.stringify(dps);

        var request = new http.request({
            hostname: this.host,
            port: this.port,
            path: "/api/put",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": dpsString.length
            }
        }, function (res) {
            //console.log(body);
            // console.log(res.statusCode);
            next(res.statusCode);
            //request.destroy();
        });
        request.on('error', function (err) {
            // Handle error
            // console.log(" node1opentsdb2 error :%s",err);
            next(null, err);
        });
        request.shouldKeepAlive = false;
        request.end(dpsString);
    }

}// end store

//-------------------------------------------
//-
//-------------------------------------------
OpenTsDB.prototype.getDataPoints = function (queryObject, callback) {

    if (!queryObject.start || !queryObject.metric || !queryObject.aggregator)
        throw 'Query parameters missing:minimum required parameters are start,metric,aggregator';
    var queryPath = "/api/query?";
    //Add start date
    queryPath += "start=" + queryObject.start;

    //Add end date if required
    if (queryObject.end !== undefined)
        queryPath += "&end=" + queryObject.end;

    //Add aggregator
    queryPath += "&m=" + queryObject.aggregator + ":";

    //Add downsampler if required
    if (queryObject.downsampler !== undefined)
        queryPath += queryObject.downsampler + ":";

    //Add metric
    queryPath += queryObject.metric;

    //Add tags if required
    if (queryObject.tags !== undefined) {
        //construct tag string
        var i = 0;
        var tagarray = [];
        for (var tagname in queryObject.tags) {
            tagarray[i++] = tagname + "=" + queryObject.tags[tagname];
        }
        var tagstring = tagarray.join(',');
        tagstring = '{' + tagstring + '}';
        queryPath += tagstring;
    }

    var http = require('http');
    var options = {
        host: this.host,
        port: this.port,
        path: queryPath,
        type: 'GET',
    };

    var data = "";
    var req = http.get(options, function (res) {

        res.on('data', function (chunk) {
            data += chunk;

        });

        res.on('error', function (e) {
            throw e.message.toString();

        });

        res.on('end', function () {

            data = JSON.parse(data);
            if (data.error !== undefined)
                callback("", data);
            else
                callback(data, "");

        });
    });


    req.on('error', function (e) {
        throw 'Error in requesting' + e.toString();
    });

}

//-----------------------------------------
//-
//----------------------------------------
OpenTsDB.prototype.pushToOpenTSDB = function pushToOpenTSDB(metric, value, timestamp, tag_array, cb) {
    //
    var dps = [];
    var dp = {"metric": metric, "timestamp": timestamp, "value": String(value), "tags": tag_array};
    // remplace ' ' par '_'

    debug(" OpenTSDB Data Point :%s", JSON.stringify(dp));
    //
    dps.push(dp);
    //This function stores data points in opentsdb
    this.store(dps, function (res, err) {
        if (err != null) {
            debug(" pushToOpenTSDB push ERROR : %s Error message :%s", JSON.stringify(dp), err);
            //
            if (this.model.status) {
                //tsdb_status = false;
                this.model.status = false;
                this.model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
                this.model.error = err.errno;
                sio.emit("opentsdb_connected", this.model);
            }
            //sendToRedis(json, 600);
            cb({'error': err.errno});
        } else {
            if (!this.model.status) {
                //tsdb_status = true;
                this.model.status = true;
                this.model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
                this.model.error = null;
                sio.emit("opentsdb_connected", this.model);
            }
            debug(" pushToOpenTSDB Ok http status : %s", res);
            cb();
        }
        //sio.emit("opentsdb_connected",modelServices.tsdb);
    });

}


module.exports = OpenTsDB;