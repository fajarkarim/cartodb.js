var LegendViewBase = require('./legend-view-base');

var HTMLLegendView = LegendViewBase.extend({
  _getCompiledTemplate: function () {
    return this.model.get('html');
  }
});

module.exports = HTMLLegendView;
