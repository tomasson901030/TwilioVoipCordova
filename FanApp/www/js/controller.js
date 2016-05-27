var controllers = angular.module('controllers', []);


var stopConnecting = false;

controllers.controller('MainCtrl', function($scope, $state,$q, UserService, $ionicLoading, $ionicModal, $http) {

	$scope.token = "";

	$scope.initialize = function() {
		$scope.get_user_id();
		// document.getElementById('call_button').addEventListener('click', function() {
		// 	$scope.call();
		// });
	}

	$scope.get_user_id = function() {
		var user_id = UserService.getUserId();

		if (user_id === undefined || user_id === "") {
			var request = $http({
	        	method: "GET",
	        	url: serverContextPath + "/user_id"
	    	});

	    	request.success(function(data) {
	    		UserService.setUserId(data);
	    		$scope.get_token(data);
	    		alert("get user_id: " + data);
	    	});
	    	request.error(function(error) {
	    		alert("get user_id error: " + error);
	    	});
		} else {
			alert(user_id);
			$scope.get_token(user_id);
		}
	};

	$scope.get_token = function(user_id) {
		var request = $http({
	        method: "GET",
	        url: serverContextPath + '/token?client=' + user_id
	    });
	    request.success(function(data) {
	    	$scope.token = data;
	    	alert("token: " + data);
	    	$scope.after_get_token();
	    });
	    request.error(function(error) {
	    	alert(error);
	    });
	}

	
	$scope.after_get_token = function() {

		window.Twilio.Device.setup($scope.token);

		// Twilio device callback functions
        Twilio.Device.error(function (error) {
            alert("Device Error: " + error.message);
        });

		Twilio.Device.offline(function (error) {
            // alert("Device Offline");
        });

        Twilio.Device.ready(function (device) {
            alert("Device Ready");
        });

        Twilio.Device.presence(function (presence) {
        	if (presence.from != undefined) {
        		alert("presence updated from: " + presence.from + " available: " + presence.available);
        	};
        })

        Twilio.Device.connect(function (conn) {

        	// alert("Connection type: " + conn);
        	//stopConnecting = false;
            // conn.accept(function (connection) {
            // 	//stopConnecting = true;
            // 	alert("Connection accepted");
            // 	document.getElementById('call_modal_title').innerText = "Connected";
            // });

        	//alert(typeof(window.Twilio.Connection) + "," + typeof(conn));
	
        	if (typeof(conn) === typeof(window.Twilio.Connection)) {
        		// alert("conn object is type of TwilioPlugin.Connection. parameteres are ");
        		conn.accept(function (connection) {
	            	//stopConnecting = true;
	            	alert("Connection accepted");
	            	document.getElementById('call_modal_title').innerText = "Connected";
            	});

            	conn.disconnect(function (connection) {
            		//stopConnecting = true;
            		alert("Connection disconnected");
            		$scope.closeModal();
            	});

            	conn.error(function(error) {
	            	//stopConnecting = true;
	            	alert("Connection Error: " + error.message);
	            });
        	};

           	// alert("Still Connecting... This message is shown to stop current process.");
        });
	}

	$scope.call = function ($event) {
		if ($scope.token === undefined || $scope.token === "") {
			alert("Token is empty.");
		} else {
			Twilio.Device.connect({"ToClient":"fler"});
			$scope.openModal();
		}
	};

	$scope.call_hangup = function() {
		Twilio.Connection.disconnect("disconnect");
		$scope.closeModal();
	}

	$ionicModal.fromTemplateUrl('call-modal.html', {
    	scope: $scope,
    	animation: 'slide-in-up'
  	}).then(function(modal) {
    	$scope.modal = modal;
  	});
  	
  	$scope.openModal = function() {
    	$scope.modal.show();
    	document.getElementById('call_modal_title').innerText = "Connecting...";
  	};
  	$scope.closeModal = function() {
  		if ($scope.modal.isShown()) {
    		$scope.modal.hide();
    	}
  	};
  	// Cleanup the modal when we're done with it!
  	$scope.$on('$destroy', function() {
    	$scope.modal.remove();
  	});
  	// Execute action on hide modal
  	$scope.$on('modal.hidden', function() {
	    // Execute action
  	});
  	// Execute action on remove modal
  	$scope.$on('modal.removed', function() {
		// Execute action
  	});
});