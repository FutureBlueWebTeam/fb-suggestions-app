//Data
var places = [];

//GMaps categories with all non-entertainment entries removed
var sub_categories = ["meal_delivery", "meal_takeaway", "movie_rental", "movie_theater", "museum", "night_club", "park", "pet_store", "restaurant", "shoe_store", "shopping_mall", "spa", "stadium", "store", "university", "amusement_park", "aquarium", "art_gallery", "bakery", "bar", "beauty_salon", "book_store", "bowling_alley", "cafe", "campground", "casino", "clothing_store", "convenience_store", "department_store", "electronics_store", "gym"];
var categories = [
    ["movie_rental", "movie_theater"] 
    , ["pet_store", "shoe_store", "shopping_mall", "store", "book_store", "clothing_store", "convenience_store", "department_store", "electronics_store"]  
    , ["meal_delivery", "meal_takeaway", "restaurant", "cafe", "convenience_store"]
    , ["park", "bowling_alley", "campground", "gym"]
    , ["bar", "night_club", "casino"]
];
var active_categories = [];

var GOOGLE_API_KEY = "AIzaSyBhy9XlaP1zIdzVMPbJanvr9wLqFxT3r-U";


window.onload = function () {
    var mapOptions = {
        zoom: 16
        , center: new google.maps.LatLng(43.84886, -79.33838)
        , mapTypeId: google.maps.MapTypeId.ROADMAP
        , mapTypeControl: false
        , styles: [{
            stylers: [{
                visibility: 'simplified'
            }]
    }, {
            elementType: 'labels'
            , stylers: [{
                visibility: 'off'
            }]
    }, {
            featureType: 'road'
            , elementType: 'all'
            , stylers: [
                {
                    color: '#4178BE'
                }
              ]
            }, {
            featureType: 'all'
            , elementType: 'all'
            , stylers: [
                {
                    hue: '#162F39'
                }
                , {
                    saturation: -2
                },
                {
                    lightness: -80
                }
                , ]
            }]
    }

    var map = new google.maps.Map(document.getElementById('map'), mapOptions);
    var placeService = new google.maps.places.PlacesService(map);

    //Request user's location on load
    getUserLocation(function (lat, lng, isUserLocation) {
        map.panTo({
            lat: lat
            , lng: lng
        });
        if (isUserLocation){
            this.marker = new google.maps.Marker({
                map: map
                , position: new google.maps.LatLng(lat, lng)
                , title: "You are here!"
                , icon: "img/guy.png",
                animation: google.maps.Animation.DROP,
            });
        }
    });

    var markers = []; //Contains all active map markers
    var infoWindow = new google.maps.InfoWindow();

    /* 
    Place object. Contains all information needed to make both markers and info window 
        lat, lng : Location of marker
        placeId : GMaps identifier
        name : Name of place
        desc : Description (we just use top review)
        address : Formatted address string
        categories : All GMaps types describing this place.
    */
    function PlaceObject(arg) {
        this.lat = arg.lat;
        this.lng = arg.lng;
        this.placeId = arg.placeId;
        this.name = arg.name || "Loading...";
        this.desc = arg.desc || "Loading...";
        this.address = arg.address || "Loading...";
        this.categories = arg.categories || [];
        this.isGooglePlace = arg.isGooglePlace;
        this.isLoaded = false;
        this.isDestroyed = false;
        this.imageURL = "";

        this.marker = null; //References the marker

        /*
        Load place-specific details. Is only called on the first mouse event with the marker.
        */
        this.loadDetails = function () {
            if (this.isLoaded || this.isDestroyed) return;
            placeService.getDetails({ //Call details api
                placeId: this.placeId
            }, (placeDetails, status) => { //Arrow function into callback
                if (status === google.maps.places.PlacesServiceStatus.OK) { //Check status
                    this.name = placeDetails.name; //Update details
                    if (placeDetails.reviews && placeDetails.reviews.length > 0) {
                        //Use top review as description
                        this.desc = placeDetails.reviews.reduce(function (last, cur) {
                            if (last.rating < cur.rating) {
                                return cur
                            } else {
                                return last
                            }
                        }).text;
                    } else {
                        this.desc = "No review available."
                    }
                    this.categories = placeDetails.types;
                    this.address = placeDetails.formatted_address;
                    this.rating = placeDetails.rating;
                    this.phone = placeDetails.formatted_phone_number;
                    if (placeDetails.photos) {
                        this.imageURL = placeDetails.photos[0].getUrl({
                            maxWidth: 500
                        });
                    }
                    this.marker.setMap(null); //Destroy existing marker
                    this.createMarker(false);
                    this.isLoaded = true;
                } else {
                    console.warn(status)
                }
            });
        }

        /*
        Create a new marker if one does not exist
        */
        this.createMarker = function (isNew) {
            if (this.isLoaded || this.isDestroyed) return;    
            var icon = {
                url: 'img/pin.png',
                size: new google.maps.Size(30, 40),
                origin: new google.maps.Point(0,0),
                anchor: new google.maps.Point(10, 30)
            };
            this.marker = new google.maps.Marker({
                map: map
                , position: new google.maps.LatLng(this.lat, this.lng)
                , title: this.name
                , icon: icon,
                animation: isNew && markers.length < 20 && map.getZoom() >= 15 ? google.maps.Animation.DROP : null ,
            });

            function intToStars(x) {
                var result = "";
                for (var i = 0; i < x; i++) {
                    result += "&#9733;"
                }
                return result;
            }
            var imgHTML;
            if (this.imageURL) {
                imgHTML = '<div class="img-wrapper"><img src="' + this.imageURL + '" alt="Porcelain Factory of Vista Alegre"></div>'
            } else {
                imgHTML = "";
            }
            this.marker.content = '<div class="infoWindowContent"><h2 class="iw-title">' + this.name + '</h2><p class="iw-rating">' + intToStars(this.rating) + '</p>' + imgHTML + '<p class="iw-desc">' + this.desc + '</p><p class="iw-phone">' + this.phone + '</p></div>';
            markers.push(this.marker);

            google.maps.event.addListener(this.marker, 'mouseover', () => {
                this.loadDetails();
            });

            google.maps.event.addListener(this.marker, 'click', () => {
                infoWindow.setContent(this.marker.content);
                window.setTimeout(() => {
                    infoWindow.open(map, this.marker);
                }, 300);

            });
        }

        this.destroy = function () {
            this.isDestroyed = true;
            this.marker.setMap(null);
        }
    }

    /*
    Wrapper for the radar search
        keyword : A query string that will search name, description, type, etc
        callback : Function that will receive the partially-loaded place objects
    */
    document.getElementById("search-bar").value="IBM";
    placeService.easyRadarSearch = function (callback) {
        var request = {
            bounds: map.getBounds()
            , keyword: document.getElementById("search-bar").value
            , openNow: false
            , types: searchQuery ? null : active_categories
        };

        //Processes the returned results for just the information we need
        function processResults(results, status) {
            var parsedResults = [];
            if (status == google.maps.places.PlacesServiceStatus.OK) { //Check for OK status
                newResults = [];
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    //Create the object
                    var newPlace = new PlaceObject({
                        lat: place.geometry.location.lat()
                        , lng: place.geometry.location.lng()
                        , placeId: place.place_id
                        , isGooglePlace: true
                    });
                    newPlace.createMarker(true);
                    newResults.push(newPlace);
                }
                callback(newResults); //We can continue with the callback as the details will reload later
            } else {
                callback([]);
            }
        }

        placeService.radarSearch(request, processResults); //Call the api
    };


    //On bounds change, do a radar search
    var MAX_PLACES_LOADED = 300;
    var searchQuery = null;

    /*
     * Forces all markers to clear.
     */
    function clearMarkers() {
        markers = [];
        for (var i = 0; i < places.length; i++) {
            places[i].destroy();
        }
        places = [];
    }

    /*
     * Loads new markers.
     */
    function loadNewPlaces() {
        placeService.easyRadarSearch(function (data) {
            if (places.length > MAX_PLACES_LOADED) {
                markers = [];
                for (var i = 0; i < places.length; i++) {
                    places[i].destroy();
                }
                places = data;
            } else {
                places = removeDuplicatePlaces(places.concat(data));
            }
        });
    }
    google.maps.event.addListener(map, 'bounds_changed', function () {
        loadNewPlaces();
    });


    // -----------------------------------------Search Functionality-------------------------------------------------//


    /**
     * Reloads the places with the query and selected category filters
     */
    function submitSearch() {
        var searchQuery = document.getElementById("search-bar").value;
        clearMarkers();
        loadNewPlaces();
    }
    document.getElementById("search-button").onclick = submitSearch;

    /*
     TODO: Content assist and client-side place filtering.
     */
    document.getElementById("search-bar").onkeyup = function () {
        var ENTER = 13;
        if (event.keyCode == ENTER) {
            submitSearch();
            return;
        }else{
            getAutocompleteSuggestions(this.value, function(data){
                var htmlStr = "";
                for (var i=0; i<data.length && i<5; i++){
                    htmlStr+="<p class='autocomplete-item'>"+data[i]+"</p>"
                }
                document.getElementById("search-suggestions").innerHTML=htmlStr;
                var els = document.getElementsByClassName("autocomplete-item");
                for (var i=0; i<els.length; i++){
                    els[i].addEventListener("click", function(e){
                        document.getElementById("search-bar").value = e.target.innerHTML;
                        submitSearch();
                    }, false);
                }
            });
        }
    }


    /*
     Removes duplicate PlaceObjects from array, preferring older entries
     */
    function removeDuplicatePlaces(array) {
        var a = array.concat();
        for (var i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i].placeId === a[j].placeId) {
                    a[j].destroy();
                    a.splice(j--, 1);
                }
            }
        }
        return a;
    }

    /*
    HTML5 Geolocation
    */
    function getUserLocation(callback) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) { //Ask for user's location
                    callback(position.coords.latitude, position.coords.longitude, true);
                }
                , function (error) { //If permission is denied...
                    callback(43.848855, -79.338380, false);
                }
            );
        } else { //If geolocation is not supported...
            callback(43.848855, -79.338380, false);
        }
    }
    
    /*
    Autocompletion for search
    */
    var autocompleteService = new google.maps.places.AutocompleteService();
    function getAutocompleteSuggestions(input, callback){
        if (!input) callback([]);
        var request = { //Should we add location biasing here?
            types: "establishment",
            input: input,
            key: GOOGLE_API_KEY,
            output: "json"
        }
        autocompleteService.getQueryPredictions(request, function(data){data ? callback(data.map(function(p){return p.description})): callback([])});
    }

    //Slider code
    var menuHidden = false;

    function animateSliderMenu() {
        if (menuHidden) {
            document.getElementById("menu").className = "slide-menu-left";
            document.querySelector("#hamburger > span").className = "glyphicon glyphicon-menu-hamburger";
        } else {
            document.getElementById("menu").className = "slide-menu-right";
            document.querySelector("#hamburger > span").className = "glyphicon glyphicon-menu-left";
        }
    }
    document.getElementById("hamburger").onclick = function () {
        menuHidden = !menuHidden;
        animateSliderMenu();
    }
    animateSliderMenu();


    //Tabs code
    var menuTab = 0;

    function updateTab() {
        switch (menuTab) {
        case 0:
            document.querySelector(".category-wrapper").style.display = "inherit";
            document.querySelector(".login-wrapper").style.display = "none";
            break;
        case 1:
            document.querySelector(".category-wrapper").style.display = "none";
            document.querySelector(".login-wrapper").style.display = "inherit";
            break;
        }
    }

    document.getElementById("cat-tab").onclick = function (e) {
        var el = document.querySelector(".tab-selected")
        if (el) el.className = "tab";
        e.target.className = "tab tab-selected";
        menuTab = 0;
        updateTab();
    }
    document.getElementById("user-tab").onclick = function (e) {
        document.querySelector(".tab-selected").className = "tab";
        e.target.className = "tab tab-selected";
        menuTab = 1;
        updateTab();
    }

    //Category 
    var selectedCat = null;
    var catButtons = document.getElementsByClassName("category-item");
    for (var i = 0; i < catButtons.length; i++)(function (i) {
        catButtons[i].onclick = function (e) {
            if (i == selectedCat && i !== 5) return;
            searchQuery=null;
            document.getElementById("search-bar").value="";
            document.getElementById("search-suggestions").innerHTML="";
            if (i == 5) { //6th element is random category
                active_categories = [sub_categories[Math.floor(Math.random() * sub_categories.length)]]; //Return random sub cat
            } else {
                active_categories = categories[i];
            }
            var el = document.getElementsByClassName("category-item-selected");
            if(el.length)  el[0].className = "category-item";
            e.target.className = "category-item category-item-selected";
            selectedCat = i;
            submitSearch();
        };
    })(i);
    
    google.maps.event.addListenerOnce(map, 'tilesloaded', function(){
        //Default search
        submitSearch();
    })
}