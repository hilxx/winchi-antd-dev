"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.polling = exports.computePercent = void 0;
const R = require("ramda");
exports.computePercent = R.curry((validBit, total, cur) => `${(cur / total * 100) || 0}`.slice(0, validBit + 2) + '%');
exports.polling = R.curry((r1, r2, slide) => {
    const len = Math.abs(r1 - r2) + 1;
    const start = Math.min(r1, r2);
    const offset = ((slide - start) % len + len) % len;
    return offset + start;
});
