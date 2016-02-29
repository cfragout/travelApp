$(function(){
	"user strict";
	var origin_place_id = null;
	var destination_place_id = null;
	var popupSelectedRoute = null;
	var placeModeEnabled = true;
	var currentDay = 0; // Use this var to know which day is currently having activities added
	var predefinedMapMarkers = [
		{ value: 'alligator', name: 'Cocodrilo'},
		{ value: 'airport', name: 'Aeropuerto'},
		{ value: 'aquarium', name: 'Acuario'},
		{ value: 'busstop', name: 'Colectivo'},
		{ value: 'campfire-2', name: 'Fogata'},
		{ value: 'camping-2', name: 'Camping'},
		{ value: 'car', name: 'Auto'},
		{ value: 'casino-2', name: 'Casino'},
		{ value: 'castle-2', name: 'Castillo'},
		{ value: 'caution', name: 'Precaucion'},
		{ value: 'chapel-2', name: 'Iglesia'},
		{ value: 'cow-export', name: 'Granja'},
		{ value: 'cruiseship', name: 'Barco'},
		{ value: 'ferry', name: 'Ferry'},
		{ value: 'fillingstation', name: 'Estacion de servicio'},
		{ value: 'finish', name: 'Meta'},
		{ value: 'flag-export', name: 'Bandera'},
		{ value: 'giraffe', name: 'Zoo'},
		{ value: 'zoo', name: 'Zoo 2'},
		{ value: 'harbor', name: 'Puerto'},
		{ value: 'information', name: 'Informacion'},
		{ value: 'lodging-2', name: 'Alojamiento'},
		{ value: 'museum_art', name: 'Museo'},
		{ value: 'palm-tree-export', name: 'Playa'},
		{ value: 'parkinggarage', name: 'Parking'},
		{ value: 'pin-export', name: 'Pin'},
		{ value: 'poker', name: 'Cartas'},
		{ value: 'oil-2', name: 'Servicios'},
		{ value: 'repair', name: 'Servicios 2'},
		{ value: 'shintoshrine', name: 'Atraccion'},
		{ value: 'smallcity', name: 'Ciudad'},
		{ value: 'star-3', name: 'Punto de interes'},
		{ value: 'start-race-2', name: 'Largada'},
		{ value: 'theater', name: 'Teatro'},
		{ value: 'themepark', name: 'Parque de atracciones'},
		{ value: 'train', name: 'Tren'},
		{ value: 'tramway', name: 'Tranvia'},
		{ value: 'tree', name: 'Arbol'}
	];

	// Load custom map markers into select2
	$.each(predefinedMapMarkers, function(index, marker) {
		$('.popup-activity-icon-select').append('<option value="'+ marker.value +'">'+ marker.name +'</option>')
	});

	$('#add-day').click(function(){
		addDay();
		$('#itinerary-container').mCustomScrollbar('scrollTo', '#add-day');
	});

	$('.popup-activity-icon-select').select2({
		templateResult: selectFormatterFunction,
		minimumResultsForSearch: Infinity,
		placeholder: 'Marcador por defecto'
	});
	$('#popup-activity-icon-two + span').hide();
	$($('.select2-selection__arrow')[1]).attr('style', 'height: 45px !important'); // Horrible CSS fix.

	$('#scrollable-itinerary-container').mCustomScrollbar({
		axis:"yx",
		autoHideScrollbar: true,
		setHeight:400,
		// setWidth: 300,
		// theme: 'minimal'
		theme: 'dark-thin'
	});
	scrollToElementId('#time-hour-eight');

	$('#itinerary-container').mCustomScrollbar({
		axis:"x",
		// theme:"minimal",
		theme:"dark-thin",
		advanced:{autoExpandHorizontalScroll:true}
	});


	$('.colour-opt').click(function(){
		$('.colour-opt').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#activity-map-mode-selector').click(function(){
		if (placeModeEnabled) {
			$('#popup-activity-place').hide();
			$('#popup-activity-from, #popup-activity-to, #directions-mode-selector').show();
			$('#activity-map-mode-selector').text('Places');
			$('#popup-activity-icon-two + span').show();
		} else {
			$('#popup-activity-icon-two + span').hide();
			$('#activity-map-mode-selector').text('Directions');
			$('#popup-activity-place').show();
			$('#popup-activity-from, #popup-activity-to, #directions-mode-selector').hide();
		}
		placeModeEnabled = !placeModeEnabled;
		google.maps.event.trigger(popupMap, 'resize'); // Trigger resize so that controls are updated
	});

	$('#popup-cancel').click(function(){
		$.magnificPopup.close();
		resetPopup();
	});

	// Update currentDay. This lets us know where will the new activity be added.
	$('#day-controls-container').on('click', '.open-popup-link', function(){
		currentDay = $(this).attr('data-day-index');
	});

	$('#popup-accept').click(function(){
		var startTime = parseInt($('#popup-activity-start').val());
		var length = parseInt($('#popup-activity-length').val()) - startTime;
		var activity = {
			name: $('#popup-activity-name').val(),
			start: startTime,
			length: length,
			isRoute: placeModeEnabled,
			colour: $('.colour-opt.selected').css('background-color')
		};

		if (placeModeEnabled) {
			var placeMarker = popupMapMarkers.pop();
			placeMarker.setMap(map);
			mainMapMarkers.push(placeMarker);
			mainMapBounds.extend(placeMarker.position);
			activity.marker = placeMarker;
		} else {
			mainMapRoutes.push(popupSelectedRoute);
			var routeDisplay = new google.maps.DirectionsRenderer();
			routeDisplay.setDirections(popupSelectedRoute);
			routeDisplay.setMap(map);
			mainMapBounds.union(popupSelectedRoute.routes[0].bounds);
			mainMapDirectionDisplays.push(routeDisplay);
			activity.routeDisplay = routeDisplay;
		}


		addActivity(activity);

		map.fitBounds(mainMapBounds);
		$.magnificPopup.close();
		resetPopup();
	});

	function addActivity(activity) {
		var dayIndex = currentDay;

		days[dayIndex].activities.push(activity);

		// Get the default template and adapt it for the new activity.
		var activityHTML = $('#activity-template').clone()[0];
		var activityId = 'd'+ dayIndex +'a' + days[dayIndex].activities.length;
		$(activityHTML).attr('id', activityId);
		var activityNameHTML = $(activityHTML).find('.activity-name')[0];
		$(activityNameHTML).text(activity.name);

		// Calculate the activity height and top.
		$(activityHTML).css(getActivityCSS(activity));

		// Add the new activity to the proper day, at the proper time of day and with the proper length in the grid (height);
		var containerId = '#d'+ dayIndex +'-activities-container';

		$(containerId).append(activityHTML);
		$(activityHTML).fadeIn();

		scrollToElementId('#' + activityId);
	}

	function addDay() {
		var dayIndex = days.length;

		if (days[dayIndex] == null) {
			days[dayIndex] = {
				activities: []
			};
		}

		// Get the default template for days controls
		var dayControlHtml = $('#day-template').clone()[0];
		var dayControlId = 'd' + dayIndex;
		$(dayControlHtml).attr('id', dayControlId);
		var dayNameHTML = $(dayControlHtml).find('.day-name')[0];
		$(dayNameHTML).text('Dia ' + (dayIndex + 1));

		var openPopupLinkHTML = $(dayControlHtml).find('a')[0];
		var openPopupLinkId = dayControlId + '-popup-trigger';
		$(openPopupLinkHTML).attr('id', openPopupLinkId);
		$(openPopupLinkHTML).attr('data-day-index', dayIndex);
		$('#day-controls-container').append(dayControlHtml);
		$(dayControlHtml).fadeIn();

		// Get the default template for days container
		var dayContainerHTML = $('#day-container-template').clone()[0];
		var dayConatinerId = 'd' + dayIndex + 'c';
		$(dayContainerHTML).attr('id', dayConatinerId);
		var dayActivitiesContainerHTML = $(dayContainerHTML).find('div')[0];
		$(dayActivitiesContainerHTML).attr('id', 'd'+ dayIndex +'-activities-container');
		$('#days-container').append(dayContainerHTML);
		$(dayContainerHTML).fadeIn();

		// Move add day button and place it to the right of the newly added day
		var addDayButtonHTML = $('#add-day').detach();
		$('#day-controls-container').append(addDayButtonHTML);

		// Initialize the popup plugin for the newly created link
		initializePopupPlugin('#' + openPopupLinkId);
	}

	function initializePopupPlugin(triggerElementSelector) {
		$(triggerElementSelector).magnificPopup({
			type:'inline',
			removalDelay: 300,
			mainClass: 'mfp-fade',
			midClick: true,
			callbacks: {
				open: function() {
					initPopupMapAndUI();
				},
				close: function() {
					resetPopup();
				}
			}
		});
	}

	$('#activity-next-button').click(function(){
		goToPopupStep();
	});

	function scrollToElementId(elementId) {
		$('#scrollable-itinerary-container').mCustomScrollbar('scrollTo', elementId);
	}

	function selectFormatterFunction(state) {
		if (!state.id) {
			return state.text;
		}

		var $state = $(
			'<span><img src="../assets/map-icons/' + state.element.value.toLowerCase() + '.png" class="img-marker" /> <span class="select2-option-text">' + state.text + '</span></span>'
		);
		return $state;
	}

	function getCSSPropertyValueAsInt(selector, property) {
		var intValue = parseInt($(selector).css(property));
		if (isNaN(intValue)) {
			return 0;
		}

		return intValue;
	}

	function getActivityCSS(activity) {
		// Vertical Offset and height
		var hourOffset = getCSSPropertyValueAsInt('.time-hour', 'height');
		var timeHourBorderTop = getCSSPropertyValueAsInt('.time-hour', 'border-top');
		var timeHourBorderBottom = getCSSPropertyValueAsInt('.time-hour', 'border-bottom');
		var timeGridMargin = getCSSPropertyValueAsInt('#time-grid', 'margin-top');
		var hourTotalHeight = hourOffset + timeHourBorderTop + timeHourBorderBottom; // Total height of an hour is its height + its borders top and bottom
		var cssPosition = ((activity.start - 1) * hourTotalHeight) + timeGridMargin;
		var cssHeight = activity.length * hourTotalHeight;

		// Horizontal offset
		var dayOffset = getCSSPropertyValueAsInt('.day-control', 'width') + getCSSPropertyValueAsInt('.day-control', 'padding-right') + getCSSPropertyValueAsInt('.day-control', 'padding-left');
		var timeHourTextOffset = getCSSPropertyValueAsInt('.time-hour span', 'width') / 2;
		var cssLeft = (dayOffset * currentDay) + timeHourTextOffset;

		return {
			'top': cssPosition + 'px',
			'left': cssLeft + 'px',
			'height': cssHeight + 'px',
			'background-color': activity.colour
		};
	}

	function computeTotalTimeAndDistance(result) {
		var distance = 0;
		var time = 0;
		var route = result.routes[0];

		for (var i = 0; i < route.legs.length; i++) {
			distance += route.legs[i].distance.value;
			time += route.legs[i].duration.value;
		}

		distance = distance / 1000;
		distance = distance.toFixed(2);
		$('#directions-distance').text(distance + ' km');
		$('#directions-time').text(secondsToFriendlyTime(time));
		$('#directions-information').animate({'top': '395px'});
	}

	// Translate seconds to an easy to read representation
	function secondsToFriendlyTime(secondsCount) {
		var remainingTime = secondsCount;
		var days = Math.floor((remainingTime / 3600) / 24);
		var result;

		if (days > 0) {
			remainingTime = secondsCount - (days * 3600 * 24);
		}

		var hours = Math.floor(remainingTime / 3600);
		var minutes = Math.floor((remainingTime - (hours * 3600)) / 60);
		var seconds = remainingTime - (hours * 3600) - (minutes * 60);

		if (days > 0) {
			result = days + ' dia';

			if (days > 1) result += 's';
		}

		if (hours > 0) {
			if (days > 0) {
				result += ' ' + hours + ' hora';
			} else {
				result = hours + ' hora';
			}

			if (hours > 1) result += 's';
		}

		if (minutes > 0) {
			if (hours > 0) {
				result += ' ' + minutes + ' minuto';
			} else {
				result = minutes + ' minuto';
			}

			if (minutes > 1) result += 's';
		}

		return result;
	}

	function goToPopupStep(stepIndex) {
		var effectDuration = 600;
		var showingFirstStep = parseInt($('#popup-step-one').css('left')) == 0;
		var goToStep = stepIndex;

		// If stepIndex is not defined, work as a toggle;
		if (stepIndex == null) {
			goToStep = showingFirstStep ? 1 : 0;
		}

		if ( (goToStep == 0) && (showingFirstStep) ) {
			return;
		}

		if ( (goToStep == 1) && (!showingFirstStep) ) {
			return;
		}

		if (goToStep == 1) {
			// Go to second step
			$('#popup-step-one').animate({"left": '-2000'}, effectDuration);
			$('#popup-step-two').animate({"left": '0'}, effectDuration);
			$('#activity-next-button').animate({"left": '3%'}, effectDuration).text('<');
		} else {
			// Go to first step
			$('#popup-step-two').animate({"left": '800px'}, effectDuration);
			$('#popup-step-one').animate({"left": '0'}, effectDuration);
			$('#activity-next-button').animate({"left": '85%'}, effectDuration).text('>');
		}
	}

	function resetPopup() {
		resetMap(popupMap, popupMapMarkers);
		resetPopupMapControls();
		popupSelectedRoute = null;
		directionsDisplay.setMap(null);
		goToPopupStep(0);
		// Reset receipt component
		resetReceiptComponent();
	}

	function resetMap(map, mapMarkers) {
		map.setCenter(defaultLocation);
		map.setZoom(8)
		resetMarkers(mapMarkers);
	}

	function resetPopupMapControls() {
		$('.popup-map-input-text').val('');
	}

	function resetMarkers(markers) {
		// Clear out the old markers.
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];
	}

	function centerMapToIncludeMarkers(aMap) {
		var bounds = new google.maps.LatLngBounds();

		$.each(mainMapMarkers, function(index, marker){
			bounds.extend(marker.position);
		});

		map.fitBounds(bounds);
	}

	function initPopupMapAndUI() {
		if (popupMap != null) {
			return;
		}

		$('[role="timepicker"]').timepicki({
				show_meridian:false,
				min_hour_value:0,
				max_hour_value:23,
				step_size_minutes:15,
				start_time:['12','00','AM'],
				increase_direction:'up',
				disable_keyboard_mobile: true});

		var sydneyLocation = {lat: -34.397, lng: 150.644};
		popupMap = new google.maps.Map(document.getElementById('popup-map'), {
			center: defaultLocation || sydneyLocation,
			zoom: 8,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			disableDefaultUI: true
		});

		directionsDisplay = new google.maps.DirectionsRenderer({
			draggable: true
		});

		// Update results if user drags the route
		directionsDisplay.addListener('directions_changed', function() {
			popupSelectedRoute = directionsDisplay.getDirections();
			computeTotalTimeAndDistance(popupSelectedRoute);
		});

		initPlacesAutocomplete();
		initDirectionsAutocompletes();
	}

	function initPlacesAutocomplete() {
		// Create the search box and link it to the UI element.
		var input = document.getElementById('popup-activity-place');
		var searchBox = new google.maps.places.SearchBox(input);
		popupMap.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

		// Bias the SearchBox results towards current map's viewport.
		popupMap.addListener('bounds_changed', function() {
			searchBox.setBounds(popupMap.getBounds());
		});

		// [START region_getplaces]
		// Listen for the event fired when the user selects a prediction and retrieve
		// more details for that place.
		searchBox.addListener('places_changed', function() {
			var places = searchBox.getPlaces();

			if (places.length == 0) {
				return;
			}

			resetMarkers(popupMapMarkers);

			// For each place, get the icon, name and location.
			var bounds = new google.maps.LatLngBounds();
			places.forEach(function(place) {
				var icon = {
					url: place.icon,
					size: new google.maps.Size(71, 71),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(17, 34),
					scaledSize: new google.maps.Size(25, 25)
				};
				// Create a marker for each place.
				popupMapMarkers.push(new google.maps.Marker({
					map: popupMap,
					icon: icon,
					title: place.name,
					position: place.geometry.location
				}));

				if (place.geometry.viewport) {
					// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}
			});
			popupMap.fitBounds(bounds);
		});
		// [END region_getplaces]
	}

	// Sets a listener on a radio button to change the filter type on Places
	// Autocomplete.
	function setupClickListener(id, mode) {
		var radioButton = document.getElementById(id);
		radioButton.addEventListener('click', function() {
			travel_mode = mode;
			route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
		});
	}

	function initDirectionsAutocompletes() {
		var origin_input = document.getElementById('popup-activity-from');
		var destination_input = document.getElementById('popup-activity-to');
		var modes = document.getElementById('directions-mode-selector');

		popupMap.controls[google.maps.ControlPosition.TOP_LEFT].push(origin_input);
		popupMap.controls[google.maps.ControlPosition.TOP_LEFT].push(destination_input);
		popupMap.controls[google.maps.ControlPosition.TOP_LEFT].push(modes);

		var origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
		origin_autocomplete.bindTo('bounds', popupMap);
		var destination_autocomplete =
		new google.maps.places.Autocomplete(destination_input);
		destination_autocomplete.bindTo('bounds', popupMap);

		setupClickListener('changemode-walking', google.maps.TravelMode.WALKING);
		setupClickListener('changemode-transit', google.maps.TravelMode.TRANSIT);
		setupClickListener('changemode-driving', google.maps.TravelMode.DRIVING);

		origin_autocomplete.addListener('place_changed', function() {
			var place = origin_autocomplete.getPlace();
			if (!place.geometry) {
				window.alert("Autocomplete's returned place contains no geometry");
				return;
			}
			expandViewportToFitPlace(popupMap, place);

			// If the place has a geometry, store its place ID and route if we have
			// the other place ID
			origin_place_id = place.place_id;
			route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
		});

		destination_autocomplete.addListener('place_changed', function() {
			var place = destination_autocomplete.getPlace();
			if (!place.geometry) {
				window.alert("Autocomplete's returned place contains no geometry");
				return;
			}
			expandViewportToFitPlace(popupMap, place);

			// If the place has a geometry, store its place ID and route if we have
			// the other place ID
			destination_place_id = place.place_id;
			route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay);
		});
	}

	function expandViewportToFitPlace(map, place) {
		if (place.geometry.viewport) {
			map.fitBounds(place.geometry.viewport);
		} else {
			map.setCenter(place.geometry.location);
			map.setZoom(17);
		}
	}

	function route(origin_place_id, destination_place_id, travel_mode, directionsService, directionsDisplay) {
		if (!origin_place_id || !destination_place_id) {
			return;
		}

		directionsService.route({
			origin: {'placeId': origin_place_id},
			destination: {'placeId': destination_place_id},
			travelMode: travel_mode,
			provideRouteAlternatives: true
		}, function(response, status) {
			if (status === google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(response);
				directionsDisplay.setMap(popupMap);
				popupSelectedRoute = response;
				computeTotalTimeAndDistance(popupSelectedRoute);
			} else {
				window.alert('Directions request failed due to ' + status);
			}
		});
	}


	/* File Component */
	var inputs = document.querySelectorAll( '.input-file' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
/*			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else*/
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName )
				label.innerHTML = fileName;
			else
				label.innerHTML = labelVal;

			$(label).css({'color': 'white', 'font-weight': '300'});
			$('#popup-input-file-label + .cancel').show();
		});
	});

	$('#popup-input-file-label + .cancel').click(function(){
		resetReceiptComponent();
	});

	function resetReceiptComponent() {
		$('#popup-input-file').val();
		$('#popup-input-file-label + .cancel').hide();
		$('#popup-input-file-label').text('Comprobante').css({'color': '#8D97AD'});
		$('#popup-input-file-label + .cancel').hide();
	}
});