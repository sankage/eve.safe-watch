function get(url) {
  // Return a new promise.
  return new Promise(function(resolve, reject) {
    // Do the usual XHR stuff
    var req = new XMLHttpRequest();
    req.open('GET', url);

    req.onload = function() {
      // This is called even on 404 etc
      // so check the status
      if (req.status == 200) {
        // Resolve the promise with the response text
        resolve(req.response);
      }
      else {
        // Otherwise reject with the status text
        // which will hopefully be a meaningful error
        reject(Error(req.statusText));
      }
    };

    // Handle network errors
    req.onerror = function() {
      reject(Error("Network Error"));
    };

    // Make the request
    req.send();
  });
}

function getJSON(url) {
  return get(url).then(JSON.parse);
}

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

var safe_points_for_system = function(system_id) {
  return new Promise(function(resolve, reject) {
    url = 'https://public-crest.eveonline.com/solarsystems/'+system_id+'/'
    getJSON(url).then(function(system) {
      return Promise.all(
        system.planets.map(function(planet) {
          return planet.href;
        }).map(getJSON)
      );
    }).then(function(planets) {
      planets.push({
        position: { x: 0, y: 0, z: 0 },
        name: 'Sun'
      });
      var pairs = pairwise(planets);
      var midpoints = pairs.map(function(pair) {
        return {
          name: pair[0].name + ' to ' + pair[1].name,
          midpoint: calculate_midpoint(pair[0].position, pair[1].position),
          distance: calculate_distance(pair[0].position, pair[1].position)
        }
      });
      return midpoints.map(function(mid) {
        return planets.map(function(planet) {
          var midpoint = calculate_midpoint(mid.midpoint, planet.position);
          var distances = calculate_distances(midpoint, planets);
          return {
            name: '(' + mid.name + ') to ' + planet.name,
            midpoint: midpoint,
            distances: distances,
            safe: distances.every(function(d) { return d > 2147483647000 })
          }
        });
      });
    }).then(function(midpoints) {
      final_midpoints = Array.prototype.concat.apply([], midpoints);
      filtered_midpoints = final_midpoints.filter(function(m) {
        return m.safe;
      });
      resolve(filtered_midpoints);
    });
  });
};

// safe_points_for_system('31000005').then(function(data) { console.log(data); });
