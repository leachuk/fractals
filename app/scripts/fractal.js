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

var maxIt = 100; //iteration count
var x = 0.0; var y = 0.0;
var zx = 0.0; var zx0 = 0.0; var zy = 0.0;
var zx2 = 0.0; var zy2 = 0.0;

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

//test cartesian point of formula
var a = -1.5;
var b = 1;

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
	mr = mr0,mg = mg0,mb = mb0;
	for (i=0; i < itr; i++){	
		zx = (x*x) - (y*y);
		zy = 2*x*y;
		//console.log("zx:" + zx);
		//console.log("zy:" + zy);
		//add C
		var zxc = zx + cx;
		var zyc = zy + cy;
		var absZ = (zxc*zxc)+(zyc*zyc); // calculate complex to absolute
		x = zxc;
		y = zyc;
		//console.log("zxc["+i+"]: " + zxc);
		//console.log("zyc["+i+"]: " + zyc);
		//console.log("absZ["+i+"]: " + absZ);
		//testHighestIterations(i);
	
		//greater than 4 indicates escape to infinity. See the significance http://en.wikipedia.org/wiki/Cartesian_coordinate_system
		if (absZ >= 4){
			//console.log("To infinity, and beyond.");
			//mr = mr1,mg = mg1,mb = mb1;//colour white
			mr = mg = mb = calculateColourOfIteration(i);
			break;
		}
	}
}

function calculateColourOfIteration(itr){
	//using greyscale so r,g,b are all the same
	var rgbMax = 0;
	var rgbMin = 255;
	var rgbRange = rgbMax - rgbMin;
	
	var colour = (itr / maxIt) * rgbRange + rgbMin;
	return colour;
}

var iteration = 0;
var countItr = 0;
function testHighestIterations(itr){
	if (itr > iteration){
		//console.log("Iteration["+ countItr +"]:" + iteration);
		console.log("colour["+ i +"]:" + calculateColourOfIteration(i));
		iteration = itr;
	}
	
	countItr ++;
}

function testAbsoluteofComplex(a,b){
	var c = a*a + b*b;
	return c;
}
console.log("return testAbsoluteofComplex:" + testAbsoluteofComplex(a,b));

iteratePoint(a,b,3);

console.log("returnCartesianCoordXY:" + returnCartesianCoordXY(5,5));

//timestamp 
var then = new Date();
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
var now = new Date();
console.log("elapsed time(ms):" + (now-then));


context.putImageData(imgd, 0, 0);