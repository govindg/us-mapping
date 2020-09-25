// Wait until your documnet is ready
$(function() {
    // Function to draw your map
    var map;
    var drawMap = function() {
        map = L.map('map-container').setView([33.83, -96.94], 4);
        var tileLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png');
        tileLayer.addTo(map);
        getData();
    };

    // Function for getting data
    var getData = function() {
        $.get('data/Mass-Shooting-Data.csv', function(data, error) {
            var parseData = Papa.parse(data, {
                header: true
            }).data;
            customBuild(parseData);
        });
    };

    // Loop through your data and add the appropriate layers and points
    var customBuild = function(data) {
        var injuredLayer = L.layerGroup();
        var killedLayer = L.layerGroup();
        data.forEach(function(d) {
            var latlng = L.latLng(d['lat'], d['lng']);
            var rad;
            var hoverText = "There were <span id='injured'>" + d['injured'] + 
                    "</span> injured and <span id='killed'>" + d['killed'] + 
                    "</span> killed in " + d['city'] + ", " + d['state'] + ".";
            /* Adding black circles */
            if (d['injured'] > d['killed']) {
                rad = d['injured'] * 2;
                L.circleMarker(latlng, {
                    color: 'black',
                    radius: rad,
                    fillOpacity: 0,
                    weight: 1
                }).addTo(injuredLayer).bindPopup(hoverText);
            }
            /* Adding red circles */
            else {
                rad = d['killed'] * 2;
                L.circleMarker(latlng, {
                    color: 'red',
                    radius: rad,
                    fillOpacity: 0,
                    weight: 1
                }).addTo(killedLayer).bindPopup(hoverText);
            }

        });
        injuredLayer.addTo(map);
        killedLayer.addTo(map);
        /* Adding options to the Leaflet controller. */
        var overlayMaps = {
            "More Killed": killedLayer,
            "More Injured": injuredLayer
        };
        L.control.layers(null, overlayMaps).addTo(map);
        createTable(data);
    };

    var createTable = function(data) {
        var states = [];
        data.forEach(function(d) {
            if (states[d['state']] == null) {
                states[d['state']] = [d['injured'], d['killed']];
            } else {
                states[d['state']][0] = parseInt(states[d['state']][0]) + parseInt(d['injured']);
                states[d['state']][1] = parseInt(states[d['state']][1]) + parseInt(d['killed']);
            }
        });
        /* This algorithm uses a secondary array to sort each state by the number injured in
        descending order. If there is an equal number of injuries, then the number of
        fatalities is used. */
        var sorted = [];
        for (var state in states) {
            sorted.push([state, states[state][0]]);
            sorted.sort(function(a,b) {
                if (b[1] - a[1] == 0) {
                    return states[b[0]][1] - states[a[0]][1];
                }
                return b[1] - a[1];
            });
        };
        var table = $('<table></table');
        table.addClass('bordered striped');
        var stateHeader = $('<th>State</th>');
        var injuredHeader = $('<th>Injured</th>');
        var killedHeader = $('<th>Killed</th>');
        table.append(stateHeader);
        table.append(injuredHeader);
        table.append(killedHeader);
        sorted.forEach(function(d) {
            var row = $('<tr></tr>');
            var stateCell = $("<td id='state'>" + d[0] + '</td>');
            var injuredCell = $('<td>' + states[d[0]][0] + '</td>');
            var killedCell = $('<td>' + states[d[0]][1] + '</td>');
            row.append(stateCell);
            row.append(injuredCell);
            row.append(killedCell);
            table.append(row);
        });
        $('#table-container').append(table);
    };

    // Execute your drawMap function
    drawMap();
});
