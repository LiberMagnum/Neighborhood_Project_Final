var map;
var dictionary = {};
var markers = [];
var redMarker;
//initialize map
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
		//center set to Nago in Okinawa, Japan
		center: {lat: 26.585192, lng: 128.022772},
		zoom: 10
	});

	//create new infowindow
	var infoWindow = new google.maps.InfoWindow({
		maxWidth: 200
	});
	var blueMarker = makeMarkerIcon('0300d3');
	redMarker = makeMarkerIcon('ff0202');
	//controls the marker colors
	var boolean = false;
	//create a clickhandler function to pass the individual markers to 
	//credit to https://stackoverflow.com/questions/3037598/how-to-fix-jslint-error-dont-make-functions-within-a-loop
	var clickHandler = function(object, infowindow) {
		object.addListener('click', function() {
			toggleInfoWindow(this, infowindow);
		});
	};
	
	//initialize markers array
	for (var i = 0; i < locations.length; i++) {
		//add new markers based on locations given in model.js
		var diveSite = new google.maps.Marker({
		    position: locations[i].position,
		    map: map,
		    icon: redMarker,
		    animation: google.maps.Animation.DROP,
		    name: locations[i].name
		});
		markers.push(diveSite);
		//open infowindow on click
		clickHandler(diveSite, infoWindow);

		findPlaceId(diveSite);

		dictionary[locations[i].name] = diveSite;
	}
	//add info to the infoWindow
	function addInfoWindowContent(location, infowindow) {
		var self = this;
		var details = new google.maps.places.PlacesService(map);
		var request = {
			placeId: location.id
		};
		details.getDetails(request, callback);

		function callback(results, status) {
			self.content = location.name;
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				if (results.formatted_address !== undefined) {
					self.content += '<p>' + results.formatted_address + '</p>';
				}
				if (results.rating !== undefined) {
					self.content += '<p>Rating: ' + results.rating + '</p>';
				}
				if (results.website !== undefined) {
					self.content += '<p>Website: <a target="_blank" href="' + results.website + '">' + results.website + '</a></p>';
				}
			}
			else {
				alert('Could not load Google Places Service. Error Was: ' + status);
			}
			infowindow.setContent(self.content);
		}
	
		infowindow.marker = location;
		infowindow.open(map, location);
		//remove blue color from the marker if the window is closed
		infoWindow.addListener('closeclick', function() {
        	location.setIcon(redMarker);
        	//resets the infowindow's marker when closed
        	infowindow.marker = null;
    	});

	}
	//from udacity maps api course (repo at https://github.com/udacity/ud864)
	//returns a marker in a given color
	function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
        	'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        	'|40|_|%E2%80%A2',
         	new google.maps.Size(21, 34),
        	new google.maps.Point(0, 0),
        	new google.maps.Point(10, 34),
        	new google.maps.Size(21,34));
    	return markerImage;
    }
    //toggles the info window
    function toggleInfoWindow(marker, infowindow) {
    	if (infowindow.getMap() !== null && infowindow.getMap() !== undefined) {
    		infowindow.close();
    		marker.setIcon(redMarker);
    		infowindow.marker = null;
    	}
    	else {
    		addInfoWindowContent(marker, infowindow);
    		marker.setIcon(blueMarker);
    		map.setCenter(marker.position);
    	}
    }
    //finds the place id of a marker
    function findPlaceId(marker) {
    	var placeSearch = new google.maps.places.PlacesService(map);

    	var request = {
    		location: marker.position,
    		radius: '500',
    		query: marker.name
    	};

    	var id;
    	placeSearch.textSearch(request, callback);

    	function callback(results, status) {
    		if (status == google.maps.places.PlacesServiceStatus.OK) {
    			id = results[0].place_id;
    			marker.id = id;
    			return id;
    		}
    		else {
    			alert('Could not load Google Places Service. Error was: ' + status);
    		}
    	}
    }
}

//called when a list element is clicked, toggles whether or not the icon bounces
var toggleBounce = function(element) {
	var marker = dictionary[element];
	if (marker.animation !== null) {
		marker.setAnimation(null);
	}
	else {
		marker.setAnimation(google.maps.Animation.BOUNCE);
		map.setCenter(marker.position);
	}
};

//filters through the markers when the form is submitted
var filter = function(response) {
	markers.forEach(function(marker) {
		if (marker.map === null) {
			marker.setMap(map);
		}
	});
	var elements = response.rows[0].elements;
	var maxTime = $('#max-time').val();
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].duration.value/60 > maxTime) {
			markers[i].setMap(null);
		}
	}
};

//resets the markers
var markerReset = function() {
	markers.forEach(function(marker) {
		if (marker.map === null) {
			marker.setMap(map);
		}
	});
};
