
module.exports = function (api) {
    api.cache(true);
  
    return {

      "presets": [

        "@babel/preset-typescript",
        "@babel/env"
  
      ],

      "plugins": [
        
        '@babel/plugin-transform-runtime',
        'transform-class-properties'
        
      ]

    }

  }