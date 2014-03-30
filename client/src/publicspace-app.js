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

    } );

    buildIndicator();

  }

  var bindEventhandlers = function() {
    debuglog( 'pulbicspace.bindEventhandlers()' );

    jq( 'body' ).unbind( 'click' );
    jq( 'body' ).bind( 'click', function( e ) {

      var mouseX = e.pageX;
      var mouseY = e.pageY;
      var winWidth = win.width();
      var winHeight = win.height();
      var scrollY = win.scrollTop();
      var scrollX = win.scrollLeft();
      var hostname = location.hostname();

      var percentageX = Math.floor( ( mouseX - scrollX ) / winWidth * 100 );
      var percentageY = Math.floor( ( mouseY - scrollY ) / winHeight * 100 );

      debuglog( 'body.click( ' + percentageX + ' / ' + percentageY + ' )' );

      socket.emit( 'click', { x: percentageX, y: percentageY, hostname: hostname } );

    } );    
  }

  var injectCSS = function( url ) {
    debuglog( 'pulbicspace.injectCSS( ' + url + ' )');

      var head = document.getElementsByTagName( 'head' )[0];
      var link = document.createElement( 'link' );
      link.setAttribute( 'type', 'text/css' );
      link.setAttribute( 'rel', 'stylesheet' );
      link.setAttribute( 'href', url );

      head.appendChild( link );

  }

  var injectJS = function( url ) {
    debuglog( 'pulbicspace.injectJS( ' + url + ' )');

      var head = document.getElementsByTagName( 'body' )[0];
      var script = document.createElement( 'script' );
      script.setAttribute( 'type', 'text/javascript' );
      script.setAttribute( 'src', url );

      head.appendChild( script );
      
  }

  var buildIndicator = function() {
    debuglog( 'pulbicspace.buildIndicator()' );
    
    var html = jq( '<a href="#" class="publicspace publicspace-indicator"><span data-text="p">p</span><span class="publicspace-reveal" data-text="ublic">ublic</span><span data-text="s">s</span><span class="publicspace-reveal" data-text="pace">pace</span></a>');

    html.appendTo( jq( 'body' ) );
  }

  var buildNode = function( x, y, ip, hostname ) {
    debuglog( 'pulbicspace.buildNode( ' + x + ', ' + y + ', ' + ip + ', ' + hostname + ' )' );
    var node = jq( '<span class="publicspace publicspace-node"><span class="ip">' + ip + '</span><span class="hostname">' + hostname + '</span>' );

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