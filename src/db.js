(function () {
    'use strict';

    var mongoose = require('mongoose');
    var Schema = mongoose.Schema;

    var ImageDataSchema = new Schema({
        fileName:       { type: String,  require: true, index: true },
        text:           { type: String,  require: true },
        imageUrl:       { type: String                 },
        registeredTime: { type: Date,    require: true },
        updatedTime:    { type: Date,    require: true },
        isDeleted:      { type: Boolean, require: true },
    });
    mongoose.model('ImageData', ImageDataSchema);

    mongoose.connect('mongodb://localhost/text2image', {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    exports.ImageData = mongoose.model('ImageData');
})();
