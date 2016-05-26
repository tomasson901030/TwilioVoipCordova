var controllers = angular.module('controllers', []);

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

		if (user_id == undefined || user_id == "") {
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

		alert("a");

		if (!window.TwilioPlugin) {
			alert("window.TwilioPlugin not exist");
		};

		if (!window.Twilio) {
			alert("window.Twilio not exist");
		};

		if (!Twilio) {
  			alert("_Twilio not loaded.");
  		} else if (!Twilio.Device) {
  			alert("_Twilio Device not loaded.");
  		} else if (!Twilio.Connection) {
  			alert("_Twilio Connection not loaded.");
  		} else {
  			alert("_Twilio load succeed.");
  			// if (typeof window.Twilio.Device.setup == function) {
  			// 	alert("setup function exist.");
  			// } else {
  			// 	alert("setup function not exist.");
  			// }
  		}
		window.Twilio.Device.setup($scope.token);

		alert("b");
        Twilio.Device.ready(function (device) {
            alert("Ready");
        });

        alert("c");
        Twilio.Device.error(function (error) {
            alert("Error: " + error.message);
        });

        alert("d");
        Twilio.Device.connect(function (conn) {
            alert("Successfully established call");
            conn.accept(function (connection) {
            	alert("Connection accepted");
            	document.getElementById('call_modal_title').innerText = "Connected";
            });
            conn.disconnect(function (connection) {
            	alert("Connection disconnected");
            });
            conn.error(function(error) {
            	alert("Connection Error: " + error.message);
            });
        });

        alert("e");
        Twilio.Device.incoming(function (conn) {
            conn.accept();
        });

        alert("after_get_token end.");
	}

	$scope.call = function ($event) {
		if ($scope.token == undefined || $scope.token == "") {
			alert("Token is empty.");
		} else {
			alert("call started");
			Twilio.Device.connect({"To":"fler"});
			alert("call end");
			$scope.openModal();
		}
	};

	$scope.call_hangup = function() {
		if ($scope.modal.isShown()) {
			$scope.closeModal();
		}
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
    	$scope.modal.hide();
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