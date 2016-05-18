/**
 * Created by epa on 10/05/16.
 */


var util = require("util");
var loader = require(__dirname + '/openroc_loader');
var conf = __dirname + '/../../conf/openroc_conf.json';
var metric = __dirname + '/../../conf/openroc_metric.json';
var presentation = __dirname + '/../../conf/openroc_sensors_presentation.json';
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
//
var chokidar = require("chokidar");
var watcher;
//
var log4js = require('log4js');
var log;
//var logMongo;
//
var conf_loader = {config: conf, metric: metric, presentation: presentation};
//
//
console.log("\n>>> OPENROC Try to load file configuration ... \n[%s]\n", util.inspect(conf_loader));
try {
    // load configuration file
    loader.loadConfig(conf_loader);
    console.log(">>> OPENROC Mode [%s]", GLOBAL.config["ENV"].mode);
    //log4j
    log4js.configure(__dirname + GLOBAL.config["LOGS"].path, {reloadSecs: GLOBAL.config["LOGS"].reload});
    // Logger Initalisation File & DB
    log = log4js.getLogger('openroc_core');
    log.setLevel(GLOBAL.config["LOGS"].level);
    log.info('>>> OpenRoc LOG4Js initialisation OK');

    // Load sensors presentation
    loader.loadPresentation(conf_loader);
    //
    //Load sensors metric definition
    loader.loadMetric(conf_loader);
    //
    // Listener File Initialisation
    watcher = chokidar.watch(conf, {usePolling: true});
    watcher.add(presentation, {usePolling: true});
    watcher.add(metric, {usePolling: true});
} catch (e) {
    console.log(" OPENROC INIT PROBLEM message : " + util.inspect(e));
    throw(e);
    process.exit(0);
}
//
//
//
//
watcher.on('change', function (path, stats) {
    if (stats) log.debug('File', path, 'changed size to', stats.size);
    if (path === conf) {
        try {
            loader.loadConfig(conf_loader);
            //reload_db();
        } catch (e) {
            log.error(" OPENROC loaded configuration problem, message : " + e.messages);
            throw(e);
            process.exit(0);
        }
        log.debug("configuration reloaded !!");
    }
    else if (path === presentation) {
        try {
            //reload_db();
            loader.loadPresentation(conf_loader);
        } catch (e) {
            log.error(" OPENROC loaded presentaion problem, message : " + e.messages);
            throw(e);
            process.exit(0);
        }
        log.debug("Sensors presentaion  reloaded !!");
    }
    else {  // (path === profiles) { //jamais d'égalité
        try {
            loader.loadMetric(conf_loader);
        } catch (e) {
            log.error(" OPENROC loade Metric problem, message : " + e.messages);
            throw(e);
            process.exit(0);
        }
        log.debug("Sensors Metric reloaded !!");
    }

});

