// bgImg is the background image to be modified.
// fgImg is the foreground image.
// fgOpac is the opacity of the foreground image.
// fgPos is the position of the foreground image in pixels. It can be negative and (0,0) means the top-left pixels of the for    eground and background are aligned.
function composite( bgImg, fgImg, fgOpac, fgPos )
{
  const bgData = bgImg.data;
  const fgData = fgImg.data;

  // We go through the each pixel of the foreground image
  for (let y = 0; y < fgImg.height; y++) {
    for (let x = 0; x < fgImg.width; x++) {


      // Calculate the index for the foreground as if it was 1D array
      const fgIndex = (y * fgImg.width + x) * 4;

      // Get foreground's position on the background image
      const bgX = x + fgPos.x
      const bgY = y + fgPos.y

      // If the foreground image is within the bounds of the background image
      if (bgX >= 0 && bgX < bgImg.width && bgY >=0 && bgY < bgImg.height) {
	
	// Get index of background image as if it was 1D array
	const bgIndex = (bgY * bgImg.width + bgX) * 4;

	// Normalize the alpha to be between 0 and 1
	const alpha = fgOpac * fgData[fgIndex+3] / 255.0;

	// Alpha blending for RGB channels
	for (let i = 0; i < 3; i++) {
	  bgData[bgIndex+i] = Math.round(alpha * fgData[fgIndex+i] + (1 - alpha) * bgData[bgIndex+i]);
	}

	// Alpha blending for the fourth channel
	bgData[bgIndex+3] = Math.round(alpha * 255 + (1 - alpha) * bgData[bgIndex+3]);
      }
    }
  }
}

document.addEventListener("keydown", keyDownTextField, false);
function keyDownTextField(e) {
	var keyCode = e.keyCode;
	if(keyCode==115) {	// F4
		document.getElementById('includedscript').remove();
		var head = document.getElementsByTagName('head')[0];
		var script = document.createElement('script');
		script.src= 'project1.js';
		script.id = 'includedscript';
		head.appendChild(script);
		console.log('New script loaded.');
		recomputeImage();
	}
}

function recomputeImage()
{
	var layers = document.getElementById('layers');
	if ( layers.children.length == 0 ) return;
	if ( layers.lastChild.image ) {
		var canvas = document.getElementById('canvas');
		var context = canvas.getContext('2d');
		canvas.width  = layers.lastChild.image.width;
		canvas.height = layers.lastChild.image.height;
		var image = new ImageData( layers.lastChild.image.data.slice(), 
			                       layers.lastChild.image.width, 
			                       layers.lastChild.image.height );
		if ( layers.lastChild.imageOpac < 1 ) {
			for ( var i=3; i<image.data.length; i+=4 ) {
				image.data[i] *= layers.lastChild.imageOpac;
			}
		}
		for ( var i=layers.children.length-2; i>=0; --i ) {
			var c = layers.children[i];
			if ( c.image ) {
				composite( image, c.image, c.imageOpac, c.imagePos );
			}
		}
		context.putImageData( image, 0, 0 );
	}
}

function moveBegin(d)
{
	d.moving = true;
	d.moveX = event.clientX;
	d.moveY = event.clientY;
}
function moveEnd(d)
{
	d.moving = false;
}
function move(d)
{
	if ( d.moving ) {
		var layers = document.getElementById('layers');
		if ( d.target && d.target != layers.lastChild ) {
			var canvas = document.getElementById('canvas');
			var scale = canvas.width / canvas.clientWidth;
			d.target.imagePos.x += parseInt( ( event.clientX - d.moveX ) * scale );
			d.target.imagePos.y += parseInt( ( event.clientY - d.moveY ) * scale );
			d.moveX = event.clientX;
			d.moveY = event.clientY;
			recomputeImage();
		}
	}
}

function opacChange(r)
{
	if ( r.target ) {
		r.target.imageOpac = r.value / 100;
		recomputeImage();
	}
}

function selectLayer(layer)
{
	var layers = document.getElementById('layers');
	for ( var i=0; i<layers.children.length; ++i ) {
		layers.children[i].title = layers.children[i]==layer ? "selected" : "";
	}
	var r = document.getElementById('opac');
	var d = document.getElementById('canvasdiv');
	r.target = layer;
	d.target = null;
	d.className = "";
	if ( layer ) {
		r.value = layer.imageOpac * 100;
		r.disabled = false;
		if ( layer != layers.lastChild ) {
			d.target = layer;
			d.className = "canmove";
		}
	} else {
		r.disabled = true;
	}
}

function setSelection()
{
	var img = event.target || event.srcElement;
	selectLayer(img.parentElement);
}

function fileSelected()
{
	var f = event.target || event.srcElement;
	if (f.files && f.files[0]) {
		var reader = new FileReader();
		reader.onload = function(e) {
			f.preview.src = e.target.result;
			recomputeImage();
			var canvas = document.getElementById('canvas');
    		var context = canvas.getContext('2d');
    		var img = new Image;
    		img.src = e.target.result;
    		img.onload = function() {
				canvas.width = img.naturalWidth;
				canvas.height = img.naturalHeight;
    			context.drawImage(img, 0, 0);
				f.parentElement.image = context.getImageData(0, 0, canvas.width, canvas.height);
				recomputeImage();
    		}
		}
		reader.readAsDataURL(f.files[0]);
	}
}

function closeImage()
{
	var x = event.target || event.srcElement;
	x.div.remove();
	recomputeImage();
}

function layerDragStart()
{
	var d = event.target || event.srcElement;
	event.dataTransfer.setData("text", d.id);
	event.dataTransfer.effectAllowed = "move";
}

function layerDragOver()
{
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
}

function layerDrop()
{
	event.preventDefault();
	var data = event.dataTransfer.getData("text");
	var d = document.getElementById(data);
	var e = event.target || event.srcElement;
	while ( e.className != "layer" && e.id != "layers" && e.parentElement ) e = e.parentElement;
	if ( e.className == "layer" ) {
		if ( e == d ) return;
		var p = e.parentElement;
		var d_before_e = false;
		for ( var i=0; i<p.children.length; ++i ) {
			if ( p.children[i] == d ) d_before_e = true;
			if ( p.children[i] == e ) {
				if ( d_before_e ) {
					if ( i+1 < p.children.length ) {
						p.insertBefore( d, p.children[i+1] );
					} else {
						p.appendChild(d);
					}
				} else {
					p.insertBefore( d, e );
				}
				selectLayer(d);
				recomputeImage();
				return;
			}
		}
	} else if ( e.id == "layers" ) {
		for ( var i=0; i<e.children.length; ++i ) {
			if ( e.children[i].offsetTop > event.offsetY ) {
				e.insertBefore( d, e.children[i] );
				selectLayer(d);
				recomputeImage();
				return;
			}
		}
		e.appendChild(d);
		selectLayer(d);
		recomputeImage();
	}
}

var layerCount = 0;
function addImage()
{
	var d = document.createElement("div");
	d.id = "layer" + layerCount;
	d.className = "layer";
	d.selected = true;
	d.draggable = true;
	d.ondragstart = function(){ layerDragStart(); }
	d.imageOpac = 1;
	d.imagePos = { x:0, y:0 };
	var x = document.createElement("a");
	x.div = d;
	x.className = "closebtn";
	x.onclick = closeImage;
	x.innerHTML = "X";
	d.appendChild(x);
	var f = document.createElement("input");
	f.id = "file" + layerCount;
	f.type = "file";
	d.appendChild(f);
	var i = document.createElement("img");
	i.id = "img" + layerCount;
	i.draggable = false;
	i.onclick = function(){ setSelection(); }
	f.preview = i;
	d.appendChild(i);
	var layers = document.getElementById('layers');
	if ( layers.children.length == 0 ) {
		layers.appendChild(d);
	} else {
		layers.insertBefore( d, layers.children[0] );
	}
	f.onchange = fileSelected;
	f.click();
	selectLayer(d);
	layerCount++;
}

function init()
{
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
}

window.addEventListener('load',init);
