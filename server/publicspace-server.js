var http = require( 'http' );
var fs  = require( 'fs' )
var io = require( 'socket.io' );

var server = http.createServer( function( request, response ) {} );
server.listen( 9999 );

io = io.listen( server );
io.sockets.on( 'connection', function( socket ) {
  
  var client_ip = socket.handshake.address;

  socket.on( 'click', function( data ) {
    console.log( data );
    data.ip = client_ip;
    socket.broadcast.emit( 'click', data );
  } );
} );