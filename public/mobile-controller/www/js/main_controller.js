(function(){
  'use strict';
  angular.module('starter')
  .controller('MainCtrl', ['$scope', function($scope){
    $scope.title = 'wifwoig';
    var server;
    var clientID;
    var keyword = 'default_keyword';
    var cb = function() {
      //alert('cb')
      server = io.connect("http://172.31.252.246:4000");
      // When we connect to the server
      server.on('connect', function() {
        console.log('Connected to server.');
        server.emit('client_join', keyword, function(ID, color) {
          clientID = ID;
		  document.body.style.backgroundColor = "#" + color.toString(16);
        });
      });

    };
    if (navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/)) {
      document.addEventListener('deviceready', cb, false);
    } else {
      cb(); //this is the browser
    }

    window.addEventListener('deviceorientation', function(data){
      $scope.tiltX = data.gamma;
      $scope.tiltY = data.beta;
      $scope.$digest();
      var cursors = {type: "cursors", left: {isDown:false}, right: {isDown:false}, up: {isDown:false}, down: {isDown:false}};
      if (data.beta < -5)
        cursors.up.isDown = true;
      if (data.gamma < -5)
        cursors.left.isDown = true;
      if (data.beta > 5)
        cursors.down.isDown = true;
      if (data.gamma > 5)
        cursors.right.isDown = true;
      server.emit('input_event', clientID, keyword, cursors);
    });
  }]);
})();
