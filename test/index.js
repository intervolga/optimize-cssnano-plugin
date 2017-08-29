const expect = require('expect.js');
const fs = require('fs');
const path = require('path');
const runWebpack = require('./helpers/run-webpack');

describe('optimize cssnano plugin', () => {
  it('should update original source map', () => {
    const paths = getCasePaths('map-map');
    try {
      fs.unlinkSync(paths['produced-css']);
    } catch (e) {
      // noop
    }
    try {
      fs.unlinkSync(paths['produced-map']);
    } catch (e) {
      // noop
    }

    return runWebpack(paths.source).then((result) => {
      // expect(fs.readFileSync(paths['produced-css']).toString())
      //   .to.eql(fs.readFileSync(paths['expected-css']).toString());
      expect(fs.readFileSync(paths['produced-map']).toString())
        .to.eql(fs.readFileSync(paths['expected-map']).toString());
    });
  });

  it('should remove original source map', () => {
    const paths = getCasePaths('map-nomap');
    try {
      fs.unlinkSync(paths['produced-css']);
    } catch (e) {
      // noop
    }
    try {
      fs.unlinkSync(paths['produced-map']);
    } catch (e) {
      // noop
    }

    return runWebpack(paths.source, true, false).then((result) => {
      // expect(fs.readFileSync(paths['produced-css']).toString())
      //   .to.eql(fs.readFileSync(paths['expected-css']).toString());
      expect(fs.existsSync(paths['produced-map']))
        .to.be(false);
    });
  });

  it('should generate new source map', () => {
    const paths = getCasePaths('nomap-map');
    try {
      fs.unlinkSync(paths['produced-css']);
    } catch (e) {
      // noop
    }
    try {
      fs.unlinkSync(paths['produced-map']);
    } catch (e) {
      // noop
    }

    return runWebpack(paths.source, false, true).then((result) => {
      // expect(fs.readFileSync(paths['produced-css']).toString())
      //   .to.eql(fs.readFileSync(paths['expected-css']).toString());
      expect(fs.readFileSync(paths['produced-map']).toString())
        .to.eql(fs.readFileSync(paths['expected-map']).toString());
    });
  });
});

/**
 * Generate paths to source and expected files
 *
 * @param {String} caseName
 * @return {{source: *, expected: *}}
 */
function getCasePaths(caseName) {
  return {
    'source': path.join(__dirname, 'cases', caseName,
      'source.js'),
    'expected-css': path.join(__dirname, 'cases', caseName,
      'expected.css'),
    'expected-map': path.join(__dirname, 'cases', caseName,
      'expected.css.map'),
    'produced-css': path.join(__dirname, 'cases', caseName,
      'produced.css'),
    'produced-map': path.join(__dirname, 'cases', caseName,
      'produced.css.map'),
  };
}
