import { createStore } from 'vuex';
import esriRequest from '@arcgis/core/request';

export default createStore({
  state: {
    data: {
      // data retrieved from web services
      supportingLayers: '', //used to create the supportinglayer tree
      slReady: false,
    },
    config: {
      // config info
      supportingMapLayers: [
        {
          mapService:
            'https://services2.coastalresilience.org/arcgis/rest/services/Mexico/AquacultureSuitability/MapServer',
          skipLayers: [0, 2],
          title: 'Mexico Aquaculture Study',
          popupTemplate: [
            {
              title: 'Watershed Boundary',
              field: 'NAME',
              label: 'Watershed Name',
              id: '',
            },
            {
              title: 'Town Boundary',
              field: 'TOWN',
              label: 'Town Name',
              id: '',
            },
          ],
        },
      ],

      supportingLayersTitle: 'Supporting Layers',
      supportingLayersOnMap: true,
      supportingLayersInPanel: true,
      panelDisplayType: 'tabsHorizontal', //plain, tabsHorizontal, tabsVertical
    },
    // app state info -- supporting layers
    tree: { ticked: [], expanded: [], tickedObj: [] },
    setTicked: {},
    clearLayers: true,
    selectedLayerList: [],
    supportingVisibleLayerOpacity: {},
    firstLoad: false,
    //user info
    userProcess: {
      siteCreated: false,
      drawStatus: '',
      printStatus: '',
      species: 'none',
    },
    userSiteMap: {
      drawAcres: '',
      mapImageURI: '',
      customURL: '',
      siteURLCorners: '',
      siteCornersDecimalDegrees: '',
    },
    userResults: {
      rasterStatistics: '',
      suitabilityStatistics: false,
      zeros: '',
      warnings: '',
      avgSuitability: '',
      overallSuitability: '',
      species: '',
    },
  },
  mutations: {
    //data retrieved from web services
    updateSupportingLayers(state, obj) {
      state.data.supportingLayers = obj;
    },
    updateSLReady(state, bool) {
      state.data.slReady = bool;
    },
    //the following functions update the supporting layers tree object
    updateTreeState(state, obj) {
      if (obj.ticked) {
        state.tree.ticked = obj.ticked;
      }
      if (obj.expanded) {
        state.tree.expanded = obj.expanded;
      }
      if (obj.tickedObj) {
        state.tree.tickedObj = obj.tickedObj;
      }
    },
    updateSetTicked(state, obj) {
      //set obj setTicked ({tick: [], untick: []})
      state.setTicked = obj;
    },
    clearLayers(state) {
      //this just changes the value to provoke the watcher
      state.clearLayers = !state.clearLayers;
    },

    updateSupportingLayerVisibleOpacity(state, obj) {
      state.supportingVisibleLayerOpacity = obj;
    },

    //update user state
    updateUserProcess(state, obj) {
      state.userProcess = obj;
    },

    //the following functions update siteUserMap object
    updateMapImageURI(state, val) {
      state.userSiteMap.mapImageURI = val;
    },
    updateDrawAcres(state, val) {
      state.userSiteMap.drawAcres = val;
    },
    updateCustomURLCorners(state, obj) {
      state.userSiteMap.customURL =
        window.location.origin +
        '/palau/#/create?corners=' +
        encodeURIComponent(obj);
    },
    updateCornersDecimalDegrees(state, obj) {
      state.userSiteMap.siteCornersDecimalDegrees = obj;
    },
    updateCustomURLSpecies(state, species) {
      state.userSiteMap.customURL =
        state.userSiteMap.customURL + '&species=' + species;
    },
    makeSiteFromURL(state, corners) {
      state.userSiteMap.siteURLCorners = corners;
    },

    //the following functions update the userResultsObjects
    updateUserResultsSuitability(state, suitability) {
      state.userResults.zeros = suitability.zeros;
      state.userResults.warnings = suitability.warnings;
      state.userResults.species = suitability.species;
      state.userResults.suitabilityStatistics = true;
    },
    updateUserResultsRasterStats(state, rasterStats) {
      console.log(rasterStats);
      state.userResults.rasterStatistics = rasterStats;
    },
    updateUserResultsAvgSuitability(state, results) {
      state.userResults.avgSuitability = results;
    },
    updateUserResultsOverallSuitability(state, overall) {
      state.userResults.overallSuitability = overall;
    },
    clearUserResults(state) {
      state.userResults = {
        rasterStatistics: '',
        suitabilityStatistics: false,
        zeros: '',
        warnings: '',
        avgSuitability: '',
        overallSuitability: '',
        drawAcres: '',
        species: '',
      };
    },
  },

  actions: {
    requestSupportingLayers(context) {
      //for each map service object in supporting map layers
      let obj = [];
      let smnum = context.state.config.supportingMapLayers.length;
      let smcount = 0;
      context.state.config.supportingMapLayers.forEach((service, index) => {
        esriRequest(service.mapService + '/layers?f=pjson', {
          responseType: 'json',
        }).then(function(response) {
          let layerJson = response.data.layers;
          //push main header to the object
          obj.push({
            label: service.title,
            children: [],
            id: 999 + index,
            noTick: true,
            type: 'header',
          });
          let storeNodes = [];
          let type = '';
          layerJson.forEach((l) => {
            service.popupTemplate.forEach((popup) => {
              if (l.id == popup.id) {
                type = 'Featue Layer';
              } else type = 'Raster Layer';
            });
            // add layer to layer viewer if it's id is not present in the skip array
            if (service.skipLayers.indexOf(l.id) == -1) {
              // Group Layer with no parent
              if (l.type == 'Group Layer' && !l.parentLayer) {
                //push the object to the list as child of main header
                obj[index].children.push({
                  label: l.name,
                  children: [],
                  id: l.id + '_' + index,
                  noTick: true,
                  type: type,
                });
                //find the index of the object we just pushed, saves the reference to the location
                let parentIndex = obj[index].children.findIndex(
                  (obj) => obj.id == l.id + '_' + index
                );
                //save the parent node to the store with reference to its location in the object
                storeNodes.push({
                  parentIndex: parentIndex,
                  parentLoc: obj[index].children[parentIndex],
                  parentId: l.id + '_' + index,
                  description: l.description,
                });
              }
              // featurel layer with parent
              if (l.type !== 'Group Layer' && l.parentLayer) {
                //find the location of the parent in the node lookup
                let nodesIndex = storeNodes.findIndex(
                  (obj) => obj.parentId == l.parentLayer.id + '_' + index
                );
                //set the location of the parent
                let parentLoc = storeNodes[nodesIndex].parentLoc;
                //push the child to the parent
                parentLoc.children.push({
                  label: l.name,
                  children: [],
                  body: 'toggle',
                  id: l.id + '_' + index,
                  description: l.description,
                  type: type,
                });
              }
              // group layer with parent
              if (l.type == 'Group Layer' && l.parentLayer) {
                //find the location of the parent in the node lookup
                let nodesIndex = storeNodes.findIndex(
                  (obj) => obj.parentId == l.parentLayer.id + '_' + index
                );
                //set the location of the parent
                let parentLoc = storeNodes[nodesIndex].parentLoc;
                //push the new parent into the found parent as child
                parentLoc.children.push({
                  label: l.name,
                  children: [],
                  id: l.id + '_' + index,
                  noTick: true,
                  type: type,
                });
                //find the index of the child we just pushed
                let parentIndex = parentLoc.children.findIndex(
                  (obj) => obj.id == l.id + '_' + index
                );
                //save the reference to the location
                parentLoc = parentLoc.children[parentIndex];
                //save the parent node to the store with reference to its location in the object
                storeNodes.push({
                  parentIndex: parentIndex,
                  parentLoc: parentLoc,
                  parentId: l.id + '_' + index,
                  description: l.description,
                });
              }
              // feature layer with no parent length = number of nodes
              if (l.type !== 'Group Layer' && !l.parentLayer) {
                obj[index].children.push({
                  label: l.name,
                  children: [],
                  body: 'toggle',
                  id: l.id + '_' + index,
                  description: l.description,
                  type: type,
                });
              }
            }
          });
          smcount = smcount + 1;
          if (smcount == smnum) {
            context.commit('updateSupportingLayers', obj);
            context.commit('updateSLReady', true);
          }
        });
      });
    },
  },

  modules: {},
});
