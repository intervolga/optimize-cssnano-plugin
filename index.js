const cssnano = require('cssnano');

/**
 * Optimize cssnano plugin
 *
 * @param {Object} options
 */
function OptimizeCssnanoPlugin(options) {
  this.options = Object.assign({
    sourceMap: false,
    cssnanoOptions: {
      preset: 'default',
      map: false,
    },
  }, options);

  if (this.options.sourceMap) {
    this.options.cssnanoOptions.map = Object.assign(
      {inline: false},
      this.options.cssnanoOptions.map || {});
  }
}

OptimizeCssnanoPlugin.prototype.apply = function(compiler) {
  const self = this;

  compiler.plugin('emit', function(compilation, callback) {
    // Search for CSS assets
    const assetsNames = Object.keys(compilation.assets)
      .filter((assetName) => {
        return /\.css$/i.test(assetName);
      });

    let hasErrors = false;
    const promises = [];

    // Generate promises for each minification
    assetsNames.forEach((assetName) => {
      // Original CSS
      const asset = compilation.assets[assetName];
      const originalCss = asset.source();
      // .replace(/\/\*# sourceMappingURL.+\*\//, '');

      // Options for particalar cssnano call
      const options = JSON.parse(JSON.stringify(self.options.cssnanoOptions));
      options.to = assetName;

      // Extract or remove previous map
      const mapName = assetName + '.map';
      if (options.map) {
        // Use previous map if exist...
        if (compilation.assets[mapName]) {
          const mapObject = JSON.parse(compilation.assets[mapName].source());

          // ... and not empty
          if (mapObject.sources.length > 0 || mapObject.mappings.length > 0) {
            options.map.prev = compilation.assets[mapName].source();
          }
        }
      } else {
        delete compilation.assets[mapName];
      }

      // Run minification
      const promise = cssnano.process(originalCss, options)
        .then((result) => {
            if (hasErrors) {
              return;
            }

            // Extract CSS back to assets
            const processedCss = result.css;
            compilation.assets[assetName] = {
              source: function() {
                return processedCss;
              },
              size: function() {
                return processedCss.length;
              },
            };

            // Extract map back to assets
            if (result.map) {
              const processedMap = result.map.toString();

              compilation.assets[mapName] = {
                source: function() {
                  return processedMap;
                },
                size: function() {
                  return processedMap.length;
                },
              };
              // processedCss += `\n/*# sourceMappingURL=${assetName + '.map'} */`;
            }
          }
        ).catch(function(err) {
            hasErrors = true;
            throw new Error('CSS minification error: ' + err.message +
              '. File: ' + assetName);
          }
        );
      promises.push(promise);
    });

    Promise.all(promises)
      .then(function() {
        callback();
      })
      .catch(callback);
  });
};

module.exports = OptimizeCssnanoPlugin;
