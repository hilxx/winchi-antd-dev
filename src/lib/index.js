"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.R = void 0;
exports.R = require("ramda");
const func = require("./func");
const array = require("./array");
const ao = require("./ao");
const isWhat = require("./isWhat");
const string = require("./string");
const number = require("./number");
__exportStar(require("./func"), exports);
__exportStar(require("./array"), exports);
__exportStar(require("./ao"), exports);
__exportStar(require("./isWhat"), exports);
__exportStar(require("./string"), exports);
__exportStar(require("./number"), exports);
exports.default = {
    ...func,
    ...ao,
    ...array,
    ...string,
    ...number,
    ...isWhat,
};
