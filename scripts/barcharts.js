
window.example_set = [];

function showRandomExample() {
  var randomIndex = window.example_set[Math.floor(Math.random() * window.example_set.length)];
  d3.json('data/descriptions/ufo_data_' +  Math.floor(randomIndex/1000) + '.json', function(data) {
    $("#example").text(data[randomIndex%1000]);
  });
}

window.addEventListener('load', function() {
    queue().defer(d3.json, 'data/ufo_metadata.json').await(loadMetaData);
    queue().defer(d3.json, 'data/ufo_read_stats.json').await(loadReadStats);
});

window.total = 0;
window.missiles = 0;
window.total_shapes = [];
window.total_years = [];
window.total_months = [];

window.fake_subset = [];

var loadMetaData = function(error, ufos) {
  window.total = ufos.length;
  total_shapes_dict = [];
  total_years_dict = [];
  total_months_dict = [];
  ufos.forEach(function(ufo) {
    if(ufo[5] == 1) window.missiles ++;
    if (fake_subset.length<100) {
      fake_subset.push(ufo);
    }
    tally_shapes(ufo[4], total_shapes_dict);
    tally_time(ufo[2], total_years_dict, total_months_dict);
  });
  window.total_shapes = keepTopX(total_shapes_dict, 12).sort(function(a, b) {
      if(a.label < b.label) return -1;
      if(a.label > b.label) return 1;
      return 0;
  });
  month_names = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  for(i = 0; i < 12; i++) {
    window.total_months.push({"label" : month_names[i], "value" : total_months_dict[i]});
  }
  window.total_years = keepLastX(total_years_dict, 12);
  loadUfos(ufos);
}

function loadUfos(ufo_subset) {
    window.example_set = [];
  if (ufo_subset.length == window.total) {
    renderBarChart("#shapes", window.total_shapes);
    renderBarChart("#years", window.total_years); 
    renderBarChart("#months", window.total_months); 
    $("#headline").text("There have been " + window.total + " UFO sightings to-date.");
    $("#subhead").text("Of which "+ window.missiles +" contain a NUFORC note 'missile launch.'");
  } else {
      var missiles = 0;
      window.example_set = [];
      shape_subset = [];
      for (var i = window.total_shapes.length - 1; i >= 0; i--) {
        shape_subset[window.total_shapes[i].label] = 0;
      };

      ufo_subset.forEach(function(ufo) {
        if(ufo[5] == 1) {
          missiles ++;
        }
        window.example_set.push(ufo[6]);

        shape = ufo[4];
        if (shape == "" || shape == "unknown" || shape == "other" || shape == "undefined") {
           shape_subset["unknown / other"] ++;
        }
        else if(shape_subset[shape] != undefined) {
          shape_subset[shape]++;
        }
        // which year is it?
        // which month is it?
      });
    renderBarChart("#shapes", window.total_shapes, shape_subset);
      showRandomExample();
      $("#headline").text("Showing " + ufo_subset.length + " of total " + window.total);
      if (missiles>1) {
        $("#subhead").text("Of which "+missiles+" has a NUFORC note 'missile launch.'");
      }
      else if (missiles==0) {
        $("#subhead").text("Of which just one has a NUFORC note 'missile launch!'");
      }
      else {
        $("#subhead").text("The truth is out there.");
      }
  }
}

function renderBarChart(which, data, subset) {
  var width = 100,
  barHeight = 10;

  var max = 0;
  for (var i in data) {
    if(data[i].value>max) {
      max = data[i].value;
    }

    if(subset!=undefined) {
      data[i].subset_value = subset[data[i].label];
    } else {
      data[i].subset_value = 0;
    }
  }

  var x = d3.scale.linear()
      .domain([0, max]) //TOOD fix
      .range([0, width]);

  var chart = d3.select(which)
      .attr("width", width)
      .attr("height", barHeight * data.length);

  var bar = chart.selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  bar.append("rect")
      .attr("width",  function(d) { return x(d.value); })
      .attr("height", barHeight - 1);
  
    if(subset!=undefined) {
      console.log("trying to draw this in "+which)
      bar.append("rect")
        .classed('subset', true)
        .attr("width",  function(d) { console.log(x(d.subset_value)); return x(d.subset_value); })
        .attr("height", barHeight - 1);
    }

  bar.append("text")
      .attr("x", 3)
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d, i) { return d.label + ": " + d.value; });

  //TODO add subset!

}



function tally_time(timestamp, year_tally_dict, month_tally_dict) {
  var date = new Date(timestamp);
  var month = date.getMonth();
  var year = date.getFullYear();
  if (!isNaN(year) && isFinite(year)) {
    if(year_tally_dict[year] == undefined){
      year_tally_dict[year] = 0;
    }
    year_tally_dict[year] ++;
  }
  if (month >= 0 && month <=11) {
    if(month_tally_dict[month] == undefined){
      month_tally_dict[month] = 0;
    }
    month_tally_dict[month] ++;
  }
}

function tally_shapes(shape, shape_tally_dict) {
    if (shape == "" || shape == "unknown" || shape == "other" || shape == "undefined") {
      shape = "unknown / other";
    }
    if(shape_tally_dict[shape] == undefined){
      shape_tally_dict[shape] = 0;
    }
    shape_tally_dict[shape] ++;
}

var loadReadStats = function(error, stats) {
  console.log(stats);
}

// most recent years, binning by 2 years at a time
function keepLastX(data_dict, x) {
  var last = 0;
  var years = [];
  for (var label in data_dict) {
    if (data_dict[label] > last) {
      last = data_dict[label];
    }
    years.push(label);
  }
  years.sort();
  var resulting_data = [];
  var i = years.length - 1;
  for (; i >= 0 && resulting_data.length < x-1; i = i-2) {
    resulting_data.push({"label":years[i-1]+" - "+years[i], "value":(data_dict[years[i]] + data_dict[years[i-1]])});
  }
  var remains = 0;
  i--;
  var remain_year = years[i];
  for (; i>=0; i--) {
    remains += data_dict[years[i]];
  }
  if (resulting_data.length == x-1) {

    resulting_data.push({"label":remain_year + " & prior", "value":remains});
  }
  return resulting_data;
}

// top-valued pairs
function keepTopX(data_dict, x) {
  var values = [];
  for (var label in data_dict) {
    values.push(data_dict[label]);
  }
  values.sort(function(a, b) { return b-a; });
  var cutoff = values[(values.length < x ? values.length : x) - 1];
  var resulting_data = [];
  for (var label in data_dict) {
    if(data_dict[label] >= cutoff && resulting_data.length<x) {
      resulting_data.push({"label":label, "value":data_dict[label]});
    }
  }
  return resulting_data;
}
