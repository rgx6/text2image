var fs      = require('fs');
var log4js  = require('log4js');
var logger  = log4js.getLogger('appLog');
var Promise = require('es6-promise').Promise;
var Twit    = require('twit');
var db      = require('./db.js');
var config  = require('../twitter_configuration.js');

exports.set = function (appRoot, app) {
    app.get(appRoot, index);
    app.get(appRoot + 'i/:fileName', getImage);
    app.post(appRoot + 'i', postImage);
};

var index = function (req, res) {
    'use strict';

    res.render('index');
    return;
};

var getImage = function (req, res) {
    'use strict';

    var fileName = req.params.fileName;

    if (isUndefinedOrNull(fileName)) {
        logger.warn('getImage bad parameter');
        res.send(400);
        return;
    }

    var query = db.ImageData.findOne({ fileName: fileName, isDeleted: false });
    query.exec(function (err, doc) {
        if (err) {
            logger.error(err);
            res.send(500);
            return;
        }

        if (!doc) {
            logger.error('fileName not registered : ' + fileName);
            res.send(404);
            return;
        }

        res.render('image', {
            fileName: fileName,
            text:     doc.text,
        });
        return;
    });
};

var postImage = function (req, res) {
    'use strict';

    var png = req.body.png;
    var thumbPng = req.body.thumbPng;
    var text = req.body.text;

    if (isUndefinedOrNull(png)      || typeof(png)      !== 'string' || png      === '' ||
        isUndefinedOrNull(thumbPng) || typeof(thumbPng) !== 'string' || thumbPng === '' ||
        isUndefinedOrNull(text)     || typeof(text)     !== 'string' || text     === '') {
        logger.warn('postImage bad parameter');
        res.send(400);
        return;
    }

    var fileName = new Date().getTime();

    Promise.all([
        saveImageFile('./public/log/'       + fileName + '.png', png),
        saveImageFile('./public/log/thumb/' + fileName + '.png', thumbPng),
        insertDB(fileName, text)
    ]).then(function () {
        var T = new Twit(config);
        T.post('media/upload', { media: png }, function (err, data, response) {
            if (err) {
                logger.error('media/upload ' + fileName, err);
                res.send(500);
                return;
            }

            logger.info('media/upload ' + fileName, data);
            var mediaIdStr = data.media_id_string;
            var params = { status: '', media_ids: [mediaIdStr] };
            T.post('statuses/update', params, function (err, data, response) {
                if (err) {
                    logger.error('statuses/update ' + fileName + ' ' + err.code, err);
                    res.status(500).json({ errorCode: err.code });
                    return;
                }

                logger.info('statuses/update ' + fileName, data.entities.media[0]);
                var url = data.entities.media[0].display_url;
                // hack : urlをdbに記録
                res.status(200).json({ fileName: fileName, picUrl: url });
                return;
            });
        });
    }).catch(function (err) {
        logger.error(err);
        res.send(500);
        return;
    });
};

function saveImageFile (path, pngData) {
    'use strict';
    logger.debug('saveImageFile');

    return new Promise(function (fulfill, reject) {
        if (!path || !pngData) {
            logger.warn('save image file bad param');
            reject(new Error('bad param'));
            return;
        }

        // todo : PNGフォーマットチェック

        var buf = new Buffer(pngData, 'base64');
        fs.writeFile(path, buf, function (err) {
            if (err) {
                logger.error(err);
                reject(new Error('save image file failed'));
                return;
            }

            fulfill();
            return;
        });
    });
}

function insertDB (fileName, text) {
    'use strict';
    logger.debug('insertDB');

    return new Promise(function (fulfill, reject) {
        if (!fileName || !text) {
            logger.error('insert db failed');
            reject(new Error('bad param'));
            return;
        }

        var imageData = new db.ImageData();
        imageData.fileName       = fileName;
        imageData.text           = text;
        imageData.registeredTime = new Date();
        imageData.updatedTime    = imageData.registeredTime;
        imageData.isDeleted      = false;

        imageData.save(function (err, doc) {
            if (err) {
                logger.error(err);
                reject(new Error('insert db failed'));
                return;
            }

            fulfill();
            return;
        });
    });
}

function isUndefinedOrNull (data) {
    'use strict';

    return typeof data === 'undefined' || data === null;
}
