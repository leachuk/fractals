//setup the drawing environment
var canvas = document.getElementById('fractalcanvas');
var context = canvas.getContext('2d');
var xr = context.canvas.width;
var yr = context.canvas.height;
var imgd = context.createImageData(xr, yr);
var pix = imgd.data;
console.log("height yr:" + yr);
console.log("width yr:" + xr);

//need to map canvas x/y to cartesian plane
//we then calculate each x/y as an equivalent cartesian co-ord
var xmin = -2.0; var xmax = 1.0; 
var ymin = -1.5; var ymax = 1.5;

// these are for coloring the image
//black
var mr0 = 0; 
var mg0 = 0; 
var mb0 = 0;
//white
var mr1 = 255; 
var mg1 = 255;
var mb1 = 255;
//global placeholders to set colour;
var mr = mr0,mg = mg0,mb = mb0;
console.log("colour mr1:" + mr1);
console.log("colour mg1:" + mg1);
console.log("colour mb1:" + mb1);

var maxIt = 25; //iteration count

//Complex 
//Zn+1 = Zn^2 + C
//Z = x+xi
//C = a+bi

//Real
//Z^2 = (X^2 * Y^2, 2 * X * Y)
//(Xn+1,Yn+1) = (Xn * Xn - Yn * Yn + a, (2 * (Xn * Yn)) + b)
//Find absolute value of a complex number. This is used to detect if 
// a point (a,b) escapes to infinity (> 4). 
//Abs = a^2 + b^2

function returnCartesianCoordXY(x,y){
//map the pixel to the cartesian plane
	pixelX = x;
	pixelY = y;
	var cartesianRangeX = Math.abs(xmin) + Math.abs(xmax);
	var cartesianRangeY = Math.abs(ymin) + Math.abs(ymax);
	var normalisedX = x / xr;
	var normalisedY = y / yr;
	var result = [
		(cartesianRangeX * normalisedX) + xmin,
		(cartesianRangeY * normalisedY) + ymin
	]; 
	return result;	
}

function iteratePoint(a,b,itr){
	var x = a; var y = b;
	var zx=0; var yx=0;
	var cx=a; var cy=b; // Constant
	mr = mr0; mg = mg0; mb = mb0;
	for (i=0; i < itr; i++){	
		zx = (x*x) - (y*y);
		zy = 2*x*y;
		
		//add C
		var zxc = zx + cx;
		var zyc = zy + cy;
		var absZ = (zxc*zxc)+(zyc*zyc); // calculate complex to absolute
		x = zxc;
		y = zyc;
		//Do NOT enable this logging for anything but a v v small canvas!
		//console.log("zxc["+i+"]: " + zxc);
		//console.log("zyc["+i+"]: " + zyc);
		//console.log("absZ["+i+"]: " + absZ);
		//greater than 4 indicates escape to infinity. See the significance http://en.wikipedia.org/wiki/Cartesian_coordinate_system
		if (absZ >= 4){
			//console.log("To infinity, and beyond.");
			//mr = mr1,mg = mg1,mb = mb1;//colour white
			testHighestIterations(zx,zy,i);		
			mr = mg = mb = calculateColourOfIteration(absZ,i);
			break;
		}

	}
}
var logBase = 1.0 / Math.log(2.0);
var logHalfBase = Math.log(0.5)*logBase;
function calculateColourOfIteration(absZ,itr){
	//using greyscale so r,g,b are all the same
	var rgbMax = 0;
	var rgbMin = 255;
	var rgbRange = rgbMax - rgbMin;
	//smooth colouring algorithm which prevents the typical banding
	var v = itr - Math.log(Math.log(Math.sqrt(absZ)))/Math.log(2.0);
	//var colour = (itr / maxIt) * rgbRange + rgbMin;
	var colour = (v / maxIt) * rgbRange + rgbMin;
	colour = (colour > 0) ? colour : 0;
	return colour;
}

var iteration = 0;
var countItr = 0;

//Sandpit for testing values without giving the browser rectal failure.
//Ignore the contents.
function testHighestIterations(zr,zi,itr){
	if (itr > iteration){
		//console.log("Iteration["+ countItr +"]:" + iteration);
		//m = iter_count - log (log escape_radius) /log 2
		var absZ = Math.sqrt(zr*zr+zi*zi);
		var v = 1 + itr - Math.log(absZ)/Math.log(2.0);
		var z = 5 + itr - logHalfBase - Math.log(Math.log(zr+zi))*logBase;
		console.log("colour["+ itr +"]:" 
			+ calculateColourOfIteration(absZ,itr)
			+ "\t	smoothed:"
			+ v
			+ "\t	smoothed-short:"
			+ z
			+ "\t zr:"+zr+", zi:"+zi+""
		);
		iteration = itr;
	}
	
	countItr ++;
}

//conveniently test cartesian point of formula without need to alter canvas size
var a = -1.5;
var b = 1;
iteratePoint(a,b,3);

console.log("returnCartesianCoordXY:" + returnCartesianCoordXY(5,5));

//timestamp start
var then = new Date();
//loop over canvas
for (var ky = 0; ky < yr; ky++)	//iterate height Y 
{	
    for(var kx = 0; kx < xr; kx++)	//iterate width X
    {
	var ab = returnCartesianCoordXY(kx,ky);
	iteratePoint(ab[0],ab[1],maxIt)
	var p = (xr * ky + kx) * 4;
	pix[p + 0] = mr; //r
	pix[p + 1] = mg; //g
	pix[p + 2] = mb; //b
	pix[p + 3] = 255; //a
	//console.log(p);   
    }
}
//timestamp end
var now = new Date();
console.log("elapsed time(ms):" + (now-then));


context.putImageData(imgd, 0, 0);