const path = require("path");

const { Liquid } = require('liquidjs');
const PluginError = require("plugin-error");
const through = require("through2");

const PLUGIN_NAME = (
    path.basename(__dirname) + "/" + path.basename(__filename, ".js")
);

/**
 * @param {import("vinyl")} chunk also called "file"
 * @param {BufferEncoding} encoding
 * @param {through.TransformCallback} callback
 */
function transformChunk(chunk, _encoding, callback) {
    if(chunk.isNull()) {
        callback(null, chunk);
        return;
    }
    if (chunk.isStream()) {
        callback(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
        return;
    }

    // We're done with plugin setup

    const engine = new Liquid(options)

    engine.parseAndRender(chunk.contents.toString(), chunk.data)
    .then(results => {
        chunk.contents = Buffer.from(results.trim());
        callback(null, chunk)
    }).catch(error => {
       callback(new PluginError(PLUGIN_NAME, error, {fileName: chunk.path}));
    })
}

let options = {};

/**
 *
 * @param {import("liquidjs/dist/liquid-options").LiquidOptions} opts Standard liquidjs options
 */
module.exports = function liquidjs(opts) {
    options = opts;
    return through.obj(transformChunk)
}
