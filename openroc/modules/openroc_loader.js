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
var util = require("util");
var logger = require('log4js').getLogger('openroc_loader');
var fs = require('fs');


module.exports = {
    /**
     *
     */
    loadMetric: function (directory) {
        //temporaire
        var directory_metric = {};
        GLOBAL.METRIC = [];
        // Load File
        try {
            logger.debug("OpenRoc Load metric Name [%s]", util.inspect(directory.metric));
            directory_metric = JSON.parse(fs.readFileSync(directory.metric, 'utf8'));
            GLOBAL.METRIC = directory_metric;
        } catch (err) {
            logger.error("OpenRoc Load metric File ERROR mess [%s] ", util.inspect(err.message));
            throw err;
        }
    },

    loadConfig: function (directory) {
        //temporaire
        var directory_config = {};
        GLOBAL.config = [];
        // Load File
        try {
            console.log(">>> OpenRoc Load Configuration [%s]", util.inspect(directory.config));
            directory_config = JSON.parse(fs.readFileSync(directory.config, 'utf8'));
            //logger.debug("Load Configuration      [%s]", util.inspect(directory_config));
            GLOBAL.config = directory_config;
            logger.setLevel(GLOBAL.config["LOGS"].level);
        } catch (err) {
            console.log("OpenRoc Load Configuration File ERROR mess [%s] ", err.message);
            throw err;
        }
        // Tableaux

    },

    loadPresentation: function (directory) {
        var directory_presentation = {};
        GLOBAL.PRESENTATION = [];
        // Load File
        try {
            console.log(">>> OpenRoc Load Sensors Presentation [%s]", util.inspect(directory.presentation));
            directory_presentation = JSON.parse(fs.readFileSync(directory.presentation, 'utf8'));
            // directory_presentation = fs.readFileSync(directory.presentation, 'utf8');
            //logger.debug("Load Configuration      [%s]", util.inspect(directory_config));
            GLOBAL.PRESENTATION = directory_presentation;
            //logger.setLevel(GLOBAL.config["LOGS"].level);
        } catch (err) {
            console.log("OpenRoc Load Sensors Presentation File ERROR mess [%s] ", err.message);
            throw err;
        }

    }

};