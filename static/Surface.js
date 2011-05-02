/**
 * Copyright (C) 2011 by Paul Lewis
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
var cityHeight = {};
cityHeight['LAX'] = 0;
cityHeight['SEA'] = 0;
cityHeight['DFW'] = 0;
cityHeight['CHI'] = 0;
cityHeight['ATL'] = 0;
cityHeight['NYC'] = 0;
cityHeight['SAN'] = 0;
cityHeight['PDX'] = 0;
cityHeight['SFO'] = 0;
cityHeight['PHX'] = 0;

var AEROTWIST = AEROTWIST || {};
AEROTWIST.Surface = new function()
{
	// internal vars
	var camera,
		scene,
		renderer		= null,
		canvas			= null,
		context			= null,
		$container 		= $('#container'),
		width			= $container.width() - 15,
		height			= $container.height() - 15,
		$gui			= $('#gui'),
		vars			= [],
		projector		= new THREE.Projector(),
		center			= new THREE.Vector3(),
		orbitCamera		= true,
		orbitValue		= 0,
		lastRainDrop	= 0,
		image			= null,
		
	// core objects
		surface			= null,
		surfaceVerts	= [],
		raindrops		= [],
		
	// constants
		DAMPEN			= .9,
		AGGRESSION		= 400,
		DEPTH 			= 1500,
		NEAR 			= 1,
		FAR 			= 10000,
		X_RESOLUTION	= 100,
		Y_RESOLUTION	= 100,
		SURFACE_WIDTH	= 1408,
		SURFACE_HEIGHT	= 729,
		DROP_RATE		= 200,
		fin 			= true;
	
	/**
	 * Initializes the experiment and kicks
	 * everything off. Yay!
	 */
	this.init = function()
	{
		// stop the user clicking
		//document.onselectstart		= function(){ return false; };
		
		// set up our initial vars
		vars["magnitude"]			= 30;
		//vars["orbitSpeed"]			= 0.001;
		//vars["orbit"]				= false;
		vars["wireframeOpacity"]	= 1;
		vars["raindrops"]			= false;
		vars["elasticity"]			= 0.00005;
		
		// add listeners
		addEventListeners();
		
		// create our stuff
		if(createRenderer())
		{
			createObjects();
			addLights();
		
			// start rendering, which will
			// do nothing until the image is dropped
			update();
		
			$gui.addClass('live');
		}
		else
		{
			$('html').removeClass('webgl').addClass('no-webgl');
		}
	};
	
	function focus(event) {
	    //alert("HELLO!");
	    update();
	}
	
	/**
	 * Handles when a file is dropped by
	 * the user onto the container
	 */
	function dropFile(event)
	{
		// stop the browser doing
		// it's normal thing of going
		// to the item
		event.stopPropagation();
		event.preventDefault();
		
		// query what was dropped
		var files = event.dataTransfer.files;
		
		// if we have something
		if(files.length) {
			handleFile(files[0]);
		}
		
		return false;
	}
	
	/**
	 * Handles the uploaded file
	 */
	function handleFile(file)
	{
		var fileReader 			= new FileReader();
		fileReader.onloadend	= fileUploaded;
		fileReader.readAsDataURL(file);
	}
	
	/**
	 * File upload handled
	 */
	function fileUploaded(event)
	{		
		// check it's an image
		if(event.target.result.match(/^data:image/))
		{
		    // create a new image
			image 		= document.createElement('img');
			image.src 	= event.target.result;
			
			// give the browser chance to
			// create the image object
			setTimeout(function(){
				
				// split the image
				updatePlane();
				
			}, 100);
		}
		else
		{
			// time to whinge
			alert("Umm, images only? ... Yeah");
		}
	}
	
	/**
	 * Simple handler function for 
	 * the events we don't care about
	 */
	function cancel(event)
	{
		if(event.preventDefault)
			event.preventDefault();
		
		return false;
	}
	
	/**
	 * Adds some basic lighting to the
	 * scene. Only applies to the centres
	 */
	function addLights()
	{
		// point
		pointLight = new THREE.PointLight( 0xFFFFFF );
		pointLight.position.x = 10;
		pointLight.position.y = 1000;
		pointLight.position.z = 10;
		scene.addLight( pointLight );
		
		// point2
		pointLight2 = new THREE.PointLight( 0x888888 );
		pointLight2.position.x = 0;
		pointLight2.position.y = -1000;
		pointLight2.position.z = 5000;
		scene.addLight( pointLight2 );
	}
	
	/**
	 * Creates the objects we need
	 */
	function createObjects()
	{
		var planeMaterial 		= new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: ImageUtils.loadTexture("images/world.png"), shading: THREE.SmoothShading}),
			planeMaterialWire 	= new THREE.MeshLambertMaterial({color: 0xFFFFFF, wireframe:true});
		
		surface 				= new THREE.Mesh(new Plane(SURFACE_WIDTH, SURFACE_HEIGHT, X_RESOLUTION, Y_RESOLUTION), [planeMaterial, planeMaterialWire]);
		surface.rotation.x 		= -Math.PI * .15;
		surface.position.x 		= 100;
		surface.overdraw		= true;
		scene.addChild(surface);
		
		// go through each vertex
		surfaceVerts 	= surface.geometry.vertices;
		sCount			= surfaceVerts.length;
		
		// three.js creates the verts for the
		// mesh in x,y,z order I think
		while(sCount--)
		{
			var vertex 		= surfaceVerts[sCount];
			vertex.springs 	= [];
			vertex.velocity = new THREE.Vector3();
			
			// connect this vertex to the ones around it
			if(vertex.position.x > (-SURFACE_WIDTH * .5))
			{
				// connect to left
				vertex.springs.push({start:sCount, end:sCount-1});
			}
			
			if(vertex.position.x < (SURFACE_WIDTH * .5))
			{
				// connect to right
				vertex.springs.push({start:sCount, end:sCount+1});
			}
			
			if(vertex.position.y < (SURFACE_HEIGHT * .5))
			{
				// connect above
				vertex.springs.push({start:sCount, end:sCount-(X_RESOLUTION+1)});
			}

			if(vertex.position.y > (-SURFACE_HEIGHT * .5))
			{
				// connect below
				vertex.springs.push({start:sCount, end:sCount+(X_RESOLUTION+1)});
			}
		}
	}
	
	/**
	 * Creates the WebGL renderer
	 */
	function createRenderer()
	{
		var ok = false;
		
		try
		{
			renderer 					= new THREE.WebGLRenderer();
			camera 						= new THREE.Camera(35, width / height, NEAR, FAR);
			scene 						= new THREE.Scene();
			canvas						= document.createElement('canvas');
			canvas.width				= SURFACE_WIDTH;
			canvas.height				= SURFACE_HEIGHT;
			context						= canvas.getContext('2d');
			
			context.fillStyle = "#000000";
			context.beginPath();
			context.fillRect(0,0,SURFACE_WIDTH,SURFACE_HEIGHT);
			context.closePath();
			context.fill();
	
		
		    // position the camera
			camera.position.y 			= 100;
			camera.position.z			= DEPTH;
		    
		    // start the renderer
		    renderer.setSize(width, height);
		    $container.append(renderer.domElement);
		
		    ok = true;
		}
		catch(e)
		{
			ok = false;
		}
		
		return ok;
	}
	
	/**
	 * Sets up the event listeners for DnD, the GUI
	 * and window resize
	 */
	function addEventListeners()
	{
		// window event
		$(window).resize(callbacks.windowResize);
		$(window).keydown(callbacks.keyDown);
		
		// click handler
		$(document.body).mousedown(callbacks.mouseDown);
		$(document.body).mouseup(callbacks.mouseUp);
		$(document.body).click(callbacks.mouseClick);
        $(document.body).focus(callbacks.mouseUp);
		
		var container = $container[0];
		container.addEventListener('dragover', cancel, false);
		container.addEventListener('dragenter', cancel, false);
		container.addEventListener('dragexit', cancel, false);
		container.addEventListener('drop', dropFile, false);
		container.addEventListener('focus', focus, false);
		
		
		// GUI events
		$(".gui-set a").click(callbacks.guiClick);
		$(".gui-set a.default").trigger('click');
	}
	
	function updatePlane()
	{
		var ratio				= 1 / Math.max(image.width/SURFACE_WIDTH, image.height/SURFACE_HEIGHT);
		var scaledWidth			= image.width * ratio;
		var scaledHeight		= image.height * ratio;
		context.drawImage(image,
							0,0,image.width,image.height,
							(SURFACE_WIDTH - scaledWidth) * .5, (SURFACE_HEIGHT - scaledHeight) *.5, scaledWidth, scaledHeight);
	
		var newPlaneMaterial 	= new THREE.MeshLambertMaterial({color: 0xFFFFFF, map: ImageUtils.loadTexture(canvas.toDataURL("image/png")), shading: THREE.SmoothShading});
		surface.materials[0] 	= newPlaneMaterial;
	}
	
	/**
	 * Updates the velocity and position
	 * of the particles in the view
	 */
	function update(fromFocus)
	{
	    if (fromFocus) {
	        //alert("woo")
	    }
		//orbitValue 			+= vars["orbit"] ? vars["orbitSpeed"] : 0;
		camera.position.x 	= Math.sin(orbitValue) * DEPTH; // 
		camera.position.z 	= Math.cos(orbitValue) * DEPTH; 
		camera.update();
		
		
        //cityHeight = $('#result').data('totals');
        

		var cities = [
				["LAX","970","105","1"],
				["SEA","860","-300","0.5"],
		    ["DFW","-10","150","0.7"],
		    ["CHI","210","-100","1"],
		    ["ATL","-1170","135","1"],
		    ["NYC","-940","-60","1"],
		    ["SAN","1000","160","1"],
		    ["PDX","860","-230","0.5"],
		    ["SFO","860","0","1"],
		    ["PHX","1100","120","1"]];
		
		var c = cities.length
		
		while(c--) {	
			var city = cities[c][0];
			var city_x = cities[c][1];
			var city_y = cities[c][2];
			var city_z = cities[c][3];
			city_z = cityHeight[city];
				
			var xVal	= Math.floor((city_x / SURFACE_WIDTH) * X_RESOLUTION),
			yVal		= Math.floor((city_y / SURFACE_HEIGHT) * Y_RESOLUTION);
	
			xVal 		+= X_RESOLUTION * .5;
			yVal 		+= Y_RESOLUTION * .5;

			index		= (yVal * (X_RESOLUTION + 1)) + xVal;
		
			surfaceVerts[index].velocity.z += city_z * 5; // vars["magnitude"]
		
			surface.materials[1].opacity = vars["wireframeOpacity"];
		}
		
		var v = surfaceVerts.length;
		while(v--) {
			var vertex			= surfaceVerts[v],
				acceleration 	= new THREE.Vector3(0, 0, -vertex.position.z * vars["elasticity"]),
				springs			= vertex.springs,
				s				= springs.length;
			
			vertex.velocity.addSelf(acceleration);
			
			while(s--) {
				var spring 		= springs[s],
					extension	= surfaceVerts[spring.start].position.z - surfaceVerts[spring.end].position.z;
				
				acceleration 	= new THREE.Vector3(0, 0, extension * vars["elasticity"] * 50);
				surfaceVerts[spring.end].velocity.addSelf(acceleration);
				surfaceVerts[spring.start].velocity.subSelf(acceleration);
			}

			vertex.position.addSelf(vertex.velocity);
			
			vertex.velocity.multiplyScalar(DAMPEN);
		}
		
		surface.geometry.computeFaceNormals(true);
		surface.geometry.__dirtyVertices = true;
		surface.geometry.__dirtyNormals = true;
		
		// set up a request for a render
		requestAnimationFrame(render);
	}
	
	/**
	 * Renders the current state
	 */
	function render()
	{
		// only render
		if(renderer) {
			renderer.render(scene, camera);
		}
		
		// set up the next frame
		update();
	}
	
	/**
	 * Our internal callbacks object - a neat
	 * and tidy way to organise the various
	 * callbacks in operation.
	 */
	callbacks = {
	    mouseUp:function(){
	        update(1)
	        camera.update(1);
	        render(1);
	        scene.update(1);
	    },
	    
		guiClick:function() {
			var $this 	= $(this),
				varName	= $this.data("guivar"),
				varVal	= $this.data("guival");
			if(vars[varName] !== null) {
				vars[varName] = varVal;
			}
			
			$this.siblings().addClass('disabled');
			$this.removeClass('disabled');
			
			return false;
		},
		windowResize: function() {
			
			if(camera)
			{
				width			= $container.width() - 15,
				height			= $container.height() - 15,
				camera.aspect 	= width / height,
				renderer.setSize(width, height);
			
				camera.updateProjectionMatrix();
			}
		},
		keyDown: function(event) {
			
			if(camera)
			{
				switch(event.keyCode)
				{
				case 37: // Left
						orbitValue -= 0.1;
						break;
						
				case 39: // Right
						orbitValue += 0.1;
						break;
						
				}
				camera.update();
			}
		}
	};
};

// Surfaceize!
$(document).ready(function(){
	
	if(Modernizr.webgl) {
		// Go!
		AEROTWIST.Surface.init();
	}
});