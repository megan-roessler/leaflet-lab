/*Megan Roessler, Geography 575*/

//Create basemap
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

//Load geojson data to map
function getData(map){
	$.ajax("data/women-in-congress1.geojson", {
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
            //add leaflet GeoJSON to map
            L.geoJson(response, {
				pointToLayer: function (feature, latlng){
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			}).addTo(map);
        }
    });
};


//Create function to calculate prop symbol radius
function calcPropRadius(attValue) {
	var scaleFactor = 50;
	var area = attValue * scaleFactor;
	var radius = Math.sqrt(area/Math.PI);
	
	return radius;
};

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/women-in-congress1.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(response, map);
        }
    });
};

function pointToLayer(feature, latlng){
	var attribute = "116th_congress";
	
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
	};
	
	var attValue = Number(feature.properties[attribute]);
	options.radius = calcPropRadius(attValue);
	
	var popupContent = "<p><b>State:</b>" + feature.properties.State + "</p>";
	
	layer.bindPopup(popupContent);
	
	return layer;
	createPropSymbols.on('click', pointToLayer);
};

//Create proportional symbols
//Add circle markers for point features to the map
function createPropSymbols(data, map){
	var attribute = "116th_congress";
    //create marker options
    var geojsonMarkerOptions = {
        radius: 8,
        fillColor: "#ffffff",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    };

    //Create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
			var attValue = Number(feature.properties[attribute]);
			console.log(feature.properties, attValue)
			geojsonMarkerOptions.radius = calcPropRadius(attValue);
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    }).addTo(map);
};




//call function
$(document).ready(createMap);
