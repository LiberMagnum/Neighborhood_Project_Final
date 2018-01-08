//uses Knockout framework
var DiveSpot = function(data) {
	this.name = ko.observable(data.name);
	this.latLng = ko.observableArray([data.position.lat, data.position.lng]);
	this.img = ko.observable('');
	this.showDropdown = ko.observable(false);
	this.showName = ko.observable(true);
	this.id = ko.observable('');
	this.tips = ko.observable('');
	this.moreInfoLink = ko.observable('');
};

var viewModel = function() {
	var self = this;

	//creates a list of locations and latlngs using observable arrays
	this.locationList = ko.observableArray([]);
	this.latLngs = [];

	locations.forEach(function(location) {
		self.locationList.push(new DiveSpot(location));
	});

	this.locationList().forEach(function(location) {
		self.latLngs.push({lat: location.latLng()[0], lng: location.latLng()[1]});
	});

	//finds images for each item in the list
	this.imageFinder = function(element) {
		//uses foursquare api
		this.ll = element.latLng()[0] + ',' + element.latLng()[1];
		this.search = 'https://api.foursquare.com/v2/venues/search?'+ 
			'client_id=BUDS1D5K2ZIUUDJYC0KJQK4VLAPE1ETKWYJGG455Z4FJ5EFF' +
  			'&client_secret=STVZLJOV5WUHIZEEWPIDHN1EZ1KLRJWWPZ2DC1VHUECD01NQ' +
  			'&ll=' + this.ll +
  			'&query=' + element.name() + 
  			'&v=20171220';
  		$.ajax({
  			url: this.search,
  			type: "GET",
  			dataType: "jsonp"
  		}).done(function(results) {
  			if (results.meta.code === 200) {
  				element.id(results.response.venues[0].id);
  			}
  			else {
  				alert('Could not load FourSquare data. Error was: ' + results.meta.errorType);
  			}
  			$.ajax({
		  		url: 'https://api.foursquare.com/v2/venues/'+ element.id() +
		  			'?client_id=BUDS1D5K2ZIUUDJYC0KJQK4VLAPE1ETKWYJGG455Z4FJ5EFF' +
		  			'&client_secret=STVZLJOV5WUHIZEEWPIDHN1EZ1KLRJWWPZ2DC1VHUECD01NQ' +
		  			'&v=20171220',
		  		type: "GET",
		  		dataType: "jsonp"
		  	}).done(function(response) {
		  		if (results.meta.code === 200) {
			  		this.photo = response.response.venue.bestPhoto;
			  		this.firstTip = response.response.venue.tips.groups[0].items[0].text;
			  		this.url = response.response.venue.canonicalUrl;
					
			  		if (this.photo !== undefined) {
			  			this.url = this.photo.prefix + this.photo.width + 'x' + this.photo.height + 
			  				this.photo.suffix;
			  			element.img(this.url);
			  		}
			  		
			  		if (this.firstTip !== undefined) {
			  			element.tips(this.firstTip);
			  		}

			  		if (this.url !== undefined) {
			  			element.moreInfoLink(this.url);
			  		}
			  	
		  		}
		  		else {
		  			alert('Could not load FourSquare data. Error was: ' + results.meta.errorType);
		  		}
		  	});
  		});
	};

	this.locationList().forEach(function(location) {
		self.imageFinder(location);
	});

	//toggles dropdown when a list item is clicked
	this.toggleDropdown = function(element) {
		if (element.showDropdown() === false) {
			element.showDropdown(true);
		}
		else {
			element.showDropdown(false);
		}
	};

	this.showInfo = function(element) {
		toggleBounce(element.name());
		if (element.img() === '') {
			self.toggleDropdown(element);
		}
		else {
			self.toggleDropdown(element);
		}
	};

	//toggles the sidebar
	this.toggleListView = function() {
		this.list = $('#sidebar');
		this.map = $('#map');
		this.icon = $('#menu');

		if (this.list.css('display') !== 'block') {
			this.list.css('display', 'block');
			this.map.css('width', '100%');
			this.icon.css('left', '400px');
		}
		else {
			this.list.css('display', 'none');
			this.map.css('width', '100%');
			this.icon.css('left', '0%');
		}
	};

	//filters locations based on distance form a given address
	this.findDistance = function() {
		this.googleDistance = new google.maps.DistanceMatrixService();

		this.timeRestraint = $('#max-time').val();
		this.address = $('#search-box').val();

		this.googleDistance.getDistanceMatrix({
			origins: [this.address],
			destinations: self.latLngs,
			travelMode: 'DRIVING'
		}, function(response, status) {
			if (status === google.maps.DistanceMatrixStatus.OK) {
				filter(response);

				self.locationList().forEach(function(location) {
					if (location.showName() === false) {
						location.showName(true);
					}
				});

				this.elements = response.rows[0].elements;
				this.maxTime = $('#max-time').val();
				for (var i = 0; i < this.elements.length; i++) {
					if (this.elements[i].duration.value/60 > maxTime) {
						self.locationList()[i].showName(false);
					}
				}
			}
			else {
				alert('Could not load Google Distance Matrix Service. Error was: ' + status);
			}
		});
	};

	//resets the markers and list view
	this.reset = function() {
		self.locationList().forEach(function(location) {
			if (location.showName() === false) {
				location.showName(true);
			}
		});
		markerReset();
	};
};

ko.applyBindings(new viewModel());
