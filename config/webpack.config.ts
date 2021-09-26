import path from 'path'
import webpack, { Configuration, } from 'webpack'
import portfinder from 'portfinder'
import HtmlWebpackPlugin from 'html-webpack-plugin'

interface WebpackConfig extends Configuration {
 devServer?: { [x: string]: any }
}

const nodeModulesReg = /node_modules/

const getDevConfig = async (
 { port: port_ }: { port: number }
): Promise<WebpackConfig> => {
 const port = await portfinder.getPortPromise({ port: port_ })
 return {
  mode: 'development',
  entry: ['react-hot-loader/patch', './src/index.tsx'],
  stats: 'errors-only',
  devtool: 'cheap-module-source-map',
  devServer: {
   port,
   hot: true,
   open: false,
   historyApiFallback: true,
   proxy: {
    '/api': {
     target: 'https://test.vvaryun.com/amway/c_api/api/v1/admin',
     pathRewrite: { '^/api': '' },
     secure: false,
    }
   }
  },
 }
}

const getProdConfig = (): WebpackConfig => {
 return {
  mode: 'production',
 }
}

export default async (): Promise<WebpackConfig> => {
 const isDev = process.env.NODE_ENV?.startsWith('dev')
 const envConfig = await (isDev ? getDevConfig({ port: 65535 }) : getProdConfig())

 return {
  ...envConfig,
  output: {
   filename: `js/[name].js`,
   chunkFilename: `js/[name]_chunk.js`,
   path: path.resolve(__dirname, '../build'),
   clean: true,
   /* 资源模块(asset module)地址 */
   assetModuleFilename: 'assets/[hash][ext][query]',
  },
  module: {
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
       ],
      },
     },
    },
    {
     test: /\.less$/,
     use: [
      'style-loader',
      {
       loader: 'css-loader',
       options: {
        import: true,
        modules: {
         localIdentName: "[path][local]",
        },
       },
      },
      {
       loader: 'less-loader',
       options: {
        lessOptions: {
         javascriptEnabled: true,
        },
       }
      }
     ]
    },
    {
     test: /\.css$/,
     use: [
      'style-loader',
      'css-loader',
     ],
    },
   ]
  },
  plugins: [
   new HtmlWebpackPlugin({
    template: './public/index.html',
   }),
   new webpack.ProvidePlugin({
    React: 'react',
   }),
  ],
  resolve: {
   extensions: ['.js', '.ts', '.tsx'],
   alias: {
    '@src': path.resolve(__dirname, '../src'),
    'winchi': path.resolve(__dirname, '../src/lib/index.js')
   },
  },
 }
}