publicspace = ( function() {

	var socket;

	var init = function() {
		debuglog( 'init();' );

		/*
		if( typeof jq == 'undefined' ) {
			injectJS( 'http://code.jq.com/jq-1.10.2.min.js' );
		}
		*/

		debuglog( jq );

		// injectJS( 'http://192.168.2.1/publicspace/client/socket.io/socket.io.min.js' );
		injectCSS( 'http://192.168.2.1/publicspace/client/publicspace.css' );

		bindEventhandlers();

		socket = io.connect( 'http://192.168.2.1:9999' );
		socket.on( 'click', function( data ) {
			debuglog( data );
		} );

		buildIndicator();

	}

	var bindEventhandlers = function() {
		debuglog( 'bindEventhandlers()' );

		jq( 'body' ).unbind( 'click' );
		jq( 'body' ).bind( 'click', function( e ) {

			var mouseX = e.pageX;
			var mouseY = e.pageY;

			debuglog( 'body.click( ' + mouseX + ' / ' + mouseY + ' )' );

			socket.emit( 'click', { x: mouseX, y: mouseY } );

		} );		
	}

	var injectCSS = function( url ) {
		debuglog( 'injectCSS( ' + url + ' )');

	    var head = document.getElementsByTagName( 'head' )[0];
	    var link = document.createElement( 'link' );
	    link.setAttribute( 'type', 'text/css' );
	    link.setAttribute( 'rel', 'stylesheet' );
	    link.setAttribute( 'href', url );

	    head.appendChild( link );

	}

	var injectJS = function( url ) {
		debuglog( 'injectJS( ' + url + ' )');

	    var head = document.getElementsByTagName( 'body' )[0];
	    var script = document.createElement( 'script' );
	    script.setAttribute( 'type', 'text/javascript' );
	    script.setAttribute( 'src', url );

	    head.appendChild( script );
	    
	}

	var buildIndicator = function() {
		debuglog( 'buildIndicator()' );
		
		var html = jq( '<span class="publicspace publicspace-indicator">ps</span>');

		html.appendTo( jq( 'body' ) );
	}

	var debuglog = function( log ) {
	    if( typeof console != 'undefined' ) console.log( log );
	}

	return {
		init: function() { init(); }
	}

} )();
publicspace.init();