var controllers = angular.module('controllers', []);

controllers.controller('MainCtrl', function($scope, $state, UserService, $ionicLoading, $ionicModal, $http) {

	$scope.token = "";
	$scope.callers = [];
	$scope.incoming_connections = [];

	$scope.initialize = function() {
		$scope.get_token();
	};

	$scope.get_token = function() {
		var request = $http({
	        method: "GET",
	        url: serverContextPath + '/token?client=fler'
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

	$scope.call_accept = function (index) {
    alert("call_accept called.");
    alert(index);
		$scope.incoming_connections[index].accept();
	};

	$scope.after_get_token = function() {
		  window.Twilio.Device.setup($scope.token);

        window.Twilio.Device.ready(function (device) {
            alert("Ready");
        });

        window.Twilio.Device.error(function (error) {
            alert("Error: " + error.message);
        });

        window.Twilio.Device.connect(function (conn) {
            alert("Successfully established call");
        });

        window.Twilio.Device.incoming(function (conn) {
            alert("incoming connection: " + conn);

            conn.parameters(function (parameters) {
              
              alert("parameters From: " + parameters.From);

              $scope.callers.push(parameters.From);
              $scope.incoming_connections.push(conn);
              $scope.$applyAsync();
            });
            
            conn.showNotification("Notification Text", "../audio/creek.mp3");

            conn.accept(function (connection) {
            	alert("Connection Accepted");
              $scope.openModal();
            	// show dialog of receiving call
            	document.getElementById('call_modal_title').innerText = "Connected.";
            });

            // conn.disconnect(function (connection) {
            //   alert("disconnected.");
            // 	var from = find_connection(connection.parameters.From);
            // 	var res = $scope.find_connection(from);
            // 	if (res >= 0) {
            // 		$scope.callers.splice(res, 1);
            // 		$scope.incoming_connections.splice(res, 1);
            // 	};
            // 	connection.cancelNotification();
            // });

            conn.disconnect(function() {
              alert("disconnected.");
            });

            conn.cancel(function (connnection) {
              alert("cancelled.");
            });

            conn.offline(function (connnection) {
              alert("offline.");
            });

            conn.error(function (error) {
            	alert("Connection error: " + error.message + "From: " + error.connection.parameters.From);
            });
        });
	}

	$scope.find_connection = function(caller) {
		var res = -1;
		var i = 0;
		for (var icaller in $scope.callers) {
			if (caller == icaller) {
				res = i;
				break;
			};
			i ++;
		}
		return res;
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