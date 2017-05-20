import qs from 'qs';
import url from 'url';
import cheerio from 'cheerio';
import rp from 'request-promise';

const baseURL = 'https://www.lonelyplanet.com/';

function getEndpoint(id, type = 'sights', limit = 1000, offset = 0) {
  const query = qs.stringify({
    'filter[poi][poi_type][equals]': type,
    'filter[poi][place_id][has_ancestor]': id,
    'page[limit]': limit,
    'page[offset]': offset,
  }, {encode: false});

  return url.resolve(baseURL, `a/poi-sig/${id}?resource=` + encodeURIComponent('/pois?' + query));
}

class City {
  constructor(id, query) {
    let parts = query.split('/');

    this.id = id;
    this.country = parts[0];
    this.city = parts.pop();
  }

  sights() {
    return new Promise((resolve, reject) => {
      const options = {
        url: getEndpoint(this.id),
        json: true,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      rp(options).then(result => {
        resolve(result.data.map(sight => {
          return new Sight(this, {
            name: sight.attributes.name,
            address: sight.attributes.address.street,
            // hours_string: sight.attributes.hours_string,
            // price_string: sight.attributes.price_string,
            // review: sight.attributes.review,
          });
        }));
      }).catch(reject);
    });
  }
}

class Sight {
  constructor(city, parameters) {
    Object.assign(this, {city}, parameters);
  }
}

export default class LonelyPlanet {
  city(query) {
    return new Promise((resolve, reject) => {
      rp(baseURL + query).then(body => {
        const $ = cheerio.load(body);
        const href = $('.food-and-drink__more').attr('href');

        if (href)
          resolve(new City(href.split('/').pop(), query));
        else
          reject(new Error('href was not found'))
      });
    });
  }
}