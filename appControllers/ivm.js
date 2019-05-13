const D_CONSTANT = 5000; // lower this value to give more preference to nearer locations.
const RADIUS_EARTH = 6371; // Radius of earth in kilometers


var fs = require('fs'),
  path = require('path'),
  filePath = path.join(__dirname, '../db/cities.tsv');

function toRad(x) {
  return x * Math.PI / 180;
}

function sortByScore(x, y) {
  return y.score - x.score;
}

function getDistanceByHaversineFormula(query_latitude, query_longitude, city_latitude, city_longitude) {
  // applying haversine formula to calculate distance between two points on earth
  // for more info visit https://en.wikipedia.org/wiki/Haversine_formula
  var latitude_delta_radian = toRad(city_latitude - query_latitude);;
  var longitude_delta_radian = toRad(city_longitude - query_longitude);
  var a = Math.sin(latitude_delta_radian / 2) * Math.sin(latitude_delta_radian / 2) + Math.cos(toRad(query_latitude)) * Math.cos(toRad(city_latitude)) * Math.sin(longitude_delta_radian / 2) * Math.sin(longitude_delta_radian / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // distance between two points on earth (in kilometers)
  var distance = RADIUS_EARTH * c;
  return distance;
}

class AppController {
  getSuggestions(req, res) {
    var query_city;
    var query_latitude;
    var query_longitude;
    var final_score;

    query_city = req.query.q;
    query_latitude = req.query.latitude;
    query_longitude = req.query.longitude;

    if (query_city != null) {
      query_city = query_city.trim();
      query_city = query_city.toLowerCase();
    }
    if (!query_city || !isNaN(query_city)) {
      return res.status(200).send(
        { "message": "Please send a valid text query. Example: http://ec2-13-234-30-4.ap-south-1.compute.amazonaws.com/suggestions?q=london" }
      );
    }

    if (query_city.length < 3) {
      return res.status(200).send(
        { "message": "Query value should be at least 3 characters long." }
      );
    }

    if (query_latitude && query_longitude) {
      if (isNaN(query_latitude) || isNaN(query_longitude)) {
        return res.status(200).send(
          { "message": "Please enter a valid latitude and longitude value." }
        );
      } else if (query_latitude < -90 || query_latitude > 90) {
        return res.status(200).send(
          { "message": "Latitude value is out of range (-90 to +90)" }
        );
      } else if (query_longitude < -180 || query_longitude > 180) {
        return res.status(200).send(
          { "message": "Longitude value is out of range (-180 to +180)" }
        );
      }
    } else if ((query_latitude && !query_longitude) || (!query_latitude && query_longitude)) {
      return res.status(200).send(
        { "message": "Please enter both latitude and longitude value." }
      );
    }

    var json_city_result = {} // empty result object
    json_city_result["suggestions"] = []; // empty array, which you can push() values into

    // creating asynchronous read file stream
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(filePath)
    });

    // asynchrously reading lines from file
    lineReader.on('line', function (line) {
      var tabs = line.split('\t'); // Columns in file are separated by tabs
      var city_name = tabs[2].toLowerCase();
      var city_latitude = tabs[4];
      var city_longitude = tabs[5];

      if (city_name.includes(query_city)) {
        // scoring based on query length and city name length
        var length_score = query_city.length / city_name.length;
        //scoring based on index value. Greater the index value, lower the index score.
        var query_index = city_name.indexOf(query_city);
        var index_score = 1 - (query_index / city_name.length);
        // taking average of length score and index score
        var query_score = (length_score + index_score) / 2

        if (query_latitude && query_longitude) {
          // distance between two points on earth (in kilometers)
          var distance = getDistanceByHaversineFormula(query_latitude, query_longitude, city_latitude, city_longitude);
          // using an exponential function to calculate score based of distance
          // lower the value of D_CONSTANT to give nearer location exponentially higher preference
          var distance_score = 1 - (distance / (D_CONSTANT + distance));

          // taking average of query score and distance score for final confidence score 
          final_score = (query_score + distance_score) / 2;
        } else {
          final_score = query_score;
        }

        var city_data = {
          name: tabs[2] + ", " + tabs[8], // City name, country code
          latitude: city_latitude,
          longitude: city_longitude,
          score: final_score.toFixed(1)
        };
        json_city_result["suggestions"].push(city_data);
      }
    });
    lineReader.on('close', function () {
      json_city_result["suggestions"].sort(sortByScore);
      return res.status(200).send(
        json_city_result
      );
    });
  }

  defaultPage(req, res) {
    return res.status(200).send(
      {
        "message": "Hey there! Please make a valid request.",
        "example": "http://ec2-13-234-30-4.ap-south-1.compute.amazonaws.com/suggestions?q=new%20york&latitude=19.0760&longitude=72.8777",
        "parameters": "q(string, mandatory), latitude(float, optional), longitude(float, optional)"
      }
    );
  }

}

const AppsController = new AppController();
export default AppsController;
