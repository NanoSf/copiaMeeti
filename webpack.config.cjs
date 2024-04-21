const path = require('path');


module.exports = {
    mode: 'development',
    entry:{
        alertas: './public/js/alertas.js',
        bundle: './public/js/app.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, './public/dist')
    },
    module: {
        rules: [    
          {
            test: /\.m?js$/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env']
              }
            }
          }
        ]
    }
}