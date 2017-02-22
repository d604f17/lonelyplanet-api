import url from 'url';
import cheerio from 'cheerio';
import express from 'express';
import qs from 'qs';
import rp from 'request-promise';

const app = express();

const baseURL = 'http://www.lonelyplanet.com';

function getEndpoint(id, type = 'sights', limit = 1000, offset = 0) {
    const query = qs.stringify({
        'filter[poi][poi_type][equals]': type,
        'filter[poi][place_id][has_ancestor]': id,
        'page[limit]': limit,
        'page[offset]': offset
    }, {encode: false});

    return url.resolve(baseURL, `a/poi-sig/${id}?resource=` + encodeURIComponent('/pois?' + query))
}

function getSights(id) {
    return rp({
        url: getEndpoint(id),
        json: true,
        headers: {
            'Content-Type': 'application/json'
        }
    })
}

function getCityID(query) {
    const options = {
        url: url.resolve(baseURL, query),
        transform: (body) => {
            return cheerio.load(body)
        }
    };

    return new Promise(function (resolve, reject) {
        rp(options)
            .then($ => {
                resolve($('.sights__more').attr('href').split('/').pop());
            })
            .catch(reject)
    })
}

app.get('/', (req, res) => {
    res.json({
        name: 'lonely planet api',
        version: '0.0.1',
        authors: [
            'Rasmus Nørskov (rhnorskov)',
            'Mathias Wieland (cuntbag)',
            'Andreas Sommerset (flapjack)'
        ]
    })
});

app.get('/:query*', (req, res) => {
    getCityID(req.params.query + req.params[0])
        .then(id => {
            return getSights(id)
        })
        .then(data => {
            console.log(data.data.length);
            res.json(data)
        })
        .catch(console.error);
});

app.listen(process.env.port || 3000);


