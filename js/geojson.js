/*Megan Roessler, Geography 575*/

function createMap(){
	var map = L.map('map', {
		center: [38, -97],
		zoom: 3.5
	});
	
	L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
	
	getData(map);
};

//Example 2.4
function getData(map){
	$.ajax("data/women-in-congress.geojson", {
        dataType: "json",
        success: function(response){
			 var geojsonMarkerOptions = {
                radius: 8,
                fillColor: "#ffffff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
				pointToLayer: function (feature, latlng){
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			}).addTo(map);
        }
    });
};

//Example 2.5
function onEachFeature(feature, layer) {
    //no property named popupContent; instead, create html string with all properties
    var popupContent = "";
    if (feature.properties) {
        //loop to add feature property names and values to html string
        for (var property in feature.properties){
            popupContent += "<p>" + property + ": " + feature.properties[property] + "</p>";
        }
        layer.bindPopup(popupContent);
    };
};

//function to retrieve the data and place it on the map
function getData(map){
    //load the data
    $.ajax("data/women-in-congress.geojson", {
        dataType: "json",
        success: function(response){

            //create a Leaflet GeoJSON layer and add it to the map
            L.geoJson(response, {
                onEachFeature: onEachFeature
            }).addTo(map);
        }
    });
};

$(document).ready(createMap);