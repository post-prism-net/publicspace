publicspace = ( function() {

  var socket;
  var win = jq( window );

  var init = function() {
    debuglog( 'publicspace.init();' );

    injectCSS( 'http://192.168.2.1/publicspace/client/publicspace.css' );

    bindEventhandlers();

    socket = io.connect( 'http://192.168.2.1:9999' );
    socket.on( 'click', function( data ) {
      debuglog( data );

      var node = buildNode( data['x'], data['y'], data['ip']['address'], data['hostname'] );
      node.appendTo( jq( 'body' ) );

      setTimeout( function() {
        node.remove();
      }, 300000 );

    } );

    buildIndicator();

  }

  var bindEventhandlers = function() {
    debuglog( 'pulbicspace.bindEventhandlers()' );

    jq( document ).off( 'click', 'body' );
    jq( document ).on( 'click', 'body', function( e ) {

      if( jq( e.target ).closest( '.publicspace-indicator' ).length < 1 ) {

        var mouseX = e.pageX;
        var mouseY = e.pageY;
        var winWidth = win.width();
        var winHeight = win.height();
        var scrollY = win.scrollTop();
        var scrollX = win.scrollLeft();
        var hostname = location.hostname;

        var percentageX = Math.floor( ( mouseX - scrollX ) / winWidth * 100 );
        var percentageY = Math.floor( ( mouseY - scrollY ) / winHeight * 100 );

        debuglog( 'body.click( ' + percentageX + ' / ' + percentageY + ' )' );

        socket.emit( 'click', { x: percentageX, y: percentageY, hostname: hostname } ); 

      }

    } );    

    jq( document ).on( 'click', '.publicspace-indicator', function( e ) {
      jq( this ).toggleClass( 'active' );
    } );

  }

  var injectCSS = function( url ) {
    debuglog( 'pulbicspace.injectCSS( ' + url + ' )');

      var time = Date.now();

      var head = document.getElementsByTagName( 'head' )[0];
      var link = document.createElement( 'link' );
      link.setAttribute( 'type', 'text/css' );
      link.setAttribute( 'rel', 'stylesheet' );
      link.setAttribute( 'href', url + '?' + time );

      head.appendChild( link );

  }

  var injectJS = function( url ) {
    debuglog( 'pulbicspace.injectJS( ' + url + ' )');

      var time = Date.now();

      var head = document.getElementsByTagName( 'body' )[0];
      var script = document.createElement( 'script' );
      script.setAttribute( 'type', 'text/javascript' );
      script.setAttribute( 'src', url + '?' + time );

      head.appendChild( script );
      
  }

  var buildIndicator = function() {
    debuglog( 'pulbicspace.buildIndicator()' );
    
    var html = jq( '<span class="publicspace publicspace-indicator"><span class="publicspace publicspace-h1">ps</span><span class="publicspace publicspace-h2">You are in <em>public space</em></span></span></span>');

    html.appendTo( jq( 'body' ) );
  }

  var buildNode = function( x, y, ip, hostname ) {
    debuglog( 'pulbicspace.buildNode( ' + x + ', ' + y + ', ' + ip + ', ' + hostname + ' )' );
    var node = jq( '<span class="publicspace publicspace-node"><span class="publicspace publicspace-flag"><span class="publicspace-ip">' + ip + '</span><span class="publicspace-hostname">' + hostname + '</span></span>' );

    node
      .css( {
        'left': x + '%',
        'top': y + '%'
      });

    return node;
  }

  var removeNode = function( el ) { 
    debuglog( 'publicspace.removeNode()' );
    el.remove();
  } 

  var debuglog = function( log ) {
      if( typeof console != 'undefined' ) console.log( log );
  }

  return {
    init: function() { init(); }
  }

} )();
// start app
publicspace.init();