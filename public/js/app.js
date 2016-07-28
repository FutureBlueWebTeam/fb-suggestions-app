//Data
var cities = [{
	city : '8200 Warden Avenue',
	desc : 'IBM Canada Software Lab - Toronto, 8200 Warden Avenue, Markham, ON L6G 1C7',
	lat : 43.84886,
	long : -79.33838
}, {
	city : '3600 Steeles Avenue East',
	desc : 'IBM Canada Ltd., 3600 Steeles Avenue East, Markham, ON L3R 9Z7',
	lat : 43.81838,
	long : -79.33421
}, {
	city : '120 Bloor Street East',
	desc : 'IBM, 120 Bloor Street East, Toronto, ON M4W 1B7',
	lat : 43.67128,
	long : -79.38389
}, {
	city : '3755 Riverside Drive',
	desc : 'IBM Canada Inc., 3755 Riverside Drive, Ottawa, ON K1V 1B8',
	lat : 45.34053,
	long : -75.69045
}, {
	city : '770 Palladium Drive',
	desc : 'IBM, 770 Palladium Drive, Ottawa, ON K2V',
	lat : 45.29837,
	long : -75.92174
}];

//Angular App Module and Controller
angular.module('fb-suggestions-app', ["pageslide-directive"]).controller('appCtrl', function($scope) {

	var mapOptions = {
		zoom : 12,
		center : new google.maps.LatLng(43.84886, -79.33838),
		mapTypeId : google.maps.MapTypeId.ROADMAP,
		disableDefaultUI : true,
		scaleControl : true,
		zoomControl : true,
		zoomControlOptions : {
			style : google.maps.ZoomControlStyle.LARGE
		}
	}

	$scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

	$scope.markers = [];

	var infoWindow = new google.maps.InfoWindow();

	var createMarker = function(info) {

		var marker = new google.maps.Marker({
			map : $scope.map,
			position : new google.maps.LatLng(info.lat, info.long),
			title : info.city
		});
		marker.content = '<div class="infoWindowContent">' + info.desc + '<img class="image-reponsive " src="http://33xlkmrogb473k7z1dknkdmx.wpengine.netdna-cdn.com/wp-content/uploads/2016/05/sushi7.jpg"/>' + '</div>';

		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent('<h2>' + marker.title + '</h2>' + marker.content);
			infoWindow.open($scope.map, marker);
		});

		$scope.markers.push(marker);

	}
	for ( i = 0; i < cities.length; i++) {
		createMarker(cities[i]);
	}

	$scope.winHeight = function() {
		return window.innerHeight;
	};
	$scope.winWidth = function() {
		return window.innerWidth;
	};

	$scope.openInfoWindow = function(e, selectedMarker) {
		e.preventDefault();
		google.maps.event.trigger(selectedMarker, 'click');
	}
	
	// $scope.slideSize = $scope.winWidth()/2;

	$scope.checked = false;
	$scope.size = '100px';
	$scope.toggle = function() {
		$scope.checked = !$scope.checked
	}
	$scope.mockRouteChange = function() {
		$scope.$broadcast('$locationChangeStart');
	}
	$scope.onopen = function() {
		alert('Open');
	}
	$scope.onclose = function() {
		alert('Close');
	}
});

angular.element(document).ready(function() {
	c = angular.element(document.querySelector('#controller-demo')).scope();
});
 