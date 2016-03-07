$(function(){
	"user strict";
	var MODE_ROUTE = 'ROUTE';
	var MODE_PLACES = 'PLACES';
	var origin_place_id = null;
	var baseMarkerUrl = "http://localhost:3000/assets/map-icons/"; // May need Update this
	var placeRouteSelectedMarkerUrl = baseMarkerUrl + "/pr-selected/";
	var placeRouteMarkerUrl = baseMarkerUrl + "/pr/";
	var pointOfReferenceMarkerUrl = baseMarkerUrl + "/por/";
	var markerImgExtention = ".png";
	var destination_place_id = null;
	var origin_autocomplete;
	var destination_autocomplete;
	var popupSelectedRoute = null;
	var editingActivityId = null; // Use this to know which activity is being edited
	var pointsOfReferenceGroupCount = 0; // Use this var to enable or disable the points of reference dropdown
	var pointsOfReferenceGroups = [];
	var pointsOfReference = [];
	var placeModeEnabled = true; // Use this var to know whether the user is adding a place or directions
	var currentDay = 0; // Use this var to know which day is currently having activities added
	var predefinedMapMarkers = [
		{ value: 'default', name: 'Marcador por defecto'},
		{ value: 'pin-export', name: 'Pin'},
		{ value: 'star-3', name: 'Punto de interes'},
		{ value: 'start-race-2', name: 'Largada'},
		{ value: 'finish', name: 'Meta'},
		{ value: 'flag-export', name: 'Bandera'},

		{ value: 'car', name: 'Auto'},
		{ value: 'cruiseship', name: 'Barco'},
		{ value: 'ferry', name: 'Ferry'},
		{ value: 'train', name: 'Tren'},
		{ value: 'tramway', name: 'Tranvia'},
		{ value: 'busstop', name: 'Colectivo'},
		{ value: 'airport', name: 'Aeropuerto'},

		{ value: 'travel_agency', name: 'Viaje'},

		{ value: 'lodging-2', name: 'Alojamiento'},

		{ value: 'fillingstation', name: 'Estacion de servicio'},
		{ value: 'oil-2', name: 'Servicios'},
		{ value: 'repair', name: 'Servicios 2'},

		{ value: 'campfire-2', name: 'Fogata'},
		{ value: 'camping-2', name: 'Camping'},
		{ value: 'kayak1', name: 'Kayak'},
		{ value: 'walkingtour', name: 'Caminata'},
		{ value: 'fishing', name: 'Pesca'},
		{ value: 'photo', name: 'Punto panoramico'},
		{ value: 'beautifulview', name: 'Punto panoramico 2'},
		{ value: 'waterfall-2', name: 'Cascada'},
		{ value: 'volcano-2', name: 'Volcan'},
		{ value: 'canyon-2', name: 'Cañon'},
		{ value: 'desert-2', name: 'Desierto'},
		{ value: 'forest2', name: 'Bosque'},
		{ value: 'mountains', name: 'Montaña'},
		{ value: 'palm-tree-export', name: 'Playa'},

		{ value: 'caution', name: 'Precaucion'},
		{ value: 'information', name: 'Informacion'},
		{ value: 'firstaid', name: 'Salud 1'},
		{ value: 'ambulance', name: 'Salud 2'},

		{ value: 'paragliding', name: 'Paracaidas'},
		{ value: 'scubadiving', name: 'Buceo'},
		{ value: 'skiing', name: 'Ski'},
		{ value: 'snorkeling', name: 'Snorkel'},
		{ value: 'stadium', name: 'Estadio'},
		{ value: 'theater', name: 'Teatro'},
		{ value: 'themepark', name: 'Parque de atracciones'},
		{ value: 'aquarium', name: 'Acuario'},
		{ value: 'casino-2', name: 'Casino'},
		{ value: 'museum_art', name: 'Museo'},
		{ value: 'art-museum-2', name: 'Museo 2'},
		{ value: 'museum_crafts', name: 'Historia'},
		{ value: 'museum_war', name: 'Historia 2'},
		{ value: 'chapel-2', name: 'Iglesia'},
		{ value: 'cow-export', name: 'Granja'},
		{ value: 'giraffe', name: 'Zoo'},
		{ value: 'zoo', name: 'Zoo 2'},
		{ value: 'harbor', name: 'Puerto'},
		{ value: 'drink', name: 'Bebida'},
		{ value: 'burger', name: 'Comida'},
		{ value: 'supermarket', name: 'Mercado'},
		{ value: 'congress', name: 'Gobierno'},
		{ value: 'postal', name: 'Correo'},
		{ value: 'castle-2', name: 'Castillo'},
		{ value: 'parkinggarage', name: 'Parking'},
		{ value: 'poker', name: 'Cartas'},
		{ value: 'shintoshrine', name: 'Atraccion'},
		{ value: 'smallcity', name: 'Ciudad'},
		{ value: 'tree', name: 'Arbol'},
		{ value: 'deer', name: 'Ciervo'},
		{ value: 'kangaroo2', name: 'Canguro'},
		{ value: 'alligator', name: 'Cocodrilo'}
	];


	$('#add-day').click(function(){
		addDay();
		$('#itinerary-container').mCustomScrollbar('scrollTo', '#add-day');
	});

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

	$('#toggle-points-of-reference-button').click(function(){
		$(this).toggleClass('disabled');
		togglePointsOfReference(!$(this).hasClass('disabled'));
	});

	$('#add-point-of-reference-button').magnificPopup({
		items: {
			src: '#popup',
			type: 'inline'
		},
		type:'inline',
		removalDelay: 300,
		mainClass: 'mfp-fade',
		midClick: true,
		callbacks: {
			open: function() {
				// Points of reference are only places
				$('#popup-activity-icon-one-container, #popup-accept, #activity-map-mode-selector, .colour-picker, .receipt-picker, #popup-activity-length, #popup-activity-start').hide();
				$('#popup-header').text('Nuevo punto de referencia');
				$('#popup-point-of-reference-group, #popup-accept-point-of-reference').show();
				$('#popup-point-of-reference-group-container, #popup-point-of-reference-icon-container').show();
				initPopupMapAndUI();
				togglePopupMode(MODE_PLACES);
			},
			close: function() {
				$('#popup-point-of-reference-group-container, #popup-point-of-reference-icon-container').hide();
				$('#popup-point-of-reference-group, #popup-accept-point-of-reference').hide();
				$('#popup-activity-icon-one-container, #popup-accept, #activity-map-mode-selector, .colour-picker, .receipt-picker, #popup-activity-length, #popup-activity-start').show();
				$('#popup-header').text('Nueva actividad');
				resetPopup();
			}
		}
	});

	$('#points-of-reference-dropdown-list').on('change', '.por-li-check', function(){
		var shouldShow = $(this).is(':checked');
		var group = $($(this).closest('li')).attr('data-group');

		togglePointsOfReferenceByGroup(group, shouldShow);
	});

	$('#points-of-reference-dropdown-button').click(function(){
		if (pointsOfReferenceGroupCount < 1) {
			return;
		}

		if ($("#points-of-reference-dropdown-menu").is(':hidden')) {
			$('#points-of-reference-dropdown-menu').show();
			$('#points-of-reference-dropdown-button b').html('&#9652;');
		} else {
			$('#points-of-reference-dropdown-button b').html('&#9662;');
			$('#points-of-reference-dropdown-menu').hide();
		}
	});

	$('#popup-accept-point-of-reference').click(function(){
		addPointOfReference();
		$.magnificPopup.close();
		resetPopup();
	});

	$('.colour-opt').click(function(){
		$('.colour-opt').removeClass('selected');
		$(this).addClass('selected');
	});

	$('#activity-map-mode-selector').click(function(){
		togglePopupMode();
		resetMap(popupMap, popupMapMarkers)
		$('.popup-map-input-text').val('');
		resetMapInformationBox();
	});

	$('#popup-cancel').click(function(){
		$.magnificPopup.close();
		resetPopup();
	});

	$('#days-container').on('click', '.edit-activity', function(){
		var activityId = $(this).closest('.activity')[0].id;
		var activity = findActivityById(activityId);
		var popupMode = activity.isRoute ? MODE_ROUTE : MODE_PLACES;
		editingActivityId = activityId;

		$.magnificPopup.open({
			items: {
				src: '#popup',
				type: 'inline'
			},
			type:'inline',
			removalDelay: 300,
			mainClass: 'mfp-fade',
			midClick: true,
			callbacks: {
				beforeOpen: function() {
					fillPopupWithActivity(activity);
					currentDay = activity.day;
				},
				open: function() {
					$('#popup-accept-edit-activity').show();
					$('#activity-map-mode-selector, #popup-accept').hide();
					initPopupMapAndUI();
					togglePopupMode(popupMode);
				},
				close: function() {
					$('#popup-accept-edit-activity').hide();
					$('#activity-map-mode-selector, #popup-accept').show();
					editingActivityId = null;
					resetPopup();
				}
			}
		});

	});

	// Edition of an activity consists in removing the old activity and creating a new one
	$('#popup-accept-edit-activity').click(function() {
		// Remove previous routes and markers
		$.each(popupMapMarkers, function(index, element){
			element.setMap(null);
		})

		$()

		// Remove activity from time grid
		$('#' + editingActivityId).remove();

		addActivity();
		$.magnificPopup.close();
	});

	// Update currentDay. This lets us know where will the new activity be added.
	$('#day-controls-container').on('click', '.open-popup-link', function(){
		currentDay = $(this).attr('data-day-index');
	});

	// Highlight only the activities related to the selected day
	$('#day-controls-container').on('click', '.day-name', function(){
		// If days are hidden, do nothing
		if ($('#toggle-days-button').hasClass('disabled')) {
			return;
		}

		var dayIndex = $(this).attr('data-day-index');
		var containerId = 'd' + dayIndex + '-activities-container';
		var containerIdHashtag = '#' + containerId;

		if ($(containerIdHashtag).hasClass('selected')) {
			$(containerIdHashtag).removeClass('selected');
			$('.activities-container').removeClass('unselected');
		} else {
			$(containerIdHashtag).removeClass('unselected').addClass('selected');
			$('.activities-container[id!='+ containerId +']').removeClass('selected').addClass('unselected');
		}

		// Hide or show activities on the map
		if ($('.activities-container.selected').length > 0) {
			$.each(days, function(index, day){
				if (index != dayIndex) {
					// Hide activities for unselected days
					$.each(day.activities, function(j, activity){
						toggleActivity(activity, false);
					});
				} else {
					// Display activities for the selected day
					$.each(day.activities, function(j, activity){
						toggleActivity(activity, true);
					});
				}
			});
		} else {
			// If there is no specific day selected, display every activity
			$.each(days, function(index, day){
				$.each(day.activities, function(j, activity){
					toggleActivity(activity, true);
				});
			});
		}

	});

	$('#toggle-days-button').click(function(){
		$(this).toggleClass('disabled');
		toggleDays(!$(this).hasClass('disabled'));
	})

	$('#popup-accept').click(function(){
		addActivity();
		map.fitBounds(mainMapBounds);
		$.magnificPopup.close();
		resetPopup();
	});

	function fillPopupWithActivity(activity) {
		$('#popup-activity-name').val(activity.name);
		$('.colour-opt').removeClass('selected');
		if (activity.isRoute) {
			$('#popup-activity-to').val(activity.toSearchTerm);
			$('#popup-activity-from').val(activity.fromSearchTerm);

			// Delete old directions, a new search will be made
			activity.routeDisplay.setMap(null);
			activity.routeMarkers.start.setMap(null);
			activity.routeMarkers.end.setMap(null);

			$('#popup-activity-icon-two').val(activity.markerIconTwoName).trigger('change');

			// Perform a new search for directions
			google.maps.event.trigger(origin_autocomplete, 'place_changed');
			google.maps.event.trigger(destination_autocomplete, 'place_changed');
		} else {
			$('#popup-activity-place').val(activity.searchTerm);
			activity.marker.setMap(popupMap);
			popupMap.setCenter(activity.marker.getPosition());
			popupMap.setZoom(17);
			popupMapMarkers.push(activity.marker);
		}

		$('.' + activity.colourClass).addClass('selected');

		$('#popup-activity-start').timepicker('setTime', activity.startTime);
		$('#popup-activity-length').timepicker('setTime', activity.endTime);

		$('#popup-activity-icon-one').val(activity.markerIconOneName).trigger('change')

		$('.travel-mode[data-travel-mode="'+ activity.travelMode +'"]').prop('checked', 'checked');
	}

	function findActivityById(id) {
		var activity;
		$.each(days, function(index, day) {

			for (var i = day.activities.length - 1; i >= 0; i--) {

				if (day.activities[i].htmlId == id) {
					activity = day.activities[i];
					break;
				}

			}

		});

		return activity;
	}

	// Check if there is at lest one point of reference that belongs to a group in order to enable the dropdown button
	function togglePointsOfReferenceDropdownButton() {
		if (pointsOfReferenceGroupCount > 0) {
			$('#points-of-reference-dropdown-button').removeClass('disabled');
		} else {
			$('#points-of-reference-dropdown-button').addClass('disabled');
		}
	}

	function toggleDays(show) {
		$.each(days, function(index, day){
			$.each(day.activities, function(j, activity){
				toggleActivity(activity, show);
			});
		});
	}

	function togglePopupMode(mode) {
		var newMode = placeModeEnabled ? MODE_ROUTE : MODE_PLACES;

		if (!isEmpty(mode)) {
			newMode = mode;
		}

		if (newMode == MODE_ROUTE) {
			$('#popup-activity-place').hide();
			$('#popup-activity-from, #popup-activity-to, #directions-mode-selector').show();
			$('#activity-map-mode-selector').text('Lugares');
			$('#popup-activity-icon-two + span').show();
			placeModeEnabled = false;
		} else if (newMode == MODE_PLACES) {
			placeModeEnabled = true;
			$('#popup-activity-icon-two + span').hide();
			$('#activity-map-mode-selector').text('Rutas');
			$('#popup-activity-place').show();
			$('#popup-activity-from, #popup-activity-to, #directions-mode-selector').hide();
		}

		google.maps.event.trigger(popupMap, 'resize'); // Trigger resize so that controls are updated
	}

	function togglePointsOfReference(show) {
		$.each(pointsOfReference, function(index, point){
			point.marker.setVisible(show);
		});
	}

	function togglePointsOfReferenceByGroup(group, show) {
		$.each(pointsOfReference, function(index, point){
			if (point.group == group) {
				point.marker.setVisible(show);
			}
		});
	}

	function toggleActivity(activity, shouldShow) {
		var activityMap = shouldShow ? map : null;
		if (activity.isRoute) {
			activity.routeDisplay.setMap(activityMap);
			activity.routeMarkers.start.setVisible(shouldShow);
			activity.routeMarkers.end.setVisible(shouldShow);
		} else {
			activity.marker.setVisible(shouldShow);
		}
	}

	function replaceMarkers(popupSelectedRoute, activity) {
		// If necessary, change route markers. Otherwise create a default one, and add it to the map
		var markerStart = $("#popup-activity-icon-one").val();
		var markerEnd = $("#popup-activity-icon-two").val();
		var markerStartImgUrl = "http://maps.google.com/mapfiles/markerA.png";
		var markerEndImgUrl = "http://maps.google.com/mapfiles/markerB.png";
		var markerPointX = 10; // Default x value to center default pins over the route

		if (placeModeEnabled) {
			if (!isEmpty(markerStart)) {
				var iconName = $("#popup-activity-icon-one").val();
				activity.marker.icon = placeRouteMarkerUrl + iconName + markerImgExtention;
				activity.markerIconOneName = iconName;
			}
		} else {
			var leg = popupSelectedRoute.routes[0].legs[0];
			var routeMarkers = {};

			if (!isEmpty(markerStart)) {
				markerStartImgUrl = placeRouteMarkerUrl + markerStart + markerImgExtention;
				markerPointX = 17;
			}
			var startMarkerImage = new google.maps.MarkerImage(markerStartImgUrl,
																new google.maps.Size(45, 45), new google.maps.Point(0, 0),
																new google.maps.Point(markerPointX, 32));
			routeMarkers.start = makeMarker(leg.start_location, startMarkerImage, '', map);

			if (!isEmpty(markerEnd)) {
				markerEndImgUrl = placeRouteMarkerUrl + markerEnd + markerImgExtention;
				markerPointX = 17;
			}
			var endMarkerImage = new google.maps.MarkerImage(markerEndImgUrl,
																new google.maps.Size(45, 45), new google.maps.Point(0, 0),
																new google.maps.Point(markerPointX, 32));
			routeMarkers.end = makeMarker(leg.end_location, endMarkerImage, '', map);

			activity.routeMarkers = routeMarkers;
			activity.markerIconOneName = markerStart;
			activity.markerIconTwoName = markerEnd;
		}
	}

	function addPointOfReference() {
		var pointsOfReferenceMarker = popupMapMarkers.pop();

		pointsOfReferenceMarker.setMap(map);
		mainMapMarkers.push(pointsOfReferenceMarker);
		mainMapBounds.extend(pointsOfReferenceMarker.position);

		var markerStart = $("#popup-point-of-reference-icon").val();
		if (!isEmpty(markerStart)) {
			pointsOfReferenceMarker.icon = pointOfReferenceMarkerUrl + markerStart + markerImgExtention;
		}


		var point = {
			group: $('#popup-point-of-reference-group').val(),
			marker: pointsOfReferenceMarker
		};


		if (!isEmpty(point.group)) {
			pointsOfReferenceGroupCount++;
			togglePointsOfReferenceDropdownButton();
			addPointOfReferenceToMenu(point);
		}

		// If points of reference are disable, hide marker
		point.marker.setVisible(!$('#toggle-points-of-reference-button').hasClass('disabled'));
		pointsOfReference.push(point);
	}

	// Add point of reference group to the dropdown menu
	function addPointOfReferenceToMenu(point) {
		for (var i = pointsOfReferenceGroups.length - 1; i >= 0; i--) {
			if (pointsOfReferenceGroups[i] == point.group) return;
		}

		pointsOfReferenceGroups.push(point.group);

		var liHTML = $('#points-of-reference-li-template').clone()[0];
		var liId = 'por-' + point.group.replace(' ', '-');
		$(liHTML).attr('id', liId);
		var spanHTML = $(liHTML).find('.por-text');
		$(spanHTML).text(point.group)[0];
		$(liHTML).attr('data-group', point.group);

		$('#points-of-reference-dropdown-list').append(liHTML);
		$(liHTML).show();
	}

	function buildActivityObject() {
		var startTime = $('#popup-activity-start').timepicker('getTime');
		var endTime = $('#popup-activity-length').timepicker('getTime');
		var length = endTime - startTime;
		var activityId = 'd'+ currentDay +'a' + days[currentDay].activities.length;

		var activity = {
			name: $('#popup-activity-name').val(),
			startHour: startTime.getHours(),
			startMinute: startTime.getMinutes(),
			startTime: startTime,
			endTime: endTime,
			length: length,
			isRoute: !placeModeEnabled,
			colour: $('.colour-opt.selected').css('background-color'),
			colourClass: getSelectedColourClass(),
			htmlId: activityId
		};

		var markerImgExtention = ".png";
		var markerStart = $("#popup-activity-icon-one").val();

		if (placeModeEnabled) {
			// Pop the first search result from the autocomplete
			var placeMarker = popupMapMarkers.pop();
			placeMarker.setMap(map);
			mainMapMarkers.push(placeMarker);
			mainMapBounds.extend(placeMarker.position);
			activity.marker = placeMarker;
			activity.searchTerm = $('#popup-activity-place').val();
		} else {
			mainMapRoutes.push(popupSelectedRoute);
			var routeDisplay = new google.maps.DirectionsRenderer();
			routeDisplay.setOptions( { suppressMarkers: true } ); // Disable markers. Then, add custom ones, or create default markers
			routeDisplay.setDirections(popupSelectedRoute);
			routeDisplay.setMap(map);
			mainMapBounds.union(popupSelectedRoute.routes[0].bounds);
			mainMapDirectionDisplays.push(routeDisplay);
			activity.routeDisplay = routeDisplay;
			activity.fromSearchTerm = $('#popup-activity-from').val();
			activity.toSearchTerm = $('#popup-activity-to').val();
			activity.travelMode = $('.travel-mode:checked').attr('data-travel-mode');
		}

		replaceMarkers(popupSelectedRoute, activity);

		return activity;
	}

	function addActivity() {
		var activity = buildActivityObject();

		// If days are hidden on the map, hide the new activity
		toggleActivity(activity, !$('#toggle-days-button').hasClass('disabled'));

		addActivityToTimeGrid(activity);

		activity.day = currentDay;
	}

	function addActivityToTimeGrid(activity) {
		var dayIndex = isEmpty(activity.day) ? currentDay : activity.day;

		days[dayIndex].activities.push(activity);

		// Get the default template and adapt it for the new activity.
		var activityHTML = $('#activity-template').clone()[0];
		// var activityId = 'd'+ dayIndex +'a' + days[dayIndex].activities.length;
		$(activityHTML).attr('id', activity.htmlId);

		var activityNameHTML = $(activityHTML).find('.activity-name')[0];
		$(activityNameHTML).text(activity.name);

		// Calculate the activity height and top.
		$(activityHTML).css(getActivityCSS(activity));

		// Add the new activity to the proper day, at the proper time of day and with the proper length in the grid (height);
		var containerId = '#d'+ dayIndex +'-activities-container';

		$(containerId).append(activityHTML);
		$(activityHTML).fadeIn();

		scrollToElementId('#' + activity.htmlId);
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
		$(dayNameHTML).attr('data-day-index', dayIndex);
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
		$(dayActivitiesContainerHTML).attr('class', 'activities-container');
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
		// Try to guess activity information and autocomplete the second step
		autoCompleteActivityInfo();
		goToPopupStep();
	});

	function autoCompleteActivityInfo() {
		var activityName = '';
		if (placeModeEnabled) {
			var place = $('#popup-activity-place').val();
			if (place != '') {
				activityName = place.split(',')[0];
			}
		} else {
			var from = $('#popup-activity-from').val();
			var to = $('#popup-activity-to').val();
			if ((to != '') && (from != '')) {
				activityName = from.split(',')[0] + ' a ' + to.split(',')[0];
			}
		}
		$('#popup-activity-name').val(activityName);

	}

	function scrollToElementId(elementId) {
		$('#scrollable-itinerary-container').mCustomScrollbar('scrollTo', elementId);
	}

	function selectFormatterFunction(state) {
		if (!state.id) {
			return state.text;
		}

		var $state = $(
			'<span><img src="' + placeRouteMarkerUrl + state.element.value.toLowerCase() + markerImgExtention + '" class="img-marker" /> <span class="select2-option-text">' + state.text + '</span></span>'
		);
		return $state;
	}

	function porSelectFormatterFunction(state) {
		if (!state.id) {
			return state.text;
		}

		var $state = $(
			'<span><img src="' + pointOfReferenceMarkerUrl + state.element.value.toLowerCase() + markerImgExtention + '" class="img-marker" /> <span class="select2-option-text">' + state.text + '</span></span>'
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
		var length = (activity.length / 1000) / 3600; // Miliseconds to hours

		// Vertical Offset and height
		var hourOffset = getCSSPropertyValueAsInt('.time-hour', 'height');
		var timeHourBorderTop = getCSSPropertyValueAsInt('.time-hour', 'border-top');
		var timeHourBorderBottom = getCSSPropertyValueAsInt('.time-hour', 'border-bottom');
		var timeGridMargin = getCSSPropertyValueAsInt('#time-grid', 'margin-top');
		var hourTotalHeight = hourOffset + timeHourBorderTop + timeHourBorderBottom; // Total height of an hour is its height + its borders top and bottom
		var cssTop = (activity.startHour * hourTotalHeight) + timeGridMargin; // Top position only for the starting hour
		cssTop += (activity.startMinute / 60) * hourTotalHeight; // Add px corresponding to the time minutes
		var cssHeight = length * hourTotalHeight;
		cssHeight = cssHeight == 0 ? 1 : cssHeight;

		// Horizontal offset
		var dayOffset = getCSSPropertyValueAsInt('.day-control', 'width') + getCSSPropertyValueAsInt('.day-control', 'padding-right') + getCSSPropertyValueAsInt('.day-control', 'padding-left');
		var timeHourTextOffset = getCSSPropertyValueAsInt('.time-hour span', 'width') / 2;
		var cssLeft = (dayOffset * currentDay) + timeHourTextOffset;

		return {
			'top': cssTop + 'px',
			'left': cssLeft + 'px',
			'height': cssHeight + 'px',
			'background-color': activity.colour
		};
	}

	function calculateTotalTimeAndDistance(result) {
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

	function secondsToDayHourMinuteObj(secondsCount) {
		var remainingTime = secondsCount;
		var days = Math.floor((remainingTime / 3600) / 24);

		if (days > 0) {
			remainingTime = secondsCount - (days * 3600 * 24);
		}

		var hours = Math.floor(remainingTime / 3600);
		var minutes = Math.floor((remainingTime - (hours * 3600)) / 60);
		//var seconds = remainingTime - (hours * 3600) - (minutes * 60);

		return {
			days: days,
			hours: hours,
			minutes: minutes
		};
	}

	// Translate seconds to an easy to read representation
	function secondsToFriendlyTime(secondsCount) {
		var dayHourMinuteObj = secondsToDayHourMinuteObj(secondsCount);
		var friendlyTimeStr;
		var days = dayHourMinuteObj.days;
		var hours = dayHourMinuteObj.hours;
		var minutes = dayHourMinuteObj.minutes;

		if (days > 0) {
			friendlyTimeStr = days + ' dia';

			if (days > 1) friendlyTimeStr += 's';
		}

		if (hours > 0) {
			if (days > 0) {
				friendlyTimeStr += ' ' + hours + ' hora';
			} else {
				friendlyTimeStr = hours + ' hora';
			}

			if (hours > 1) friendlyTimeStr += 's';
		}

		if (minutes > 0) {
			if (hours > 0) {
				friendlyTimeStr += ' ' + minutes + ' minuto';
			} else {
				friendlyTimeStr = minutes + ' minuto';
			}

			if (minutes > 1) friendlyTimeStr += 's';
		}

		return friendlyTimeStr;
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
			$('#activity-next-button').animate({"left": '3%'}, effectDuration);
			$('#activity-next-button span').removeClass('step-0').addClass('step-1');
		} else {
			// Go to first step
			$('#activity-next-button span').removeClass('step-1').addClass('step-0');
			$('#popup-step-two').animate({"left": '800px'}, effectDuration);
			$('#popup-step-one').animate({"left": '0'}, effectDuration);
			$('#activity-next-button').animate({"left": '85%'}, effectDuration);
		}
	}

	function resetPopup() {
		resetMap(popupMap, popupMapMarkers, true);
		resetPopupMapControls();
		goToPopupStep(0);
		// Reset receipt component
		resetReceiptComponent();
	}

	function resetMap(map, mapMarkers, fullReset) {
		popupSelectedRoute = null;
		directionsDisplay.setMap(null);
		origin_place_id = null;
		destination_place_id = null;
		resetMarkers(mapMarkers);
		if (fullReset) {
			map.setCenter(defaultLocation);
			map.setZoom(8)
		}
		popupMapMarkers = [];
	}

	function resetPopupMapControls() {
		$('.popup-map-input-text').val('');
		$('.popup-select').select2('val','');
		resetMapInformationBox();
	}

	function resetMapInformationBox() {
		$('#directions-distance').text('');
		$('#directions-time').text('');
		$('#directions-information').animate({'top': '500px'});
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
		$('.activities-container').removeClass('unselected selected');

		if (popupMap != null) {
			if ((isEmpty($('#popup-activity-place').val())) && (isEmpty($('#popup-activity-from').val()))) {
				// If we are not editing, center the map as the main map
				popupMap.fitBounds(mainMapBounds);
				popupMap.setCenter(map.getCenter());
				popupMap.setZoom(8);
			}
			return;
		}

		initIconSelects();

		$('#popup-point-of-reference-group').easyAutocomplete({
			data: pointsOfReferenceGroups
		});

		var timepickerOptions = {
			'timeFormat': 'H:i',
			'step': 15
		}

		$('#popup-activity-length').timepicker(timepickerOptions);

		$('#popup-activity-start').timepicker(timepickerOptions)
		.on('change', function() {
			var startTime = $('#popup-activity-start').timepicker('getTime');
			var startTimeStr = $('#popup-activity-start').val();
			var endTime = $('#popup-activity-length').timepicker('getTime');
			var options = { minTime: startTime, maxTime: '11:59pm' };

			if (endTime != null) {
				if (endTime < startTime) {
					$('#popup-activity-length').timepicker('setTime', startTime);
				}
			}

/*			if ($('#popup-activity-start').timepicker('getTime').getHours() == 0) {
				options.maxTime = '11:59pm';
			}*/

			$('#popup-activity-length').timepicker('option', options);
		});

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
			calculateTotalTimeAndDistance(popupSelectedRoute);
		});

		initPlacesAutocomplete();
		initDirectionsAutocompletes();
	}

	function initIconSelects() {
		// Load custom map markers into select2
		$.each(predefinedMapMarkers, function(index, marker) {
			$('.popup-select').append('<option value="'+ marker.value +'">'+ marker.name +'</option>')
		});

		$('.popup-activity-icon-select').select2({
			templateResult: selectFormatterFunction,
			minimumResultsForSearch: Infinity,
			placeholder: 'Marcador por defecto'
		}).on('change', function(){
			// If 'default marker' option is selected, then delete any select2 previous value
			if ($(this).val() == 'default') {
				$(this).select2('val','');
			}
		});
		$('#popup-activity-icon-two + span').hide();

		$('#popup-point-of-reference-icon').select2({
			templateResult: porSelectFormatterFunction,
			minimumResultsForSearch: Infinity,
			placeholder: 'Marcador por defecto'
		}).on('change', function(){
			// If 'default marker' option is selected, then delete any select2 previous value
			if ($(this).val() == 'default') {
				$(this).select2('val','');
			}
		});
		$('#popup-activity-icon-two + span').hide();
		$($('.select2-selection__arrow')[2]).attr('style', 'height: 45px !important'); // Horrible CSS fix.
		$($('.select2-selection__arrow')[0]).attr('style', 'height: 45px !important'); // Horrible CSS fix.
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

		origin_autocomplete = new google.maps.places.Autocomplete(origin_input);
		origin_autocomplete.bindTo('bounds', popupMap);
		destination_autocomplete = new google.maps.places.Autocomplete(destination_input);
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
				calculateTotalTimeAndDistance(popupSelectedRoute);
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

	function isEmpty(str) {
		return (str == '') || (str == null);
	}

	function resetReceiptComponent() {
		$('#popup-input-file').val();
		$('#popup-input-file-label + .cancel').hide();
		$('#popup-input-file-label').text('Comprobante').css({'color': '#8D97AD'});
		$('#popup-input-file-label + .cancel').hide();
	}

	function makeMarker(position, icon, title, map) {
		return new google.maps.Marker({
			position: position,
			map: map,
			icon: icon,
			title: title
		});
	}

	function getSelectedColourClass() {
		var classes = $('.colour-opt.selected').attr('class').split(' ');
		colourIndex = classes.indexOf('colour-opt');
		classes.splice(colourIndex, 1);
		selectedIndex = classes.indexOf('selected');
		classes.splice(selectedIndex, 1);

		return classes.pop();
	}
});