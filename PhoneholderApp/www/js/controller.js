var controllers = angular.module('controllers', []);

controllers.controller('MainCtrl', function($scope, $state, UserService, $ionicLoading, $ionicModal, $http, $timeout) {

	$scope.token = "";
	$scope.callers = [];
	$scope.incoming_connections = [];
  $scope.current_connection = "";
  $scope.current_connected = false;

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
    // alert("call_accept called. for index: " + index);
    $scope.current_connection = $scope.incoming_connections[index];
		$scope.current_connection.accept();

    $scope.openModal();
    $scope.current_connected = true;

    $scope.trackConnection();
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

        window.Twilio.Device.disconnect(function (device) {
          alert("Device disconnect.");
        });

        window.Twilio.Device.incoming(function (conn) {
            // alert("incoming connection: " + conn);

            if (typeof(conn) === typeof(window.Twilio.Connection)) {
              
              // conn.showNotification("Notification Text", "../audio/creek.mp3");
              
              // conn.accept(function (connection) {
              // 	alert("Connection Accepted");
              	// show dialog of receiving call
                // $scope.openModal();
              // });


              conn.disconnect(function (connection) {
                alert("connection disconnected.");
                // if (typeof(connection) === typeof(window.Twilio.Connection)) {
                //   connection.parameters(function (parameters) {
                //     alert("disconnected connection parameters From: " + parameters.From);

                //     var from = find_connection(parameters.From);
                //     var res = $scope.find_connection(from);
                //     if (res >= 0) {
                //       $scope.callers.splice(res, 1);
                //       $scope.incoming_connections.splice(res, 1);
                //       $scope.$applyAsync();
                //     };
                //   });
                // }
              });

              conn.error(function (error) {
                alert("error: " + error.message);
              });

              conn.parameters(function (parameters) {
                
                // alert("parameters From: " + parameters.From);

                $scope.callers.push(parameters.From);
                $scope.incoming_connections.push(conn);

                if ($scope.incoming_connections.length === 2) {
                  alert("Current Connection Two, first: " + $scope.incoming_connections[0] + " second: " + $scope.incoming_connections[1]);
                  if ($scope.incoming_connections[0] === $scope.incoming_connections[1]) {
                    alert("Two Connection object same");
                  };
                };
                
                $timeout(function() {
                  if (!$scope.current_connected) {
                    
                  // $scope.$apply();
                    $scope.trackConnection();
                  }
                }, 1000);
              });
            };
        });
	}

  $scope.call_hangup = function() {
    // $scope.closeModal();
    Twilio.Connection.disconnect("disconnect");
  }

	$scope.find_connection = function(connection) {
		var res = -1;
		var i = 0;
		for (i = 0; i < $scope.incoming_connections.length; i ++) {
      var conn = $scope.incoming_connections[i];
			if (conn === connection) {
				res = i;
				break;
			};
		}
    // alert(res);
		return res;
	}
 
  $scope.trackConnection = function() {
    if ($scope.current_connected) {
      $scope.checkCurrentConnectionStatus();
    } else {
      if ($scope.incoming_connections.length === 1) {
        // alert("checkConnections calling");
        $scope.checkConnections();
      }
    }
  }

  $scope.checkConnections = function() {
    if (!$scope.current_connected) {
      // alert("on checkConnections funtion. current length: " + $scope.incoming_connections.length);

      var i = 0;
      for (i = 0; i < $scope.incoming_connections.length; i ++) {
        var conn = $scope.incoming_connections[i];
        conn.status(function(status_string) {
          // alert(status_string);
          if (status_string === "closed") {
            var index = $scope.find_connection(conn);
            if (index >= 0) {
              $scope.callers.splice(index, 1);
              $scope.incoming_connections.splice(index, 1);
            };
          };
        });
      }
      if ($scope.incoming_connections.length >= 1) {
        $timeout(function() {$scope.checkConnections();}, 1000);
      };
    }
  }

  $scope.checkCurrentConnectionStatus = function() {
    if($scope.current_connection) {
      $scope.current_connection.status(function(status_string) {
        // alert(status_string);
        if (status_string === "closed") {
          $scope.current_connected = false;
          $scope.closeModal();

          var index = $scope.find_connection($scope.current_connection);
          if (index >= 0) {
            $scope.callers.splice(index, 1);
            $scope.incoming_connections.splice(index, 1);
            $scope.$apply();
          };

          $scope.checkConnections();
        } else {
          $timeout(function() { $scope.checkCurrentConnectionStatus(); }, 1000);
        }
      });
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
      document.getElementById('call_modal_title').innerText = "Connected.";
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