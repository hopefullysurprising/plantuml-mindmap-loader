"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_utils_1 = require("schema-utils");
const parseMindMap_1 = require("./src/parseMindMap");
const schema = {
    type: 'object',
    properties: {
        test: {
            type: 'string',
        },
    },
};
function default_1(source) {
    const options = this.getOptions();
    (0, schema_utils_1.validate)(schema, options, {
        name: 'plantuml-mindmap-loader',
        baseDataPath: 'options',
    });
    const result = (0, parseMindMap_1.parseMindMap)(source);
    return `export default ${JSON.stringify(result)};`;
}
exports.default = default_1;
