var $ = require('jquery');
var Backbone = require('backbone');
var Map = require('../../../../src/geo/map');
var LeafletMapView = require('../../../../src/geo/leaflet/leaflet-map-view');
var TooltipModel = require('../../../../src/geo/ui/tooltip-model');
var TooltipView = require('../../../../src/geo/ui/tooltip-view');

describe('geo/ui/tooltip-view', function () {
  beforeEach(function () {
    this.container = $("<div id='map'>").css('height', '1000px');
    $('body').append(this.container);
    var map = new Map(null, { layersFactory: {} });
    this.mapView = new LeafletMapView({
      el: $('#map'),
      map: map,
      layerViewFactory: jasmine.createSpyObj('layerViewFactory', ['createLayerView']),
      layerGroupModel: new Backbone.Model()
    });

    this.layerView = new Backbone.View();
    this.tooltipModel = new TooltipModel({
      template: '{{#fields}}{{{ value }}},{{/fields}}'
    });
    this.tooltipView = new TooltipView({
      model: this.tooltipModel,
      layerView: this.layerView,
      mapView: this.mapView
    });
  });

  afterEach(function () {
    $('#map').remove();
  });

  it('should render fields in specified order', function () {
    this.tooltipModel.set('fields', [{
      name: 'test2'
    }, {
      name: 'test1'
    }, {
      name: 'huracan'
    }]);
    this.tooltipView.enable();
    this.layerView.trigger('mouseover', new $.Event('e'), [0, 0], [0, 0], {
      test1: 'test1',
      test2: 'test2',
      huracan: 'huracan'
    });

    expect(this.tooltipView.$el.html()).toEqual('test2,test1,huracan,');
  });

  it('should not show the tooltip if there are no fields', function () {
    this.tooltipModel.set('fields', []);
    this.tooltipView.enable();

    this.layerView.trigger('mouseover', new $.Event('e'), [0, 0], [0, 0], {});

    // Tooltip is hidden
    expect(this.tooltipView.model.isVisible()).toBeFalsy();
  });

  it('should hide the tooltip if it was visible and there are no fields now', function () {
    this.tooltipModel.set('fields', [{
      name: 'test2'
    }]);
    this.tooltipView.enable();

    // mouseover a layer whose tooltip has fields
    this.layerView.trigger('mouseover', new $.Event('e'), [0, 0], [0, 0], { name: 'wadus' });

    // Tooltip is visible
    expect(this.tooltipView.model.isVisible()).toBeTruthy();

    this.tooltipModel.set('fields', []);

    // mouseover a layer whose tooltip doesn NOT has fields
    this.layerView.trigger('mouseover', new $.Event('e'), [0, 0], [0, 0], {});

    // Tooltip is hidden
    expect(this.tooltipView.model.isVisible()).toBeFalsy();
  });

  it('should use alternate_names ', function () {
    this.tooltipModel.set('template', '{{#fields}}{{{ title }}},{{/fields}}');

    this.tooltipModel.set('fields', [{
      name: 'test2',
      title: true
    }, {
      name: 'test1',
      title: true
    }, {
      name: 'huracan',
      title: true
    }]);
    this.tooltipModel.set('alternative_names', {
      'test1': 'testnamed'
    });
    this.tooltipView.enable();
    this.layerView.trigger('mouseover', new $.Event('e'), [0, 0], [0, 0], {
      test1: 'test1',
      test2: 'test2',
      huracan: 'huracan'
    });
    expect(this.tooltipView.$el.html()).toEqual('test2,testnamed,huracan,');
  });

  it('should position the element correctly', function () {
    this.tooltipView.$el.css('width', '200px');
    this.tooltipView.$el.css('height', '20px');

    this.tooltipModel.set('position', 'bottom|right');
    this.tooltipModel.set('pos', { x: 10, y: 10 });

    expect(this.tooltipView.$el.css('top')).toBe('10px');
    expect(this.tooltipView.$el.css('left')).toBe('10px');

    this.tooltipModel.set('position', 'top|left');
    this.tooltipModel.set('pos', { x: 210, y: 40 });

    expect(this.tooltipView.$el.css('top')).toBe('20px');
    expect(this.tooltipView.$el.css('left')).toBe('10px');

    this.tooltipModel.set('position', 'middle|center');
    this.tooltipModel.set('pos', { x: 150, y: 30 });

    expect(this.tooltipView.$el.css('top')).toBe('20px');
    expect(this.tooltipView.$el.css('left')).toBe('50px');

    // With offsets
    this.tooltipModel.set('position', 'middle|center');
    this.tooltipModel.set('offset', [-10, -10]);
    this.tooltipModel.set('pos', { x: 0, y: 0 });
    this.tooltipModel.set('pos', { x: 150, y: 30 });

    expect(this.tooltipView.$el.css('top')).toBe('10px');
    expect(this.tooltipView.$el.css('left')).toBe('40px');
  });

  describe('overflow positioning', function () {
    beforeEach(function () {
      $('#map').css('height', '100px');
      $('#map').css('width', '100px');
      this.tooltipView.$el.css('height', '80px');
      this.tooltipView.$el.css('width', '80px');
      this.mapView.invalidateSize();
    });

    it('should position the element on top when bottom overflow occurs', function () {
      this.tooltipModel.set('position', 'bottom|right');
      this.tooltipModel.set('pos', { x: 0, y: 90 });

      expect(this.tooltipView.$el.css('top')).toBe('10px');
    });

    it('should position the element on the bottom when top overflow occurs', function () {
      this.tooltipModel.set('position', 'top|right');
      this.tooltipModel.set('pos', { x: 0, y: 10 });

      expect(this.tooltipView.$el.css('top')).toBe('10px');
    });

    it('should position the element on top/bottom when overflow vertically centered and overflow occurs', function () {
      this.tooltipModel.set('position', 'middle|right');
      this.tooltipModel.set('pos', { x: 0, y: 90 });

      expect(this.tooltipView.$el.css('top')).toBe('10px');

      this.tooltipModel.set('position', 'middle|right');
      this.tooltipModel.set('pos', { x: 0, y: 10 });

      expect(this.tooltipView.$el.css('top')).toBe('10px');
    });

    it('should position the element on the left when right overflow occurs', function () {
      this.tooltipModel.set('position', 'top|right');
      this.tooltipModel.set('pos', { x: 90, y: 10 });

      expect(this.tooltipView.$el.css('left')).toBe('10px');
    });

    it('should position the element on the right when left overflow occurs', function () {
      this.tooltipModel.set('position', 'top|left');
      this.tooltipModel.set('pos', { x: 10, y: 10 });

      expect(this.tooltipView.$el.css('left')).toBe('10px');
    });

    it('should position the element on the left/right when horizontally centered and overflow occurs', function () {
      this.tooltipModel.set('position', 'top|center');
      this.tooltipModel.set('pos', { x: 10, y: 10 });

      expect(this.tooltipView.$el.css('left')).toBe('10px');

      this.tooltipModel.set('position', 'top|center');
      this.tooltipModel.set('pos', { x: 90, y: 10 });

      expect(this.tooltipView.$el.css('left')).toBe('10px');
    });
  });
});
