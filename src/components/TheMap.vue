<template>
  <div id="map">
    <div id="supportingLayers" v-if="$store.state.config.supportingLayersOnMap">
      <SupportingLayers displayClass="supportingLayersMap" />
    </div>

    <div id="toolbarDiv" class="">
      <button
        id="distance"
        class="esri-widget--button esri-interactive esri-icon-measure-line esriCustomButton"
        title="Distance Measurement Tool"
        @click="activateLineMeasurement()"
      ></button>
      <button
        id="area"
        class="esri-widget--button esri-interactive esri-icon-measure-area esriCustomButton"
        title="Area Measurement Tool"
        @click="activateAreaMeasurement()"
      ></button>
      <button
        id="clear"
        class="esri-widget--button esri-interactive esri-icon-trash esriCustomButton"
        title="Clear Measurements"
        @click="clearMeasurements()"
      ></button>
    </div>
  </div>
</template>

<script>
import SupportingLayers from './SupportingLayers.vue';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import MapImageLayer from '@arcgis/core/layers/MapImageLayer';
import Legend from '@arcgis/core/widgets/Legend';
import Measurement from '@arcgis/core/widgets/Measurement';
import Expand from '@arcgis/core/widgets/Expand';
import PortalSource from '@arcgis/core/widgets/BasemapGallery/support/PortalBasemapsSource';
import BasemapGallery from '@arcgis/core/widgets/BasemapGallery';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import Draw from '@arcgis/core/views/draw/Draw';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils';
//import * as projection from "@arcgis/core/geometry/projection"

import ScaleBar from '@arcgis/core/widgets/ScaleBar';

//global in order to have access to the maplayer
let esri = {
  modelLayer: '',
  supportingMapLayer: '',
  legend: '',
  map: '',
  measurement: '',
  lgExpand: '',
  mapView: '',
  draw: '',
  rasterStatsLayer: '',
  zeroScoresClamLayer: '',
  onshore: '',
  offshore: '',
  userAreaGraphic: '',
};

export default {
  name: 'TheMap',
  components: {
    SupportingLayers,
  },
  data() {
    return {
      active: true,
      selectedCursor: 'pointer',
    };
  },
  computed: {
    supportingMapVisibleLayers() {
      //returns list of all ticked objects [{mapService: index in config, id: layerid, type: type}, ...]
      return this.$store.state.tree.tickedObj;
    },
    supportingVisibleLayerOpacity() {
      //returns object {value: OpacVal, id: Layerid}
      return this.$store.state.supportingVisibleLayerOpacity;
    },
    printStatus() {
      return this.$store.state.userProcess.printStatus;
    },
    drawStatus() {
      return this.$store.state.userProcess.drawStatus;
    },
    siteURLCorners() {
      return this.$store.state.userSiteMap.siteURLCorners;
    },
  },
  watch: {
    supportingMapVisibleLayers() {
      this.updateSupportingVisibility();
    },
    supportingVisibleLayerOpacity() {
      this.updateSupportingOpacity();
    },
    printStatus() {
      if (this.printStatus == 'printing') {
        this.getMapScreenshot();
      }
    },
    drawStatus() {
      this.drawExtent();
    },
    siteURLCorners() {
      this.createSiteFromCorners();
    },
  },

  mounted() {
    //select a basemap
    esri.map = new Map({
      basemap: 'hybrid',
    });

    //create the map view
    esri.mapView = new MapView({
      map: esri.map,
      //center: [-70.99501567725498, 42.310350073610834],
      //center: [-76.62437061849212,9.069409582028836],
      //center: [134.5333012629267, 7.670899903887507],
      center: [-111.59780381851137, 27.589131092775823],

      zoom: 6,
      container: this.$el,
    });

    //add supporting map layers listed in config
    this.$store.state.config.supportingMapLayers.forEach((service) => {
      let l = new MapImageLayer({
        url: service.mapService,
      });
      esri.map.add(l);
      l.when(function() {
        //create sublayer list
        let sublayerList = [];
        let layer = esri.map.layers.items.find((layer) => {
          return layer.type == 'map-image' && layer.url == service.mapService;
        });
        layer.allSublayers.items.forEach((sublayer) => {
          sublayerList.push({ id: sublayer.id, visible: false, opacity: 0.5 });
        });
        l.sublayers = sublayerList;
      });
    });

    //create any pre-loaded feature layers?
    //TODO: add this to config not needed?

    esri.offshore = new FeatureLayer({
      url: this.$store.state.config.supportingMapLayers[0].mapService + '/' + 2,
      visible: false,
    });
    esri.map.add(esri.offshore);

    //esri.finfishLayer = new FeatureLayer({
    //  url: this.$store.state.config.supportingMapLayers[0].mapService + '/' + 2,
    //  visible: false,
    //});
    //esri.map.add(esri.finfishLayer);

    esri.rasterStatsLayer = new FeatureLayer({
      url: this.$store.state.config.supportingMapLayers[0].mapService + '/' + 0,
      visible: false,
    });
    esri.map.add(esri.rasterStatsLayer);

    //add scalebar widget
    let scaleBar = new ScaleBar({
      view: esri.mapView,
      unit: 'dual',
    });
    esri.mapView.ui.add(scaleBar, {
      position: 'bottom-left',
    });
    //add supporting layers widget to map if true
    if (this.$store.state.config.supportingLayersOnMap) {
      let supportingLayersExpand = new Expand({
        expandIconClass: 'esri-icon-layer-list',
        expandTooltip: 'Expand LayerList',
        view: esri.mapView,
        content: document.getElementById('supportingLayers'),
      });
      esri.mapView.ui.add(supportingLayersExpand, 'top-right');
    }

    //create draw tool
    esri.draw = new Draw({
      view: esri.mapView,
    });

    //add measure tools
    esri.measurement = new Measurement({
      view: esri.mapView,
    });
    esri.mapView.ui.add(esri.measurement, 'top-left');

    // create legend widget
    esri.legend = new Legend({
      view: esri.mapView,
    });

    // create expand widget to hide and show legend
    esri.lgExpand = new Expand({
      view: esri.mapView,
      content: esri.legend,
    });

    // add expand to map
    esri.mapView.ui.add(esri.lgExpand, 'bottom-right');
    // show expanded legend on desktop, collapse on mobile
    this.$q.screen.lt.sm || this.$q.screen.lt.md
      ? true
      : esri.lgExpand.expand();

    //watch size of map view and adjust legend to close if map gets too small
    esri.mapView.on('resize', function(event) {
      if (event.width < 546) {
        esri.lgExpand.collapse();
      }
      if (event.width > 546) {
        esri.lgExpand.expand();
      }
    });

    // basemaps
    const allowedBasemapTitles = ['Topographic', 'Imagery Hybrid', 'Streets'];
    // filtering portal basemaps
    const source = new PortalSource({
      filterFunction: (basemap) =>
        allowedBasemapTitles.indexOf(basemap.portalItem.title) > -1,
    });
    // basemap gallery widget
    var basemapGallery = new BasemapGallery({
      view: esri.mapView,
      source: source,
      container: document.createElement('div'),
    });
    // expand to hold basemap gallery
    var bgExpand = new Expand({
      view: esri.mapView,
      content: basemapGallery,
    });
    // place expand in view
    esri.mapView.ui.add(bgExpand, {
      position: 'top-right',
    });
    // close expand when basemap is changed
    esri.map.watch('basemap.title', function() {
      bgExpand.collapse();
    });

    // move zoom controls to top right
    esri.mapView.ui.move(['zoom'], 'top-right');
  },

  methods: {
    //Supporting Layers functions
    updateSupportingVisibility() {
      // turn off all raster layer visibility
      esri.map.layers.items.forEach((fl) => {
        if (fl.type === 'feature') {
          fl.visible = false;
        }
        if (fl.type == 'map-image') {
          fl.allSublayers.items.forEach((sl) => {
            if (sl.layer.type == 'map-image') {
              sl.visible = false;
            }
          });
        }
      });
      // turn on all sublayers that are checked in the TOC
      this.supportingMapVisibleLayers.forEach((l) => {
        //if type is raster layer - find the sublayer and make visible

        if (l.type === 'Raster Layer') {
          let layer = esri.map.layers.items.find((layer) => {
            return (
              layer.type == 'map-image' &&
              layer.url ==
                this.$store.state.config.supportingMapLayers[l.mapServiceIndex]
                  .mapService
            );
          });
          let sublayer = layer.allSublayers.items.find((sublayer) => {
            return sublayer.id == l.id;
          });
          sublayer.visible = true;
        }
        if (l.type === 'Feature Layer') {
          //check to see if feature layer exists.  if it does make it visible, if not create it.
          let i = esri.map.layers.items.findIndex(
            (layer) =>
              layer.layerId == l.id &&
              layer.url ==
                this.$store.state.config.supportingMapLayers[l.mapServiceIndex]
                  .mapService
          );

          if (i >= 0) {
            esri.map.layers.items[i].visible = true;
          } else {
            //check to see if fl has a popup template defined
            let layerList = this.$store.state.config.supportingMapLayers[
              l.mapServiceIndex
            ].popupTemplate;
            let i = layerList.findIndex((layer) => layer.id == l.id);
            if (i >= 0) {
              let template = {
                title: layerList[i].title,
                content: [
                  {
                    type: 'text',
                    text:
                      layerList[i].label +
                      ':  <b>{ ' +
                      layerList[i].field +
                      '}</b>',
                  },
                ],
              };
              //get index of map server
              esri.map.add(
                new FeatureLayer({
                  url:
                    this.$store.state.config.supportingMapLayers[
                      l.mapServiceIndex
                    ].mapService +
                    '/' +
                    l.id,
                  popupTemplate: template,
                })
              );
            }
            //if no popup defined create the feature layer without popup
            else {
              esri.map.add(
                new FeatureLayer({
                  url:
                    this.$store.state.config.supportingMapLayers[
                      l.mapServiceIndex
                    ].mapService +
                    '/' +
                    l.id,
                })
              );
            }
          }
        }
      });
    },

    updateSupportingOpacity() {
      let l = this.supportingVisibleLayerOpacity;
      // if it is a raster find the sublayer and set the opacity
      if (l.type === 'Raster Layer') {
        let layer = esri.map.layers.items.find((layer) => {
          return (
            layer.type == 'map-image' &&
            layer.url ==
              this.$store.state.config.supportingMapLayers[l.mapServiceIndex]
                .mapService
          );
        });
        let sublayer = layer.allSublayers.items.find((sublayer) => {
          return sublayer.id == l.id;
        });
        sublayer.opacity = l.value;
      }
      //if it is a feature layers, create it if it does not exist but make visibility false.  then set its opacity so that
      //when the user turns it on, it will find the layer and match the ui opacity dial.
      if (l.type == 'Feature Layer') {
        let i = esri.map.layers.items.findIndex(
          (layer) =>
            layer.layerId == l.id &&
            layer.url ==
              this.$store.state.config.supportingMapLayers[l.mapServiceIndex]
                .mapService
        );

        if (i >= 0) {
          esri.map.layers.items[i].opacity = l.value;
        } else {
          //check to see if fl has a popup template defined
          let layerList = this.$store.state.config.supportingMapLayers[
            l.mapServiceIndex
          ].popupTemplate;
          let i = layerList.findIndex((layer) => layer.id == l.id);
          if (i >= 0) {
            let template = {
              title: layerList[i].title,
              content: [
                {
                  type: 'text',
                  text:
                    layerList[i].label +
                    ':  <b>{ ' +
                    layerList[i].field +
                    '}</b>',
                },
              ],
            };
            //get index of map server
            esri.map.add(
              new FeatureLayer({
                url:
                  this.$store.state.config.supportingMapLayers[
                    l.mapServiceIndex
                  ].mapService +
                  '/' +
                  l.id,
                popupTemplate: template,
                visible: false,
                opacity: l.value,
              })
            );
          }
          //if no popup defined create the feature layer without popup
          else {
            esri.map.add(
              new FeatureLayer({
                url:
                  this.$store.state.config.supportingMapLayers[
                    l.mapServiceIndex
                  ].mapService +
                  '/' +
                  l.id,
                visible: false,
                opacity: l.value,
              })
            );
          }
        }
      }
    },

    //print functions
    getMapScreenshot() {
      // Create a square thumbnail from the current view
      if (this.printStatus == 'printing') {
        /*   let options = {
          area: {
            width: 600,
            height: 1300
          }
        };*/

        esri.mapView.takeScreenshot().then((screenshot) => {
          let image = screenshot.dataUrl;
          this.$store.commit('updateMapImageURI', image);
          setTimeout(function() {
            // wait until all resources loaded
            window.print();
          }, 250);
          let userProcess = this.$store.state.userProcess;
          userProcess.printStatus = 'done';
          this.$store.commit('updateUserProcess', userProcess);
        });
      }
    },

    //Draw functions
    drawExtent() {
      if (this.drawStatus == 'reset') {
        esri.mapView.graphics.removeAll();
        this.selectedCursor = 'pointer';
      }
      if (this.drawStatus == 'drawing') {
        this.selectedCursor = 'crosshair';
        // creates and returns an instance of PolyLineDrawAction
        const action = esri.draw.create('rectangle');
        // focus the view to activate keyboard shortcuts for sketching
        esri.mapView.focus();
        // listen polylineDrawAction events to give immediate visual feedback
        // to users as the line is being drawn on the view.
        action.on(['draw-complete', 'cursor-update', 'vertex-add'], (event) => {
          let vertices = event.vertices;
          if (vertices.length === 2) {
            // Get start and end coordinates
            let [startX, startY] = vertices[0];
            let [endX, endY] = vertices[1];

            // Create bounding box based on coordinates
            let corners = [
              [startX, startY],
              [endX, startY],
              [endX, endY],
              [startX, endY],
              [startX, startY], // complete the polygon so it's valid
            ];

            let polygon = new Polygon({
              rings: corners,
              spatialReference: esri.mapView.spatialReference,
            });

            let graphic = this.createGraphic(polygon);
            let area = geometryEngine.geodesicArea(polygon, 'square-meters');
            let roundedArea = this.formatNumber(area);
            this.labelAreas(polygon, roundedArea);
            this.$store.commit('updateDrawAcres', roundedArea);

            //on draw complete only
            if (event.type == 'draw-complete') {
              let opts = {
                duration: 2000, // Duration of animation will be 5 seconds
              };
              esri.mapView.goTo(
                {
                  target: graphic,
                },
                opts
              );

              let ddObj = this.convertWMToDD(polygon, corners);
              this.$store.commit('updateCornersDecimalDegrees', ddObj);
              this.$store.commit('updateCustomURLCorners', corners);
              let userProcess = this.$store.state.userProcess;
              userProcess.drawStatus = 'done-drawing';
              this.$store.commit('updateUserProcess', userProcess);
              this.getSuitabilityData(polygon);
            }
          } else {
            //if the user clicks once reset the draw function
            if (event.type == 'draw-complete') {
              this.drawExtent();
            }
          }
        });
      }
    },
    formatNumber(num) {
      let format = parseFloat(num).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      return format;
    },

    convertWMToDD(polygon, corners) {
      //converts coordinates to Decimal Degrees
      let centroid = webMercatorUtils.xyToLngLat(
        polygon.centroid.x,
        polygon.centroid.y
      );
      let upperLeft = webMercatorUtils.xyToLngLat(corners[0][0], corners[0][1]);
      let upperRight = webMercatorUtils.xyToLngLat(
        corners[1][0],
        corners[1][1]
      );
      let lowerRight = webMercatorUtils.xyToLngLat(
        corners[2][0],
        corners[2][1]
      );
      let lowerLeft = webMercatorUtils.xyToLngLat(corners[3][0], corners[3][1]);
      //round to 6 digits ~ 4inch accuracy
      let ddObj = {
        upperLeft:
          Math.floor(upperLeft[0] * 10000) / 10000 +
          ', ' +
          Math.floor(upperLeft[1] * 10000) / 10000,
        upperRight:
          Math.floor(upperRight[0] * 10000) / 10000 +
          ', ' +
          Math.floor(upperRight[1] * 10000) / 10000,
        lowerRight:
          Math.floor(lowerRight[0] * 10000) / 10000 +
          ', ' +
          Math.floor(lowerRight[1] * 10000) / 10000,
        lowerLeft:
          Math.floor(lowerLeft[0] * 10000) / 10000 +
          ', ' +
          Math.floor(lowerLeft[1] * 10000) / 10000,
        centroid:
          Math.floor(centroid[0] * 10000) / 10000 +
          ', ' +
          Math.floor(centroid[1] * 10000) / 10000,
      };
      return ddObj;
    },
    //Label polyon with its area
    labelAreas(geom, area) {
      let graphic = new Graphic({
        geometry: geom.centroid,
        symbol: {
          type: 'text',
          color: 'white',
          haloColor: '#54a2a4',
          haloSize: '1.5px',
          text: area + ' sq meters',
          xoffset: 3,
          yoffset: 3,
          font: {
            // autocast as Font
            size: 11,
            family: 'sans-serif',
          },
        },
      });
      esri.mapView.graphics.add(graphic);
    },
    //create the draw graphic
    createGraphic(polygon) {
      //remove existing graphic
      esri.mapView.graphics.removeAll();

      let graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: 'simple-fill', // autocasts as new SimpleFillSymbol()
          color: [255, 255, 255],
          style: 'none',
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: [255, 255, 255],
            width: 4,
          },
        },
      });

      esri.mapView.graphics.add(graphic);

      this.selectedCursor = 'pointer';
      let area = geometryEngine.geodesicArea(polygon, 'acres');
      let roundedArea = Math.round((area + Number.EPSILON) * 100) / 100;
      this.$store.commit('updateDrawAcres', roundedArea);

      return graphic;
    },

    //getRaster statistics
    getRasterStatistics(polygon) {
      let avgDepthDef = {
        onStatisticField: 'Mexico_Bat',
        outStatisticFieldName: 'avg_depth',
        statisticType: 'avg',
      };
      let minDepthDef = {
        onStatisticField: 'Mexico_Bat',
        outStatisticFieldName: 'min_depth',
        statisticType: 'min',
      };
      let maxDepthDef = {
        onStatisticField: 'Mexico_Bat',
        outStatisticFieldName: 'max_depth',
        statisticType: 'max',
      };
      let avgHSIGDef = {
        onStatisticField: 'Mexico_Wav',
        outStatisticFieldName: 'avg_hsig',
        statisticType: 'avg',
      };
      let minHSIGDef = {
        onStatisticField: 'Mexico_Wav',
        outStatisticFieldName: 'min_hsig',
        statisticType: 'min',
      };
      let maxHSIGDef = {
        onStatisticField: 'Mexico_Wav',
        outStatisticFieldName: 'max_hsig',
        statisticType: 'max',
      };
      //TODO: GET AVG RASTER SCORES HERE
      let stats = [
        [avgDepthDef, minDepthDef, maxDepthDef],
        [avgHSIGDef, minHSIGDef, maxHSIGDef],
      ];
      let rasterStats = [];
      for (var i = 0; i < stats.length; i++) {
        let query = esri.rasterStatsLayer.createQuery();

        query.outStatistics = stats[i];
        query.geometry = polygon;
        query.spatialRelationship = 'intersects'; // this is the default

        esri.rasterStatsLayer.queryFeatures(query).then((response) => {
          console.log(response);
          if (response.features.length == 0) {
            rasterStats.push('out of bounds');
          } else {
            rasterStats.push(response.features[0].attributes);
          }

          if (rasterStats.length == 2) {
            let finalStats = Object.assign({}, rasterStats[0], rasterStats[1]);
            console.log(finalStats);
            this.$store.commit('updateUserResultsRasterStats', finalStats);
          }
        });
      }
      //group all stats into one object
    },

    getAvgSuitability(polygon) {
      let species = this.$store.state.userProcess.species;
      let layer = species == 'onshore' ? esri.onshore : esri.offshore;
      let query = layer.createQuery();

      let avgSuitabilityDefinition = {
        onStatisticField: 'final_scor',
        outStatisticFieldName: 'avg_score',
        statisticType: 'avg',
      };

      query.outStatistics = [avgSuitabilityDefinition];
      query.geometry = polygon;
      query.spatialRelationship = 'intersects'; // this is the default
      query.returnGeometry = false;

      layer.queryFeatures(query).then((response) => {
        let avgSuitability = '';
        if (response.features.length == 0) {
          avgSuitability = 'N/A';
        } else {
          let roundedScore =
            Math.round(
              (response.features[0].attributes.avg_score + Number.EPSILON) *
                1000000
            ) / 1000000;
          avgSuitability = response.features.length == 0 ? 'N/A' : roundedScore;
        }
        this.$store.commit('updateUserResultsAvgSuitability', avgSuitability);
      });
    },

    getSuitabilityData(polygon) {
      let species = this.$store.state.userProcess.species;
      let layer = species == 'onshore' ? esri.onshore : esri.offshore;
      let query = layer.createQuery();

      query.geometry = polygon;
      query.spatialRelationship = 'intersects'; // this is the default
      query.returnGeometry = false;
      query.outFields = ['*'];

      layer.queryFeatures(query).then((response) => {
        console.log(response);
        let zeros = [];
        let warnings = [];
        //if there are warnings or errors create an array of unique field names and send results to the store
        if (response.features.length > 0) {
          response.features.forEach((feature) => {
            for (const property in feature.attributes) {
              if (!zeros.includes(property)) {
                //errors are any values = to 0
                if (feature.attributes[property] == 0) {
                  zeros.push(property);
                }
              }
              if (!warnings.includes(property)) {
                //errors are any values = to 0
                if (
                  feature.attributes[property] > 0 &&
                  feature.attributes[property] < 1
                ) {
                  warnings.push(property);
                }
              }
            }
          });
        }
        let suitability = {
          zeros: zeros,
          warnings: warnings,
          species: species,
        };
        console.log(suitability);
        this.$store.commit('updateUserResultsSuitability', suitability);
        this.getAvgSuitability(polygon);
        this.getRasterStatistics(polygon);
        let color = zeros.length == 0 ? [0, 255, 0] : [255, 0, 0];
        this.createColorCodedGraphic(polygon, color);
      });
    },

    createColorCodedGraphic(polygon, color) {
      let graphic = new Graphic({
        geometry: polygon,
        symbol: {
          type: 'simple-fill', // autocasts as new SimpleFillSymbol()
          color: [255, 255, 255],
          style: 'none',
          outline: {
            // autocasts as new SimpleLineSymbol()
            color: color,
            width: 4,
          },
        },
      });

      esri.mapView.graphics.add(graphic);
    },

    createSiteFromCorners() {
      esri.mapView.when(() => {
        let polygon = new Polygon({
          rings: this.siteURLCorners,
          spatialReference: esri.mapView.spatialReference,
        });
        let graphic = this.createGraphic(polygon);
        this.getSuitabilityData(polygon);
        let ddObj = this.convertWMToDD(polygon, this.siteURLCorners);
        this.$store.commit('updateCornersDecimalDegrees', ddObj);
        let opts = {
          duration: 5000, // Duration of animation will be 5 seconds
        };
        esri.mapView.goTo(
          {
            target: graphic,
          },
          opts
        );
      });
    },

    // Measure functions
    activateAreaMeasurement() {
      const distanceButton = document.getElementById('distance');
      const areaButton = document.getElementById('area');
      esri.measurement.activeTool = 'area';
      distanceButton.classList.remove('active');
      areaButton.classList.add('active');
    },

    activateLineMeasurement() {
      const distanceButton = document.getElementById('distance');
      const areaButton = document.getElementById('area');
      esri.measurement.activeTool = 'distance';
      distanceButton.classList.add('active');
      areaButton.classList.remove('active');
    },

    clearMeasurements() {
      const distanceButton = document.getElementById('distance');
      const areaButton = document.getElementById('area');
      distanceButton.classList.remove('active');
      areaButton.classList.remove('active');
      esri.measurement.clear();
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
@import 'https://js.arcgis.com/4.20/@arcgis/core/assets/esri/themes/light/main.css';

#map {
  flex: 1;
  min-height: calc(100vh - 49px);
  height: 100%;
  width: 100%;
  position: relative;
  border-bottom: #999 solid 1pt;
}

@media screen and (max-width: 700px) {
  #map {
    min-height: 20vh;
    height: 100%;
    width: 100%;
    position: relative;
    border-bottom: #999 solid 1pt;
  }
}

#toolbarDiv {
  position: absolute;
  left: 10px;
  top: 10px;
  display: flex;
  box-shadow: 0 1px 2px rgb(0 0 0 / 60%);
}

#printBoundary {
  position: absolute;
  left: 10px;
  top: 10px;
  display: flex;
  box-shadow: 0 5px 5px rgb(0 0 0 / 60%);
  width: 500px;
  height: 500px;
  border: 3px solid red;
}

esri-expand__content esri-expand__content--expanded div {
  background-color: white;
}
#toolbarDiv button {
  border: unset;
}
#area {
  border-right: solid 1px rgba(110, 110, 110, 0.3) !important;
  border-left: solid 1px rgba(110, 110, 110, 0.3) !important;
}

.esri-widget--button.active,
.esri-widget--button.active:hover,
.esri-widget--button.active:focus {
  cursor: default;
  background-color: lightgrey;
}
.esri-widget--button.active path,
.esri-widget--button.active:hover path,
.esri-widget--button.active:focus path {
  fill: #e4e4e4;
}

.esri-widget *:focus-visible,
.esri-widget *:focus {
  outline: none;
}
</style>
<style>
.esri-legend__service h3 {
  line-height: unset;
}
.esri-legend__layer-cell {
  padding-top: 0;
  padding-bottom: 0;
}
.esri-measurement {
  margin: 40px 0 0 -4px;
}
.esri-ui-corner .esri-component,
.esri-expand__content {
  box-shadow: 1px 1px 2px rgb(0 0 0 / 60%);
}
.esri-scale-bar__line {
  background-color: white !important;
}
</style>
