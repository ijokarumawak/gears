class Point {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

function toRadian(degree) {
  return degree * (Math.PI / 180);
}

function toDegree(radian) {
  return radian * (180 / Math.PI);
}

// Calculate intersection of the Tangent line and circle of r.
// http://geom.web.fc2.com/geometry/circle-line-intersection.html
function cli(a,b,c,x1,y1,r){
	var l = a*a+b*b;
	var k = a*x1+b*y1+c;
	var d = l*r*r-k*k;
	if(d>0){
		var ds = Math.sqrt(d);
		var apl = a/l;
		var bpl = b/l;
		var xc = x1-apl*k;
		var yc = y1-bpl*k;
		var xd = bpl*ds;
		var yd = apl*ds;
		return [
			new Point(xc-xd, yc+yd),
			new Point(xc+xd, yc-yd)
		];
	}else if(d==0){
		return [new Point(x1-a*k/l, y1-b*k/l)];
	}else{
		return [];
	}
}

function tooth(theta, w, r) {
  var radT = toRadian(theta);

  var p1x = -r * Math.cos(radT);
  var p1y = r * Math.sin(radT);
  var p2x = r * Math.cos(radT);
  var p2y = -r * Math.sin(radT);

  var qx = Math.sin(toRadian(90 - theta)) * w;
  var qy = Math.cos(toRadian(90 - theta)) * w;

  var p1 = new Point(p1x, p1y);
  var p2 = new Point(p2x, p2y);
  var q = new Point(qx, qy);

  // Tangent line equation
  // qx * x + qy * y = square(w);
  // qy * y = square(w) - qx * x;
  // qx * x + qy * y - square(w) = 0;
  // ax + by + c = 0;
  // a = qx, b = qy, c = -square(w);
  var ca = cli(q.x, q.y, -square(w), 0, 0, r);
  var cb = cli(q.x * -1, q.y * -1, -square(w), 0, 0, r);

  return [ca[0], ca[1], cb[0], cb[1]];
}

// Utility function.
var square = (x) => Math.pow(x, 2);

var r = 30.0;
var s = 25.0;
var w = 4;

// Draw reference circle
d3.select('#rootGroup')
  .selectAll('.refCircle')
  .data([r, s, w])
  .enter()
  .append('circle')
  .attr('class', 'refCircle')
  .attr('cx', '0')
  .attr('cy', '0')
  .attr('r', (d) => {return d})
  .style('fill', 'none')
  .style('stroke', 'lightgray')
  .style('stroke-width', '1px')
  ;

var n = 5;
var d = 180 / n;
var tss = new Array(n);
var tsr = new Array(n);


for (var i = 0; i < n; i++) {
  var a = d * i;
  tss[i] = tooth(a, w, s);
  tsr[i] = tooth(a, w, r);
}

function toPoints(ts) {
  var points = new Array(ts.length * 4);
  ts.forEach((t, i) => {
    var offset = i * 4;
    points[0 + offset] = t[0];
    points[1 + offset] = t[1];
    points[2 + offset] = t[2];
    points[3 + offset] = t[3];
  });
  return points;
}

var points = toPoints(tss).concat(toPoints(tsr));

// Draw points
d3.select('#rootGroup')
  .selectAll('.point')
  .data(points)
  .enter()
  .append('circle')
  .attr('class', 'point')
  .attr('cx', (p) => p.x)
  .attr('cy', (p) => p.y)
  .attr('r', 1)
  ;


// Draw lines
d3.select('#rootGroup')
  .selectAll('.teeth')
  .data(tsr)
  .enter()
  .append('path')
  .attr('class', 'teeth')
  .attr('d', (d) => {
    var toVertex = (p) => p.x + ',' + p.y;
   
    var m = 'M';
    d.forEach((p, i) => {
      m += ' ' + toVertex(p);
    }); 
    m += ' z';
    
    return m;
  })
  .style('fill', 'none')
  .style('stroke', 'black')
  .style('stroke-width', '1')
  ;

var innerLines = new Array();
// The left half
for (var i = 0; i < n; i++) {
  var p1 = tss[i][3];
  var p2 = i + 1 > n - 1 ? tss[0][2] : tss[(i + 1)][0];
  innerLines.push([p1, p2]);
}

// The right half
for (var i = 0; i < n; i++) {
  var p1 = i == 0 ? tss[i][0] : tss[i][2];
  var p2 = i == 0 ? tss[n - 1][1] : tss[i - 1][1];
  innerLines.push([p1, p2]);
}

// Draw inner lines
d3.select('#rootGroup')
  .selectAll('.teethInner')
  .data(innerLines)
  .enter()
  .append('path')
  .attr('class', 'teethInner')
  .attr('d', (d) => {
    var toVertex = (p) => p.x + ',' + p.y;
   
    var m = 'M';
    d.forEach((p, i) => {
      m += ' ' + toVertex(p);
    }); 
    
    return m;
  })
  .style('fill', 'none')
  .style('stroke', 'black')
  .style('stroke-width', '1')
  ;
