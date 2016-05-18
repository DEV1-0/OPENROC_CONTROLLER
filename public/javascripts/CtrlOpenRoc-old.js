/**
 * Created by epa on 12/04/16.
 */
var dataSet = [];
var nodesTab;
moment.locale('fr');
//
$(document).ready(function () {



    //nodes array
    nodesTab = $('#nodes').DataTable({
        data: dataSet,
        rowId: 'NodeID',
        columns: [
            {title: "<i class=\"fa fa-tag\"></i> Id"},
            {title: "<i class=\"fa fa-folder\"></i> Microcontrôleur"},
            {title: "<i class=\"fa fa-plug\"></i> État"},
            {title: "<i class=\"fa fa-tag\"></i> Version"},
            {title: "<i class=\"fa fa-clock-o\"></i> Mise à jour"},
            {title: "<i class=\"fa fa-battery-half\"></i> Niveau de batterie"}
        ],
        "fnRowCallback": function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
            if (aData[2] == "CONNECTED") {
                $('td:eq(2)', nRow).addClass('status').addClass('connected').removeClass('disconnected');
                //$('td', nRow).css('background-color', '#22FF77');
            } else {
                //$('td:eq(2)', nRow).css('background-color', '#FF2277');
                $('td:eq(2)', nRow).addClass('status').removeClass('connected').addClass('disconnected');
            }
        },
        "fnCreatedRow": function (nRow, aData, iDataIndex) {
            $(nRow).attr('id', aData[0]);
        }
    });

    //services array
    var servicesTab = $('#tab-services').DataTable();

});


function displayServiceDatas(trService, json) {

    // console.log("displayServiceDatas : "+trService.id);

    if (json != null || json != undefined) {

        // Informations
        var content;
        if (json.host != undefined) {
            content = json.host + ":" + json.port;
        } else {
            content = json.port + " at " + json.baud + " Baud";
        }
        $(trService).find(".info-service").html(content);

        // État
        var status = (json.status == true) ? "CONNECTED" : "DISCONNECTED";
        var classNameEtat = (json.status) ? "connected" : "disconnected";
        $(trService).find(".status")
            .removeClass("connected").removeClass("disconnected") //reset de l'ancien état
            .addClass(classNameEtat) // set du nouvel état
            .html(status);

        // Mise à jour
        if (json.timestamp != undefined) {
            //	var time = moment(json.timestamp, 'X').format('dddd Do MMMM YYYY, hh:mm:ss');
            $(trService).find(".time").html(json.timestamp);
        } else {
            $(trService).find(".time").html("non définie");
        }

    }

}

var index = 0;
var socket = io.connect('http://localhost:4000');
socket.on('connect', function () {
    //
    socket.on('init_services', function (msg) {
//        var status;
//        var content;

        displayServiceDatas($("#service-serial")[0], msg.serial);
        //   localStorage.setItem("SERIAL", JSON.stringify(msg.serial));
        displayServiceDatas($("#service-http")[0], msg.http);
        displayServiceDatas($("#service-redis")[0], msg.redis);
        displayServiceDatas($("#service-tsdb")[0], msg.tsdb);


    });
    /*
     socket.on('serial_connected', function (msg) {
     //
     console.log(msg.port);
     var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
     var content = "<p> <strong> Serial Connection port :  </strong>" + msg.port + " at " + msg.baud + " Baud  <strong> Status  :</strong>" + status + "</p>";
     localStorage.setItem("SERIAL", JSON.stringify(msg));
     if (msg.error != 0 && msg.error != undefined)
     $("#serial-text").html(msg.baud + ":" + msg.port + " " + msg.error);
     else
     $("#serial-text").html(msg.baud + ":" + msg.port);
     //
     $("#serial-time").html(msg.timestamp);
     //
     $("#serial-status").html(status);
     var color = (msg.status) ? "#22FF77" : "#FF2277";
     $('#tab-services tr:eq(4) td:eq(2)').css('background-color', color);
     //$("#serial-status").css("background-color",color);

     });*/
    //
    socket.on('update_node', function (msg) {
        //--
        //Formatage des data
        var presentation = (msg.presentation != null) ? msg.presentation : "En attente d'informations";
        var version = (msg.version != null) ? msg.version : "En attente d'informations";
        var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
        var battery_level = (msg.battery_level != null) ? msg.battery_level : "En attente d'informations";

        var content = makeNodeHeaderDiv(msg);

        // Mise à jour de la table des Nodes (MICROCONTROLEURS)
        var value = [];
        value.push('' + msg.node_id);
        value.push('' + presentation);
        value.push(status);
        value.push('' + version);
        value.push('' + moment(msg.last_update, 'X').format('dddd Do MMMM YYYY, hh:mm:ss'));
        value.push('' + battery_level);

        nodesTab.row('#' + msg.node_id).remove().draw(false);
        nodesTab.row.add(value).draw(false);

        // injecte le slider dans la derniere cellule de chaque ligne du tableau MICROCONTROLEURS
        $('#' + msg.node_id + ' td:eq(5)').html(makeBatteryLevelDiv(battery_level));

        //création de la structure HTML
        if ($('#node-' + msg.node_id).length == 0) {
            // $('#row-' + msg.node_id).remove();
            $('#nodes-panel').append('<div class="col-sm-4" id="node-' + msg.node_id + '"><div class="panel panel-default node"><div class="panel-heading" id="title-node-' + msg.node_id + '" > </div><div id="node' + msg.node_id + '" class="panel-body"></div></div></div>');
        }
        // Mise à jours des information du Node
        $('#title-node-' + msg.node_id).empty();
        $('#title-node-' + msg.node_id).append(content);
    });
    //
    socket.on('update_time', function (msg) {
        var content = "<p><center><h3>" + msg + "</h3></center></p>";
        $('#date_time').empty();
        $('#date_time').html(content);

    });
    //
    socket.on('http_connected', function (msg) {
        //
        var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
        var content = "<p> <strong> Httpd server Connection host :  </strong>" + msg.host + " port:  " + msg.port + "</strong>" + status + "</p>";
        localStorage.setItem("HTTP", JSON.stringify(msg));
        if (msg.err != 0 && msg.err != undefined)
            content += "<p> <strong> ERROR :  </strong>" + msg.err + "</p>";
        $('#http').empty();
        $('#http').html(content);
        //
        var color = (msg.status) ? "#22FF77" : "#FF2277";
        $('#tab-services tr:eq(1) td:eq(2)').css('background-color', color);
        //$("#serial-status").css("background-color",color);

    });
    //
    socket.on('opentsdb_connected', function (msg) {
        //
        console.log(msg);
        var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
        localStorage.setItem("TSDB", JSON.stringify(msg));
        if (msg.error != 0 && msg.error != undefined)
            $("#tsdb-text").html(msg.host + ":" + msg.port + " Error : " + msg.error);
        else
            $("#tsdb-text").html(msg.host + ":" + msg.port);
        //
        $("#tsdb-timestamp").html(msg.timestamp);
        //
        $("#tsdb-status").html(status);
        var color = (msg.status) ? "#22FF77" : "#FF2277";
        //$('#tab-services tr:eq(3) td:eq(2)').css('background-color', color);
        $("#tsdb-status").css("background-color", color);

    });
    //
    socket.on('redis_connected', function (msg) {
        //
        //console.log(msg.port);
        var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";


        //var color = (msg.status) ? "#22FF77":"#FF2277" ;
        //$('#tab-services tr:eq(2) td:eq(2)').css("background-color",color);

        localStorage.setItem("REDIS", JSON.stringify(msg));
        if (msg.error != 0 && msg.error != undefined)
            $("#redis-text").html(msg.host + ":" + msg.port + " " + msg.error);
        else
            $("#redis-text").html(msg.host + ":" + msg.port);
        //
        $("#redis-time").html(msg.timestamp);
        //
        $("#redis-status").html(status);
        var color = (msg.status) ? "#22FF77" : "#FF2277";
        $("#redis-status").css('background-color', color);

    });
    socket.on('update_sensor', function (sensor) {
        //
        //console.log(msg);
        var presentation = (sensor.presentation != null) ? sensor.presentation : "En attente d'informations";
        var model = (sensor.model != null) ? sensor.model : "En attente d'informations";
        var content = "<h4>" + model + " " + presentation + "</h4>"

//        console.log('update_sensor = presentation:' + sensor.presentation +
//        						' model = '+sensor.model + 
//        						' sensor.node_id = '+sensor.node_id+ 
//        						' sensor.id = '+sensor.sensor_id+
//        						(sensor.type==null?' sensor.type=null':' sensor.type.metric = '+sensor.type.metric+' : '+ sensor.value + ' '+sensor.type.unite)
//        					);

        //Création de la structure de chaque sensor
        if ($('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).length == 0) {
            //$('#node' + sensor.node_id).remove;
            //$('#node' + sensor.node_id).append('<div class="panel panel-default"><div class="panel-heading" >' + model + ' '  +presentation + '</div><div id="sensor_' + sensor.node_id + '_' + sensor.sensor_id + '" class="panel-body"></div></div>');
            $('#node' + sensor.node_id).append('<div class="panel panel-default"><div class="panel-heading" id="title_' + sensor.node_id + '_' + sensor.sensor_id + '"></div><div id="sensor_' + sensor.node_id + '_' + sensor.sensor_id + '" class="panel-body"></div></div>');
        }

        // Mise à jours des information des titres des sensor
        if (sensor.presentation != null) {
            $('#title_' + sensor.node_id + '_' + sensor.sensor_id).empty();
            $('#title_' + sensor.node_id + '_' + sensor.sensor_id).html(content);
        }


        //Mise à jours des données sensor
        if (sensor.type != null && sensor.type.metric != undefined && sensor.value != undefined) {

            var metric;

            if (sensor.type.metric == "temperature") {
                makeSensorTemperatureMetric(sensor);
                //   console.log("temp:" + sensor.value + " " + sensor.type.unite + " min : " + sensor.type.min + " max : " + sensor.type.max + "  " + moment(sensor.last_update, 'X').format('dddd Do MMMM YYYY, hh:mm:ss'));

            } else {
                var metric = " <p><strong>" + sensor.type.metric + " : " + sensor.value + " " + sensor.type.unite + "</strong></p><p> min : " + sensor.type.min + " max : " + sensor.type.max + " </p><p>" + moment(sensor.last_update, 'X').format('dddd Do MMMM YYYY, hh:mm:ss') + "</p>";
                $('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).empty();
                $('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).html(metric);
            }

        }


    });

    function makeSensorTemperatureMetric(sensor) {

        //var dDate = new Date(1*sensor.last_update);
        var dDate = Date.now();

        var graphId = 'sensor_' + sensor.node_id + '_' + sensor.sensor_id + '_temperature';
        var graphTemperature = $('#' + graphId)[0];
        if (graphTemperature == null) {
            // creation de la structure
            graphTemperature = $("<div/>").attr("id", graphId);
            // ajout dans le DOM
            $('#sensor_' + sensor.node_id + '_' + sensor.sensor_id).append(graphTemperature);

            $(graphTemperature).highcharts({

                chart: {
                    type: 'areaspline'
                },
                title: {
                    text: ''
                },
                credits: {
                    enabled: false
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        overflow: 'justify'
                    },
                    dateTimeLabelFormats: { // don't display the dummy year
                        month: '%e. %b',
                        year: '%b'
                    },
                },
                yAxis: {
                    title: {
                        text: 'Température ' + sensor.type.unite
                    },
                    min: sensor.type.min,
                    floor: sensor.type.min,
                    max: sensor.type.max,
                    ceiling: sensor.type.max
                },
//		        plotOptions: {
//		            spline: {
//		                lineWidth: 4,
//		                states: {
//		                    hover: {
//		                        lineWidth: 5
//		                    }
//		                },
//		                marker: {
//		                    enabled: false
//		                },
//		                pointInterval: 1000 * 60, // une minute
//		                pointStart: 1 * sensor.value // sensor.last_update
//		            }
//		        },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x:%H:%M:%S}: {point.y:.1f} ' + sensor.type.unite
                },

                series: [{
                    name: sensor.presentation,
                    data: ([[dDate, 1 * sensor.value]])
                }]
            });
        } else {
            // ajout d'une donnée
            var chart = $(graphTemperature).highcharts();
            //limite l'affichage de la courbe aux dernières valeurs
            var time = new Date().getTime();
            var limite1 = new Date(time - 1000 * 60 * 5); // 5 minutes
            // var d1 = new Date(limite1);
            chart.xAxis[0].setExtremes(limite1, dDate);

            // console.log("addPoint temperature = " + sensor.value)


            chart.series[0].addPoint([dDate, 1 * sensor.value]);
        }
    }


    // construit une barre de progression pour l'état de la baterie
    function makeBatteryLevelDiv(prctLevel) {

        console.log("prctLevel" + prctLevel);

        if (isNaN(prctLevel)) {
            prctLevel = -1;
        }


        var classNameUrgence = 'progress-bar-info';
        if (prctLevel < 20) {
            classNameUrgence = 'progress-bar-danger';
        } else if (prctLevel >= 20 && prctLevel < 50) {
            classNameUrgence = 'progress-bar-warning';
        }

        var elDiv = $("<div/>").addClass("progress");
        var elPrgBar = $("<div/>").addClass("progress-bar").addClass(classNameUrgence).appendTo(elDiv);
        if (prctLevel > 0) {
            if (prctLevel > 10) {
                $(elPrgBar).css("width", prctLevel + "%");
            } else {
                $(elPrgBar).css("width", "10%");
            }

        }

        $(elPrgBar).attr("aria-valuenow", prctLevel);
        $(elPrgBar).attr("aria-valuemin", "0");
        $(elPrgBar).attr("aria-valuemax", "100");
        $(elPrgBar).html(prctLevel + "%");

        return elDiv;

    }

    function makeNodeHeaderDiv(msg) {

        var presentation = (msg.presentation != null) ? msg.presentation : "En attente d'informations";
        var version = (msg.version != null) ? msg.version : "En attente d'informations";
        var status = (msg.status == true) ? "CONNECTED" : "DISCONNECTED";
        var battery_level = (msg.battery_level != null) ? msg.battery_level : "En attente d'informations";

        var elDiv = $("<div/>").addClass("presentation");
        $(elDiv).html(presentation);
//          var elDivName = $("<h3/>").html(presentation).appendTo(elDiv);
//          var elPVersion = $("<p/>").addClass("version").html("API Version : "+ version).appendTo(elDiv);
//          var elDivBattery = makeBatteryLevelDiv(msg.battery_level).appendTo(elDiv);
//          var elPTimeRefresh = $("<p/>").addClass("last-time-refresh").html(moment(msg.last_update, 'X').format('dddd Do MMMM YYYY, hh:mm:ss')).appendTo(elDiv);
        return elDiv;
    }


});