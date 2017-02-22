'use strict';

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

var baseURL = 'http://www.lonelyplanet.com';

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

function getSights(id) {
    return (0, _requestPromise2.default)({
        url: getEndpoint(id),
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

function getCityID(query) {
    var options = {
        url: _url2.default.resolve(baseURL, query),
        transform: function transform(body) {
            return _cheerio2.default.load(body);
        }
    };

    return new Promise(function (resolve, reject) {
        (0, _requestPromise2.default)(options).then(function ($) {
            resolve($('.sights__more').attr('href').split('/').pop());
        }).catch(reject);
    });
}

app.get('/', function (req, res) {
    res.json({
        name: 'lonely planet api',
        version: '0.0.1',
        authors: ['Rasmus Nørskov (rhnorskov)', 'Mathias Wieland (cuntbag)', 'Andreas Sommerset (flapjack)']
    });
});

app.get('/:query*', function (req, res) {
    getCityID(req.params.query + req.params[0]).then(function (id) {
        return getSights(id);
    }).then(function (data) {
        console.log(data.data.length);
        res.json(data);
    }).catch(console.error);
});

app.listen(process.env.port || 3000);
//# sourceMappingURL=main.js.map