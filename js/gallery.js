// gallery.js
// @author Ben Stevens / ben@supernova.me

var gallery = function () {

	var model;
	
	var container;

	var camera, scene, renderer, projector;
	var texture_placeholder;

	var targetRotation = 0;
	var targetFOV = 45;
	var targetRotationOnMouseDown = 0;
	var targetObject;
	var targetObjectOffsetY = 0;
			
	var entranceLight, courtyardLight;
	var spotlight1, spotlight2, spotlight3;
	
	var whiteWire = new THREE.MeshBasicMaterial( { color: 0xFFFFFF, wireframe: true } ) 

	var mouseX = 0;
	var mouseXOnMouseDown = 0;

	var windowHalfX;
	var windowHalfY;
			
	var preload;
	var sceneObjects = {};
	var artworkObjects = [];
	var textures = {};
	var artworkTextures = {};
	var wallHeight = 300;
			
	var increment = 0;
	var quality = "HI";

	/*
	PRIVATE FUNCTIONS
	*/
	
	function onDocumentMouseDown( event )
	{

		event.preventDefault();
				
		var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
		projector.unprojectVector( vector, camera );
		var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );
		var intersects = ray.intersectObjects( artworkObjects );

		if ( intersects.length > 0 )
		{
			targetObject = intersects[0].object;
		}

		document.addEventListener( 'mousemove', onDocumentMouseMove, false );
		document.addEventListener( 'mouseup', onDocumentMouseUp, false );
		document.addEventListener( 'mouseout', onDocumentMouseOut, false );

		mouseXOnMouseDown = event.clientX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;
	}
	
	function onDocumentMouseMove( event )
	{
		mouseX = event.clientX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.0025;
	}

	function onDocumentMouseUp( event )
	{
		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function onDocumentMouseOut( event )
	{
		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function onDocumentTouchStart( event )
	{
		if ( event.touches.length == 1 )
		{
			event.preventDefault();

			mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
			targetRotationOnMouseDown = targetRotation;

		}
	}

	function onDocumentTouchMove( event )
	{
		if ( event.touches.length == 1 )
		{
			event.preventDefault();
			mouseX = event.touches[ 0 ].pageX - windowHalfX;
			targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.001;
		}
	}
	
	function preRender()
	{
		var _rY;
				
		if(targetObject != undefined)
		{
			var _o = new THREE.Object3D();
			_o.position = targetObject.position.clone();
			_o.rotation = targetObject.rotation.clone();
			_o.updateMatrix();
			_o.translateY(150);
					
			var _xdist = _o.position.x - camera.position.x;
			var _ydist = _o.position.y - camera.position.y + targetObjectOffsetY;
			var _zdist = _o.position.z - camera.position.z;
					
					
			camera.position.x += ( _xdist ) * 0.1;
			camera.position.y += ( _ydist ) * 0.1;
			camera.position.z += ( _zdist ) * 0.1;
			//targetRotation = Math.atan(_xdist/_zdist );
			targetRotation = Math.atan2(camera.position.z - targetObject.position.z, targetObject.position.x - camera.position.x) - (Math.PI/2);
					
			_o = null;
			
			if(Math.abs(_zdist) < 1)
			{
				var _artworkID = targetObject.name.split("_")[1];
				//reached target
				targetObject = undefined;
				//show artwork info
				main.showArtworkInfo(_artworkID);
			}
					
		}
				
				
				/*
				DAY / NIGHT
				increment+=0.5;
				var _dn = (Math.sin(increment/180*Math.PI) + 1) * 0.5;
				textures["ENTRANCE"].opacity = _dn;
				entranceLight.intensity = _dn;
				*/
				
				
		var _iR = unwrap([camera.rotation.y, targetRotation], Math.PI*2);
		var _dR = _iR[1] - _iR[0];
				
		//$("#debug").text(quality + " * "+targetRotation);
				
		if(quality != "LO")
		{
			if(Math.abs(_dR) > 0.001)
			{
				//still moving camera
				_rY = camera.rotation.y + (_dR * 0.1);
				camera.rotation.y = _rY;
				render();
			}
			else if(_dR == 0)
			{
				//stopped moving
			}
			else
			{	
				//camera movement is minimal
				_rY = targetRotation;
				camera.rotation.y = _rY;
				render();
			}
		}
		else
		{
			if(camera.rotation.y != targetRotation)
			{
				camera.rotation.y = targetRotation;
				render();
			}
		}
	}
	
	function render( )
	{
		if(renderer != undefined )
		{	
			renderer.render( scene, camera );
		}
	}
	
	function addArtworktoScene( _ao )
	{
		if(sceneObjects[_ao.wall] != undefined)
		{
			
			var _mat = loadTexture( _ao.img, "ARTWORK"+_ao.id, true );
			var wall = sceneObjects[_ao.wall];
			artworkTextures["ARTWORK"+_ao.id] = { texture: _mat, ready:false };

			var canvas = new THREE.Mesh( new THREE.PlaneGeometry( _ao.w, _ao.h, 2, 2 ), _mat );
			canvas.name = "ARTWORK_" + _ao.id;
			canvas.rotation.set( wall.rotation.x, wall.rotation.y, wall.rotation.z );
			canvas.position.set( wall.position.x, wall.position.y + (wallHeight/2), wall.position.z );

			canvas.updateMatrix();

			//stand-out from wall
			canvas.translateY(5);

			//re-position on wall
			canvas.translateX( _ao.x );
			canvas.translateZ( _ao.y );
	
			scene.add( canvas );
								
			artworkObjects.push( canvas );
		}			
	}
	
	function onCanvasMouseDown( event )
	{
		event.preventDefault();
	}
			
	function loadTexture( path, name, isArt )
	{
		var material;
		var texture = new THREE.Texture( texture_placeholder );
		/*
		switch(quality)
		{
			case "LO":
				material = new THREE.MeshBasicMaterial( { 
					//color: Math.random() * 0xffffff,
					//wireframe: true,
					map: texture, 
					overdraw: true
	
				break;
				
			default:
				material = new THREE.MeshLambertMaterial( { 
					//color: Math.random() * 0xffffff,
					//wireframe: true,
					map: texture, 
					overdraw: true
				} );
				break;
		}
		*/
				material = new THREE.MeshLambertMaterial( { 
					//color: Math.random() * 0xffffff,
					//wireframe: true,
					map: texture, 
					overdraw: true
				} );
		
		

		var image = new Image();
		$(image).one('load', function() {
			console.log("Texture image " + name + " loaded");
			texture.image = this;
			texture.needsUpdate = true;
			//material.map.image = this;
			
			if(name!=null)
			{
				if(!isArt) {
					textures[name].ready = true;
				} else {
					artworkTextures[name].ready = true;
				}
			}
			
			//render();
		});
		image.src = path;

		return material;

	}
	
	function createTextures()
	{
	
		textures = {
					"FLOOR":	{texture: loadTexture("textures/FLOOR_X.jpg", "FLOOR"), ready:false},
					"CEILING":	{texture: loadTexture("textures/CEILING_X.jpg", "CEILING"), ready:false},
					"ENTRANCE":	{texture: loadTexture("textures/STREET_X.jpg", "ENTRANCE"), ready:false},
					"STREET":	{texture: loadTexture("textures/STREET_NIGHT_X.jpg", "STREET"), ready:false},
					"EAST1":	{texture: loadTexture("textures/EAST_X.jpg", "EAST1"), ready:false},
					"WEST1":	{texture: loadTexture("textures/WEST1_X.jpg", "WEST1"), ready:false},
					"WEST2":	{texture: loadTexture("textures/WEST2_X.jpg", "WEST2"), ready:false},
					"NORTH":	{texture: loadTexture("textures/NORTH_X.jpg", "NORTH"), ready:false},
					"SOUTH":	{texture: loadTexture("textures/SOUTH_X.jpg", "SOUTH"), ready:false}
				 };
				
		//textures["ENTRANCE"].transparent = true;
		if(quality=="HI")
		{
			textures["FLOOR"].texture.opacity = .9;
			textures["FLOOR"].texture.transparent = true;
			textures["ENTRANCE"].texture.transparent = true;
		}
		
		preload = setInterval(checkTexturesLoaded,500);
		
	}
	
	function getTexture( _name )
	{
		if(textures[_name]!=null)
		{
			return textures[_name].texture;
		}
		else
		{
			return whiteWire;
		}
	}
	
	function checkTexturesLoaded()
	{
		for(var _t in textures)
		{
			if(!textures[_t].ready) return false;
		}
		
		//TODO: artwork textures check as separate routine when no exhibition is selected
		for(var _a in artworkTextures)
		{
			if(!artworkTextures[_a].ready) return false;
		}
		
		console.log("all textures loaded");
		clearInterval(preload);

		requestAnimationFrame(render);
		//render(true);
		
	}
			
	/*  degrees to radians: 
	*  simple conversion from degrees (0-360) to radians (-Math.PI - Math.PI)
	*/
	
	function DegToRad(a)
	{
		return a/180 * Math.PI;	
	}
	
	/*  symmetric modulo: 
	*  y = smod(x,m) = x+k*m where k is an integer,
	*  and y is always in the range [-0.5,0.5)*m
	*/
	
	function smod(x, m)
	{
		return x-((Math.floor(x/m + 0.5))*m);
	}
			
	/*  unwrap:
	*  for all i, y[i] = x[i] + k*m where k is an integer,
	*  and for i > 0, the increment y[i]-y[i-1] is in the
	*  range [-0.5,0.5)*m as in smod().
	*
	*  the "init" parameter is optional (default to 0)
	*  and specifies the starting value for the unwrap state.
	*/ 
			
	function unwrap(x, m, init)
	{
		var yi = init || 0;
		var y = [];
		for (var i = 0; i < x.length; ++i)
		{
			yi += smod(x[i]-yi, m);
			y[i] = yi;
		}    
		return y;
	}
	
	
	/*
	PUBLIC FUNCTIONS
	*/
			
	function initialize( _c, _q )
	{
		model = DataModel.getInstance();
		
		//do a WebGL check first
		if( !Detector.webgl ) return false;

		
		//quality = _q;
		container = _c;
		
		windowHalfX = container.width() / 2;
		windowHalfY = container.height() / 2;

		scene = new THREE.Scene();
		projector = new THREE.Projector();

		camera = new THREE.PerspectiveCamera( targetFOV, container.width() / container.height(), .1, 10000 );
		camera.position.y = 150;
		camera.position.z = -150;
		scene.add( camera );
		
		if( Detector.webgl )
		{
			renderer = new THREE.WebGLRenderer();
			quality = "HI";
		}
		else
		{
			renderer = new THREE.CanvasRenderer();
			quality = "LO";
		}
	
		renderer.setSize( container.width(), container.height() );

		container.append( renderer.domElement );
				
				
		texture_placeholder = document.createElement( 'canvas' );
		texture_placeholder.width = 128;
		texture_placeholder.height = 128;

		var context = texture_placeholder.getContext( '2d' );
		context.fillStyle = 'rgb( 200, 200, 200 )';
		context.fillRect( 0, 0, texture_placeholder.width, texture_placeholder.height );
				
				
		//Scene textures
		createTextures();
		
		
		//Geometry
		
		/*
		var F1 = new THREE.PlaneGeometry( 860, 325, 1, 1 );
		var F2 = new THREE.PlaneGeometry( 350, 510, 1, 1 );
		for(var i = 0 ; i < F2.vertices.length; i++)
		{
			F2.vertices[i].x -= (860+350) / 2;
			F2.vertices[i].z += 92.5;
		}
		THREE.GeometryUtils.merge(F1,F2);
		
		var FLOOR = new THREE.Mesh( F1, getTexture("FLOOR") );
		FLOOR.position.set( 0, 0, -860/2 );
		FLOOR.rotation.set( 0, DegToRad(-90), 0);
		scene.add( FLOOR );
				
				
		var C1 = new THREE.PlaneGeometry( 860, 325, 1, 1 );
		var C2 = new THREE.PlaneGeometry( 350, 510, 1, 1 );
		for(var i = 0 ; i < C2.vertices.length; i++)
		{
			C2.vertices[i].x -= (860+350) / 2;
			C2.vertices[i].z -= 92.5;
		}
		THREE.GeometryUtils.merge(C1,C2);
		
		var CEILING = new THREE.Mesh( C1, getTexture("CEILING") );
		CEILING.position.set( 0, wallHeight, -860/2 );
		CEILING.rotation.set( 0, DegToRad(90), DegToRad(180) );
		scene.add( CEILING );
		*/
		var FLOOR = new THREE.Mesh( new THREE.PlaneGeometry( 1210, 510, 4, 4 ), getTexture("FLOOR") );
		FLOOR.position.set( -92.5, 0, -1210/2 );
		FLOOR.rotation.set( 0, DegToRad(-90), 0);
		scene.add( FLOOR );
				
		var CEILING = new THREE.Mesh( new THREE.PlaneGeometry( 1210, 510, 4, 4 ), getTexture("CEILING") );
		CEILING.position.set( -92.5, wallHeight, -1210/2 );
		CEILING.rotation.set( DegToRad(180), DegToRad(-90), 0 );
		scene.add( CEILING );

		var ENTRANCE = new THREE.Mesh( new THREE.PlaneGeometry( 325, wallHeight*2, 4, 4 ), getTexture("ENTRANCE") );
		ENTRANCE.position.set( 0, 0, 0 );
		ENTRANCE.rotation.set( DegToRad(-90), DegToRad(180), 0 );
		scene.add( ENTRANCE );
				
		var STREET = new THREE.Mesh( new THREE.PlaneGeometry( 325, wallHeight*2, 4, 4 ), getTexture("STREET") );
		STREET.position.set( 0, 0 , 1 );
		STREET.rotation.set( DegToRad(-90), DegToRad(180), 0 );
		scene.add( STREET );

		var EAST1_WALL = new THREE.Mesh( new THREE.PlaneGeometry( 1210, wallHeight*2, 8, 4 ), getTexture("EAST1") );
		EAST1_WALL.position.set( 325/2, 0, -1210/2); 
		EAST1_WALL.rotation.set( DegToRad(90), 0, DegToRad(90) );
		scene.add( EAST1_WALL );								

		var WEST1_WALL = new THREE.Mesh( new THREE.PlaneGeometry( 860, wallHeight*2, 4, 4 ), getTexture("WEST1") );
		WEST1_WALL.position.set( 325/-2, 0, -860/2 );
		WEST1_WALL.rotation.set( DegToRad(90), 0, DegToRad(-90) );
		scene.add( WEST1_WALL );
								
		var WEST2_WALL = new THREE.Mesh( new THREE.PlaneGeometry( 350, wallHeight*2, 4, 4 ), getTexture("WEST2") );
		WEST2_WALL.position.set( (325/-2) - (510-325), 0, -1210+(350/2) );
		WEST2_WALL.rotation.set( DegToRad(90), 0, DegToRad(-90) );
		scene.add( WEST2_WALL );
				
		var NORTH_WALL = new THREE.Mesh( new THREE.PlaneGeometry( 510, wallHeight*2, 4, 4 ), getTexture("NORTH") );
		NORTH_WALL.position.set( -92.5, 0, -1210 );
		NORTH_WALL.rotation.set( DegToRad(90), 0, 0 );
		scene.add( NORTH_WALL );
				
		var SOUTH_WALL = new THREE.Mesh( new THREE.PlaneGeometry( 185, wallHeight*2, 4, 4 ), getTexture("SOUTH") );
		SOUTH_WALL.position.set( -255, 0, -860 );
		SOUTH_WALL.rotation.set( DegToRad(-90), DegToRad(180), 0 );
		scene.add( SOUTH_WALL );
				
		sceneObjects["EAST1"] = EAST1_WALL; 
		sceneObjects["WEST1"] = WEST1_WALL; 
		sceneObjects["WEST2"] = WEST2_WALL; 
		sceneObjects["NORTH"] = NORTH_WALL; 
		sceneObjects["SOUTH"] = SOUTH_WALL;
		
		
		switch( quality)
		{
			case "LO":
				//Low resolution
				
				break;
			
			default:
				//High resolution
				
				//Lights
					
				entranceLight = new THREE.PointLight( 0xFFFFFF, 1.0, 1500 );
				entranceLight.position.set( 0, 200, 0 );
						
				courtyardLight = new THREE.PointLight( 0xFFFFFF, 1.0, 1500 );
				courtyardLight.position.set( -92.5, 200, -1200 );
						
				spotlight1 = new THREE.SpotLight( 0xFFFFEE, 1.0, 3000, Math.PI/2, 1 );
				spotlight1.position.set( 0, wallHeight, -600 );
				spotlight1.target = WEST1_WALL;
				//spotlight1.castShadow = true;
				//spotlight1.shadowCameraVisible = true;
						
				spotlight2 = new THREE.SpotLight( 0xFFFFEE, 1.0, 3000, Math.PI/2, 1 );
				spotlight2.position.set( 0, wallHeight, -600 );
				spotlight2.target = EAST1_WALL;
						
				spotlight3 = new THREE.SpotLight( 0xFFFFEE, 1.0, 3000, Math.PI/2, 1 );
				spotlight3.position.set( 0, wallHeight, -1000 );
				spotlight3.target = NORTH_WALL;
						
				// add to the scene
				scene.add(entranceLight);
				scene.add(courtyardLight);
				scene.add(spotlight1);
				scene.add(spotlight2);
				scene.add(spotlight3);
				
				break;	
		}
				
		//render();
		enableInteraction();
		
		return true;
	}
	
	function updateExhibition( _id )
	{
		var _ex;
		
		if(_id == null)
		{
			_ex = model.getExhibitionByID( model.currentExhibitionID() );
		}
		else
		{
			_ex = model.getExhibitionByID( _id );
		}
		
		
		//TODO: remove anyexisting artwork especially textures
		artworkTextures = {};
			
		if(_ex != null)
		{
			for (var i in _ex.items)
			{
				var _a = _ex.items[i];
				var _ca = model.getArtworkByID( _a.id );
				
				if( _ca != null)
				{
					addArtworktoScene(
							{
								id: _ca.id,
								x: _a.x,
								y: _a.y,
								w: _ca.artwork_width,
								h: _ca.artwork_height,
								img: _ca.artwork_image,
								wall: _a.wall
							}
							);
				}
			}
		}
	}
	
	function animate()
	{
		requestAnimationFrame( animate );
		preRender();
	}
	
	function disableInteraction()
	{
		document.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		document.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		document.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		
		document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
		document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
	}

	function enableInteraction()
	{
		document.addEventListener( 'mousedown', onDocumentMouseDown, false );
		document.addEventListener( 'touchstart', onDocumentTouchStart, false );
		document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	}


	// Reveal public pointers to  
	// private functions and properties

	return {
		init: initialize,
		update: updateExhibition,
		animate: animate,
		enable: enableInteraction,
		disable: disableInteraction
	};

}();