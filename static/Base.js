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
var AEROTWIST = AEROTWIST || {};
AEROTWIST.Sparkles = new function()
{
	// internal vars
	var camera,
		scene,
		renderer,
		$container 		= $('#container'),
		width			= $container.width() - 15,
		height			= $container.height() - 15,
		$gui			= $('#gui'),
		vars			= [],
		
		
	// core objects
		
	// constants
		DEPTH 			= -1000,
		NEAR 			= 1,
		FAR 			= 10000,
		fin 			= true;
	
	/**
	 * Initializes the experiment and kicks
	 * everything off. Yay!
	 */
	this.init = function()
	{
		// stop the user clicking
		document.onselectstart		= function(){ return false; };
		
		// set up our initial vars
		vars["mappingMarker"]		= "y";
		
		// add listeners
		addEventListeners();
		
		// create our stuff
		createRenderer();
		createObjects();
		    
		// start rendering, which will
	    // do nothing until the image is dropped
		update();
	};
	
	
	
	/**
	 * Creates the objects we need
	 */
	function createObjects()
	{
		
	}
	
	/**
	 * Creates the WebGL renderer
	 */
	function createRenderer()
	{
		renderer 					= new THREE.WebGLRenderer();
		camera 						= new THREE.Camera(45, width / height, NEAR, FAR);
		scene 						= new THREE.Scene();
	
	    // position the camera
	    camera.position.z			= DEPTH;
	    
	    // start the renderer
	    renderer.setSize(width, height);
	    $container.append(renderer.domElement);
	}
	
	/**
	 * Sets up the event listeners for DnD, the GUI
	 * and window resize
	 */
	function addEventListeners()
	{
		// window event
		$(window).resize(callbacks.windowResize);
		
		// GUI events
		$(".gui-set a").click(callbacks.guiClick);
		$(".gui-set a.default").trigger('click');
	}
	
	/**
	 * Updates the velocity and position
	 * of the particles in the view
	 */
	function update()
	{
		
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
			
			if(mode == WEBGL_MODE && camera)
			{
				WIDTH			= $container.width() - 15,
				HEIGHT			= $container.height() - 15,
				camera.aspect 	= WIDTH / HEIGHT,
				renderer.setSize(WIDTH, HEIGHT);
			
				camera.updateProjectionMatrix();
			}
		}
	};
};

// Thparkle!
$(document).ready(function(){
	
	if(Modernizr.webgl) {
		// Go!
		AEROTWIST.Sparkles.init();
	}
});