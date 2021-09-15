"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var path_1 = __importDefault(require("path"));
var webpack_1 = __importDefault(require("webpack"));
var portfinder_1 = __importDefault(require("portfinder"));
var html_webpack_plugin_1 = __importDefault(require("html-webpack-plugin"));
var nodeModulesReg = /node_modules/;
var getDevConfig = function (_a) {
    var port_ = _a.port;
    return __awaiter(void 0, void 0, void 0, function () {
        var port;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, portfinder_1["default"].getPortPromise({ port: port_ })];
                case 1:
                    port = _b.sent();
                    return [2 /*return*/, {
                            mode: 'development',
                            entry: ['react-hot-loader/patch', './src/index.tsx'],
                            stats: 'errors-only',
                            devtool: 'cheap-module-source-map',
                            devServer: {
                                port: port,
                                hot: true,
                                open: false,
                                historyApiFallback: true
                            }
                        }];
            }
        });
    });
};
var getProdConfig = function () {
    return {
        mode: 'production'
    };
};
exports["default"] = (function () { return __awaiter(void 0, void 0, void 0, function () {
    var isDev, envConfig;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                isDev = (_a = process.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.startsWith('dev');
                return [4 /*yield*/, (isDev ? getDevConfig({ port: 65535 }) : getProdConfig())];
            case 1:
                envConfig = _b.sent();
                return [2 /*return*/, __assign(__assign({}, envConfig), { output: {
                            filename: "js/[name].js",
                            chunkFilename: "js/[name]_chunk.js",
                            path: path_1["default"].resolve(__dirname, '../build'),
                            clean: true,
                            /* 资源模块(asset module)地址 */
                            assetModuleFilename: 'assets/[hash][ext][query]'
                        }, module: {
                            rules: [
                                {
                                    test: /\.(?:png|jpg|gif)$/,
                                    type: 'asset/resource'
                                },
                                {
                                    test: /\.[jt]sx?$/,
                                    exclude: nodeModulesReg,
                                    use: {
                                        loader: 'babel-loader',
                                        options: {
                                            presets: ['@babel/preset-typescript', '@babel/preset-react'],
                                            plugins: [
                                                'react-hot-loader/babel',
                                            ]
                                        }
                                    }
                                },
                                {
                                    test: /\.less$/,
                                    use: [
                                        'style-loader',
                                        {
                                            loader: 'css-loader',
                                            options: {
                                                "import": true,
                                                modules: {
                                                    localIdentName: "[path]-[local]-[hash:base64:5]"
                                                }
                                            }
                                        },
                                        {
                                            loader: 'less-loader',
                                            options: {
                                                lessOptions: {
                                                    javascriptEnabled: true
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    test: /\.css$/,
                                    use: [
                                        'style-loader',
                                        'css-loader',
                                    ]
                                },
                            ]
                        }, plugins: [
                            new html_webpack_plugin_1["default"]({
                                template: './public/index.html'
                            }),
                            new webpack_1["default"].ProvidePlugin({
                                React: 'react'
                            }),
                        ], resolve: {
                            extensions: ['.js', '.ts', '.tsx'],
                            alias: {
                                '@src': path_1["default"].resolve(__dirname, '../src'),
                                'winchi': path_1["default"].resolve(__dirname, '../src/lib/index.js')
                            }
                        } })];
        }
    });
}); });
