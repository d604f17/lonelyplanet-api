'use strict';

var _main = require('./main.js');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lp = new _main2.default();

lp.city('denmark/copenhagen').then(function (city) {
  return city.sights();
}).then(function (sights) {
  console.log(sights);
});
//# sourceMappingURL=test.js.map