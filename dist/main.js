'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var baseURL = 'https://www.lonelyplanet.com/';

function getEndpoint(id) {
  var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'sights';
  var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
  var offset = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

  var query = _qs2.default.stringify({
    'filter[poi][poi_type][equals]': type,
    'filter[poi][place_id][has_ancestor]': id,
    'page[limit]': limit,
    'page[offset]': offset
  }, { encode: false });

  return _url2.default.resolve(baseURL, 'a/poi-sig/' + id + '?resource=' + encodeURIComponent('/pois?' + query));
}

var City = function () {
  function City(id, query) {
    _classCallCheck(this, City);

    var parts = query.split('/');

    this.id = id;
    this.country = parts[0];
    this.city = parts.pop();
  }

  _createClass(City, [{
    key: 'sights',
    value: function sights() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        var options = {
          url: getEndpoint(_this.id),
          json: true,
          headers: {
            'Content-Type': 'application/json'
          }
        };

        (0, _requestPromise2.default)(options).then(function (result) {
          resolve(result.data.map(function (sight) {
            return new Sight(_this, {
              name: sight.attributes.name,
              address: sight.attributes.address.street
            });
          }));
        }).catch(reject);
      });
    }
  }]);

  return City;
}();

var Sight = function Sight(city, parameters) {
  _classCallCheck(this, Sight);

  Object.assign(this, { city: city }, parameters);
};

var LonelyPlanet = function () {
  function LonelyPlanet() {
    _classCallCheck(this, LonelyPlanet);
  }

  _createClass(LonelyPlanet, [{
    key: 'city',
    value: function city(query) {
      return new Promise(function (resolve, reject) {
        (0, _requestPromise2.default)(baseURL + query).then(function (body) {
          var $ = _cheerio2.default.load(body);
          var href = $('.food-and-drink__more').attr('href');

          if (href) resolve(new City(href.split('/').pop(), query));else reject(new Error('href was not found'));
        });
      });
    }
  }]);

  return LonelyPlanet;
}();

exports.default = LonelyPlanet;
//# sourceMappingURL=main.js.map