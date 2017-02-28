
var app = angular.module('app',[]);

app.controller('chatCtrl',['$scope','socket',function($scope,socket){

  //messages from the database are loaded into this array
  $scope.messages = [];

  $scope.username = "";
  $scope.newMessage = "";

  $scope.sendMessage = function(){
    //emit the data to the receive-message channel so that the server can grab it
    socket.emit('send-message',{user:$scope.username,message:$scope.newMessage});
    console.log("Message sent");
    $scope.newMessage = "";
  };

  socket.on('receive-message',function(data){
    //when server sends something on this channel push it to the json $scope.messsages array
    $scope.messages.push(data);
  });
  
//assign username on connection i.e user1, user2 etc.
  socket.on('user-assign',(data)=>{
    $scope.username=data.userID;
  })

}
]);

//Factory causing reapplies on any on event and emit event firing
//wrap socket.io module into an injectable service
//creating the socket service
app.factory('socket', function ($rootScope) {
  //display an ip instead of localhost so that remote machines can access it
  var socket = io.connect('192.168.1.148:8090');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});
