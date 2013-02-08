////////////////////////////////////////////////////////////
// ============= micro HTML5 library =====================
// @author Gerard Ferrandez / http://www.dhteumeuleu.com/
// last update: December 23, 2012
// Released under the MIT license
// http://www.dhteumeuleu.com/LICENSE.html
////////////////////////////////////////////////////////////

// ===== ge1doot global =====

var ge1doot = ge1doot || {
	json: null,
	screen: null,
	pointer: null,
	camera: null,
	loadJS: function (url, callback, data) {
		if (typeof url == "string") url = [url];
		var load = function (src) {
			var script = document.createElement("script");
				if (callback) {
					if (script.readyState){
						script.onreadystatechange = function () {
							if (script.readyState == "loaded" || script.readyState == "complete"){
								script.onreadystatechange = null;
								if (--n === 0) callback(data || false);
							}
						}
					} else {
						script.onload = function() {
							if (--n === 0) callback(data || false);
						}
					}
				}
				script.src = src;
				document.getElementsByTagName("head")[0].appendChild(script);
		}
		for (var i = 0, n = url.length; i < n; i++) load(url[i]);
	}
}

// ===== html/canvas container =====

ge1doot.Screen = function (setup) {
	ge1doot.screen = this;
	this.elem = document.getElementById(setup.container) || setup.container;
	this.ctx = this.elem.tagName == "CANVAS" ? this.elem.getContext("2d") : false;
	this.style = this.elem.style;
	this.left = 0;
	this.top = 0;
	this.width = 0;
	this.height = 0;
	this.cursor = "default";
	this.setup = setup;
	this.resize = function () {
		var o = this.elem;
		this.width  = o.offsetWidth;
		this.height = o.offsetHeight;
		for (this.left = 0, this.top = 0; o != null; o = o.offsetParent) {
			this.left += o.offsetLeft;
			this.top  += o.offsetTop;
		}
		if (this.ctx) {
			this.elem.width  = this.width;
			this.elem.height = this.height;
		}
		this.setup.resize && this.setup.resize();
	}
	this.setCursor = function (type) {
		if (type !== this.cursor) {
			this.cursor = type;
			this.style.cursor = type;
		}
	}
	window.addEventListener('resize', function () {
		ge1doot.screen.resize();
	}, false);
	!this.setup.resize && this.resize();
}

// ==== unified touch events handler ====

ge1doot.Pointer = function (setup) {
	ge1doot.pointer = this;
	var self        = this;
	var body        = document.body;
	var html        = document.documentElement;
	this.setup      = setup;
	this.screen     = ge1doot.screen;
	this.elem       = this.screen.elem;
	this.X          = 0;
	this.Y          = 0;
	this.Xi         = 0;
	this.Yi         = 0;
	this.Xr         = 0;
	this.Yr         = 0;
	this.isDraging  = false;
	this.hasMoved   = false;
	this.isDown     = false;
	var bXi         = 0;
	var bYi         = 0;
	var sX          = 0;
	var sY          = 0;
	if (setup.tap) this.elem.onclick = function () { return false; }
	if (!setup.documentMove) {
		document.ontouchmove = function(e) { e.preventDefault(); }
	}
	this.pointerDown = function (e) {
		if (this.elem.setCapture) this.elem.setCapture();
		this.isDraging = false;
		this.hasMoved = false;
		this.isDown = true;
		this.Xr = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		this.Yr = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);
		this.X  = sX = this.Xr - this.screen.left;
		this.Y  = sY = this.Yr - this.screen.top + ((html && html.scrollTop) || body.scrollTop);
		this.setup.down && this.setup.down(e);
	}
	this.pointerMove = function(e) {
		//x=Math.random();
		//console.log(this);
		this.Xr = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		this.Yr = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);
		this.X  = this.Xr - this.screen.left;
		this.Y  = this.Yr - this.screen.top + ((html && html.scrollTop) || body.scrollTop);
		if (this.isDown) {
			this.Xi = bXi + (this.X - sX);
			this.Yi = bYi - (this.Y - sY);
		}
		if (Math.abs(this.X - sX) > 11 || Math.abs(this.Y - sY) > 11) {
			this.hasMoved = true;
			if (this.isDown) this.isDraging = true;
			else {
				sX = this.X;
				sY = this.Y;
			}
		}
		this.setup.move && this.setup.move(e);
	}
	this.pointerMoveRand = function(e) {
		this.Xr = Math.random()*500;
		this.Yr = Math.random()*500;
		this.X  = this.Xr;// - this.screen.left;
		this.Y  = this.Yr;// - this.screen.top + ((html && html.scrollTop) || body.scrollTop);
		if (this.isDown) {
			this.Xi = bXi + (this.X - sX);
			this.Yi = bYi - (this.Y - sY);
		}
		if (Math.abs(this.X - sX) > 11 || Math.abs(this.Y - sY) > 11) {
			this.hasMoved = true;
			if (this.isDown) this.isDraging = true;
			else {
				sX = this.X;
				sY = this.Y;
			}
		}
console.log(this.X);
console.log(this.Y);
		this.pointerMove;
		this.setup.move(this);
		//this.setup.move && this.setup.move(e);
	}
	this.pointerUp = function(e) {
		bXi = this.Xi;
		bYi = this.Yi;
		if (!this.hasMoved) {
			this.X = sX;
			this.Y = sY;
			this.setup.tap && this.setup.tap(e);
		} else {
			this.setup.up && this.setup.up(e);
		}
		this.isDraging = false;
		this.isDown = false;
		this.hasMoved = false;
		if (this.elem.releaseCapture) this.elem.releaseCapture();
	}
	this.pointerCancel = function(e) {
		if (this.elem.releaseCapture) this.elem.releaseCapture();
		this.isDraging = false;
		this.hasMoved = false;
		this.isDown = false;
		bXi = this.Xi;
		bYi = this.Yi;
		sX = 0;
		sY = 0;
	}
	if ('ontouchstart' in window) {
		this.elem.ontouchstart      = function (e) { self.pointerDown(e);   }
		this.elem.ontouchmove       = function (e) { self.pointerMove(e);   }
		this.elem.ontouchend        = function (e) { self.pointerUp(e);     }
		this.elem.ontouchcancel     = function (e) { self.pointerCancel(e); }
	} else {
		this.elem.onmousedown       = function (e) { self.pointerDown(e);   }
		this.elem.onmousemove       = function (e) { self.pointerMove(e);   }
		this.elem.onmouseup         = function (e) { self.pointerUp(e);     }
	}
//window.setInterval(this.pointerMoveRand,333);			
}

// ===== smooth animation =====

window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame || 
		window.webkitRequestAnimationFrame   || 
		window.mozRequestAnimationFrame      || 
		window.oRequestAnimationFrame        || 
		window.msRequestAnimationFrame       || 
		function( run ){
			window.setTimeout(run, 16);
		};

})();

