var loader = d3.dispatch("world");

d3.json("data/world-110m.json", function(error, world) {
  d3.select("#map").selectAll("svg").insert("path", ".foreground")
      .datum(topojson.feature(world, world.objects.land))
      .attr("class", "land");
  d3.select("#map").selectAll("svg").insert("path", ".foreground")
      .datum(topojson.mesh(world, world.objects.countries))
      .attr("class", "mesh");
  loader.world();
});

function cluster(ufos) {
  var locs = {};
  var bubbles = [];
  ufos.forEach(function(ufo) {
    if (!ufo[0] || ufo[0][0] === 0 || ufo[0][1] === 0 ||
        ufo[0][0] === undefined || ufo[0][1] === undefined) {
      return;
    }
    var key = ufo[0][0] + ',' + ufo[0][1]
    if (locs[key]) {
      bubbles[locs[key]].count += 1;
      bubbles[locs[key]].ufos.push(ufo);
    } else {
      locs[key] = bubbles.length;
      var ll = [ufo[0][1], ufo[0][0]];
      bubbles.push({
        name: ufo[1],
        ufos: [ufo],
        loc: ll,
        count: 1
      });
    }
  });
  bubbles.forEach(function(bubble) {
    bubble.radius = Math.sqrt(bubble.count);
  });
  return bubbles;
}

d3.json("data/ufo_metadata.json", function(error, data) {
  var bub = cluster(data);
  d3.select("g.sightings").selectAll("circle")
  .data(bub).enter()
  .append("circle")
  .attr("class", "point")
  .attr("cx", function(d) {return proj(d.loc)[0];})
  .attr("cy", function(d) {return proj(d.loc)[1];})
  .attr("r", function(d) {return d.radius;});
});

function projection(width, height) {
  return d3.geo.mercator()
      .precision(.5)
      .translate([0, 0])
      .scale(width / 2);
}
var zoom;

function drawMap(svg, path, mousePoint) {
  var projection = path.projection();

  svg.append("path")
      .datum(d3.geo.graticule())
      .attr("class", "graticule")
      .attr("d", path);

  svg.append("path")
      .datum({type: "Sphere"})
      .attr("class", "foreground")
      .attr("d", path);
  
  svg.append("g")
      .attr("class", "sightings");
  
  zoom = d3.behavior.zoom()
          .scaleExtent([1, 8])
          .on("zoom", move)
          .on("zoomend", calc);
  svg.call(zoom);
}

function calc() {
  var t = zoom.translate();
  var s = zoom.scale();
  var sx = -(t[0] - width/2)/(s*width);
  var sy = -(t[1] - height/2)/(s*height);
  var min = [sx*width - .5*width/s, sy*height - .5*height/s];
  var max = [sx*width + .5*width/s, sy*height + .5*height/s];

  var hue = "hsl(" + Math.random() * 360 + ",100%,50%)";


  window.datum = [];
  d3.selectAll("circle").filter(function(d) {
    var pos = proj(d.loc);
    return (pos[0] > min[0] && pos[0] < max[0] && pos[1] > min[1] && pos[1] < max[1]);
  }).each(function(r) {
    window.datum.push.apply(window.datum, r.ufos);
  });

  loadUfos(window.datum);
};

function move() {
  var t = d3.event.translate;
  var s = d3.event.scale;

  zoom.translate(t);
  d3.select("#map").selectAll("g").style("stroke-width", 1 / s).attr("transform", "translate(" + t + ")scale(" + s + ")");
  d3.select("#map").selectAll("path").attr("transform", "translate(" + t + ")scale(" + s + ")");
}



var width = 500,
    height = 500,
    proj = projection(width, height)
          .scale(100)
          .translate([width / 2, height /2]);
    
window.addEventListener('load', function() {
  d3.select("#map")
  .data([proj])
  .append("svg")
  .each(function(projection) {
    var path = d3.geo.path().projection(projection),
        svg = d3.select(this).call(drawMap, path, true);
        loader.on("world.0", function() { svg.selectAll("path").attr("d", path); });
      });
});


