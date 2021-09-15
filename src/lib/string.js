"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeStr = void 0;
const R = require("ramda");
exports.mergeStr = R.curry((split, rest) => rest.reduce((r, c) => `${r}${split}${c}`));
