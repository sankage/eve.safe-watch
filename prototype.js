var pairwise = function(list) {
  if (list.length < 2) {
    return [];
  }
  var first = list[0],
        rest = list.slice(1),
      pairs = rest.map(function (x) { return [first, x]; });
  return pairs.concat(pairwise(rest));
};

var calculate_distance = function(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) +
                   Math.pow(p2.y - p1.y, 2) +
                   Math.pow(p2.z - p1.z, 2));
};

var calculate_distances = function(p1, points) {
  return points.map(function(p) {
    return calculate_distance(p1, p.position);
  });
};

var calculate_midpoint = function(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
    z: (p1.z + p2.z) / 2
  };
};

var request_planet = function(url) {
  return $.ajax({
    url: url,
    dataType: 'json'
  })
};

var safe_points_for_system = function(system_id) {
  return new Promise(function(resolve, reject) {
    $.ajax({
      url: 'https://public-crest.eveonline.com/solarsystems/'+system_id+'/',
      dataType: 'json'
    }).done(function(system) {
      var planet_hrefs = [];
      $.each(system.planets, function(i, planet) {
        planet_hrefs.push(planet.href);
      });
      $.when.apply($, planet_hrefs.map(request_planet)).done(function() {
        var points = [{
          position: { x: 0, y: 0, z: 0 },
          name: 'Sun'
        }];
        for (var i = 0, j = arguments.length; i < j; i++) {
          planet = arguments[i][0];
          points.push(planet);
        }

        var pairs = pairwise(points);
        var midpoints = pairs.map(function(pair) {
          return {
            name: pair[0].name + ' to ' + pair[1].name,
            midpoint: calculate_midpoint(pair[0].position, pair[1].position),
            distance: calculate_distance(pair[0].position, pair[1].position)
          }
        });
        final_midpoints = midpoints.map(function(mid) {
          return points.map(function(point) {
            var midpoint = calculate_midpoint(mid.midpoint, point.position);
            var distances = calculate_distances(midpoint, points);
            return {
              name: '(' + mid.name + ') to ' + point.name,
              midpoint: midpoint,
              distances: distances,
              safe: distances.every(function(d) { return d > 2147483647000 })
            }
          });
        });
        final_midpoints = Array.prototype.concat.apply([], final_midpoints);
        filtered_midpoints = final_midpoints.filter(function(m) {
          return m.safe;
        });
        resolve(filtered_midpoints);
      });
    });
  });
};

// safe_points_for_system('31000005').then(function(data) { console.log(data); });
