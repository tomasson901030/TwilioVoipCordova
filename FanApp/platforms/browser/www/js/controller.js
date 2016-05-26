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
		TwilioPlugin.Device.setup($scope.token);

        TwilioPlugin.Device.ready(function (device) {
            alert("Ready");
        });

        TwilioPlugin.Device.error(function (error) {
            alert("Error: " + error.message);
        });

        TwilioPlugin.Device.connect(function (conn) {
            alert("Successfully established call");
            conn.accept(function (connection) {
            	alert("Connection accepted");
            	document.getElementById('call_modal_title').innerText = "Connected";
            })
            conn.disconnect(function (connection) {
            	alert("Connection disconnected");
            })
            conn.error(function(error) {
            	alert("Connection Error: " + error.message);
            })
        });

        TwilioPlugin.Device.incoming(function (conn) {
            conn.accept();
        });
	}

	$scope.call = function ($event) {
		if ($scope.token == undefined || $scope.token == "") {
			alert("Token is empty.");
		} else {
			//TwilioPlugin.Device.connect({"To":"fler"});
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
  		alert("modal destroyed");
    	$scope.modal.remove();
  	});
  	// Execute action on hide modal
  	$scope.$on('modal.hidden', function() {
alert("modal hided");
	    // Execute action
  	});
  	// Execute action on remove modal
  	$scope.$on('modal.removed', function() {
		// Execute action
		alert("modal removed");
  		document.getElementById('call_modal_title').innerText = "Connecting...";
  	});
});