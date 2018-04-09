const { generateCdnPath } = require('.');

function getAssets(manifest = {}, preloadBundles = [], config) {
  const cdnPath = generateCdnPath(config);
  const styles = Object.keys(manifest)
    .map(key => manifest[key])
    .filter(asset => asset.endsWith('.css'));

  const bundles = [];

  preloadBundles
    .filter(bundle => bundle && (bundle.file.endsWith('.js') || bundle.file.endsWith('.css')))
    .map(bundle => `${cdnPath}${bundle.file}`)
    .forEach((item) => {
      if (item.endsWith('.js')) {
        bundles.push(item);
      }
      if (item.endsWith('.css')) {
        styles.unshift(item);
      }
    });


  return {
    styles,
    bundles,
  };
}

exports.getAssets = getAssets;
