/**
 * Created by epa on 19/05/16.
 */
/**
 * Created by epa on 19/05/16.
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
var app = require('../../app');//app.js

function OpenRoc(model) {
    this.model = model;
    app.set('port', process.env.PORT || GLOBAL.config.WWW.port || 4000);
    app.set('host', process.env.HOST || GLOBAL.config.WWW.host || "localhost");
    //
    this.model.host = app.get('host');
    this.model.port = app.get('port');
    this.model.status = false;
    this.model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
    //
    logger.debug("Http Server Model instantiate \n [%s]", util.inspect(this.model));


}

//
OpenRoc.prototype.start = function (next) {
    var httpd = app.listen(app.get('port'), app.get('host'), function (server) {
        //server.timeout(18000);// Timeout socket http
        logger.debug('OPENROC server listening on %s:%s ', httpd.address().address, httpd.address().port);

    });
    //
    this.model.status = true;
    this.model.timestamp = moment().format('dddd Do MMMM YYYY, hh:mm:ss:SSS');
    next(httpd);
}


module.exports = OpenRoc;
