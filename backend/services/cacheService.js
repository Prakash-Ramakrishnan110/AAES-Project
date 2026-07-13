const NodeCache = require('node-cache');
const myCache = new NodeCache({ stdTTL: 600 }); // 10 minutes default TTL

const cacheMiddleware = (duration) => (req, res, next) => {
    if (req.method !== 'GET') return next();

    const key = '__express__' + (req.originalUrl || req.url);
    const cachedBody = myCache.get(key);

    if (cachedBody) {
        return res.send(cachedBody);
    } else {
        res.sendResponse = res.send;
        res.send = (body) => {
            myCache.set(key, body, duration);
            res.sendResponse(body);
        };
        next();
    }
};

module.exports = { myCache, cacheMiddleware };
