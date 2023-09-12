<template>
  <div>
    <q-list bordered class="q-mb-md">
      <div v-for="(item, index) in resultsData" :key="index">
        <q-expansion-item
          dense
          dense-toggle
          expand-separator
          header-class="text-primary"
          style="border-bottom: 1px solid #195f64"
          default-opened
        >
          <template v-slot:header>
            <q-item-section avatar>
              <q-icon
                :name="item.sectionIcon"
                color="primary"
                text-color="primary"
              />
            </q-item-section>
            <!--Section Name Expand -->
            <q-item-section>
              {{ item.sectionName }}
            </q-item-section>

            <q-item-section side> </q-item-section>
          </template>
          <q-separator color="primary" />
          <div
            v-for="(param, index) in resultsData[index].sectionData"
            :key="index"
          >
            <q-item>
              <!--Name section -->
              <q-item-section>
                <q-item-label>{{ param.name }}</q-item-label>
                <q-item-label caption>{{ param.description }}</q-item-label>
              </q-item-section>

              <!--Description button section -->
              <q-item-section side center class="q-pl-none">
                <q-btn
                  size="12px"
                  flat
                  round
                  :color="
                    selectedList.indexOf(param.name) < 0 ? 'grey-5' : 'primary'
                  "
                  icon="layers"
                >
                  <q-menu
                    anchor="bottom left"
                    self="top right"
                    persistent
                    @hide="hideLayers(param.layers, param.name)"
                    @show="showBanner(param.layers, param.name)"
                    style="width:30%"
                  >
                    <q-banner dark class="bg-primary">
                      <p class="text-subtitle2 text-white q-mb-none">
                        Associated Layers
                      </p>
                      <q-separator color="grey-2" />
                      <br />
                      <p class="text-caption text-white q-ma-none">
                        {{ param.name }}
                      </p>
                      <div v-for="(layer, index) in param.layers" :key="index">
                        <q-checkbox
                          dark
                          v-model="viewLayers"
                          @update:model-value="showLayers(val, param.layers)"
                          :val="layer.id"
                          size="xs"
                          :label="layer.name"
                        />
                      </div>
                      <q-btn
                        class="float-right"
                        label="OK"
                        color="white"
                        flat
                        v-close-popup
                      />
                    </q-banner>
                  </q-menu>
                </q-btn>
              </q-item-section>
            </q-item>
            <q-separator inset />
          </div>
        </q-expansion-item>
      </div>
    </q-list>
  </div>
</template>

<script>
export default {
  name: 'SiteParametersSuitability',
  components: {},
  data() {
    return {
      viewLayers: [],
      selectedList: [],
    };
  },

  methods: {
    //these 3 functions show/ hide the associated layers
    showBanner(layers, name) {
      let layerIds = [];
      layers.forEach((layer) => {
        layerIds.push(layer.id);
      });
      this.viewLayers = layerIds;
      this.$store.commit('updateSetTicked', { tick: layerIds, untick: [] });
      this.selectedList.push(name);
    },

    showLayers(val, layers) {
      let layerIds = [];
      layers.forEach((layer) => {
        if (!this.viewLayers.includes(layer.id)) {
          layerIds.push(layer.id);
        }
      });
      this.$store.commit('updateSetTicked', this.viewLayers);
    },

    hideLayers(layers, name) {
      let layerIds = [];
      layers.forEach((layer) => {
        layerIds.push(layer.id);
      });
      this.$store.commit('updateSetTicked', { tick: [], untick: layerIds });
      this.viewLayers = [];
      if (this.selectedList.indexOf(name) > -1) {
        this.selectedList.splice(this.selectedList.indexOf(name), 1);
      }
    },

    /*
    calcErrorReport(){
      let report = {totalWarnings:0, totalErrors:0, totalSuccess:0, overallSuitability: '', sectionSummary:[]}
      let reportWarnings = 0
      let reportErrors = 0
      let reportSuccess = 0
      this.resultsData.forEach((section)=>{
        let sectionWarnings = 0
        let sectionErrors = 0
        let sectionSuccess = 0
        let overall = ''
        section.sectionData.forEach((param)=>{
          if( param.//meetsRule.icon == 'check' ){
            reportSuccess = reportSuccess + 1
            sectionSuccess = sectionSuccess + 1
          }
          if( param.//meetsRule.icon == 'warning_amber' ){
            reportWarnings = reportWarnings + 1
            sectionWarnings = sectionWarnings + 1
          }
          if( param.//meetsRule.icon == 'close' ){
            reportErrors = reportErrors + 1
            sectionErrors = sectionErrors + 1
          }
        })
        if (sectionErrors>0){
          overall = 'close'
        }
        if (sectionErrors == 0 && sectionWarnings > 0){
          overall = 'warning_amber'
        }
        if (sectionErrors == 0 && sectionWarnings == 0){
          overall = "check"
        }
        let sectionOb = {
          sectionName: section.sectionName,
          sectionIcon: section.sectionIcon,
          sectionSummary : {warnings: sectionWarnings, errors: sectionErrors, successes: sectionSuccess},
          sectionOverall: overall
        }
        report.sectionSummary.push(sectionOb)
      })
        report.totalWarnings = reportWarnings
        report.totalErrors = reportErrors
        report.totalSuccess = reportSuccess 

        if (reportErrors > 0){
          report.overallSuitability = 'Poorly Suitable'
        }
        if (reportErrors == 0 && reportWarnings >0){
          report.overallSuitability = 'Further Site Review Needed'
        }
        if(reportErrors == 0 && reportWarnings == 0){
          report.overallSuitability = 'Suitable'
        }
        this.$store.commit('updateUserResults', {overallSuitability: report.overallSuitability })
        return report

    },

    // not currently in use
    calcDepthScore(val){
      let species = this.$store.state.userProcess.species
      let calcVal = val * -1 

      let depth={}

      if (species == "clam"){
        //needs to stay less than 6 to be suitable
        depth.val = (calcVal >= 0) ? 'Suitable' : ''
        depth.val = (calcVal > 1.5) ? 'Moderately Highly Suitable' : depth.val
        depth.val = (calcVal > 3) ? 'Moderately Suitable' : depth.val
        depth.val = (calcVal > 6) ? 'Poorly Suitable' : depth.val
        
        depth = (depth.val !== 'Poorly Suitable' ) ? {val: depth.val, icon: 'check', color: 'green'} : {val:depth.val, icon: 'close', color: 'red'}
      }
       if (species == "finfish"){
         //needs to stay between 10-30 to be suitable 0-6 , 6-10, 10-30 suitable ..> 30
        depth.val = (calcVal >=10 && calcVal <=30) ? 'Suitable' : ''
        depth.val = (calcVal > 30) ? 'Moderately Suitable' : depth.val
        depth.val = (calcVal < 10) ? 'Marginally Unsuitable' : depth.val
        depth.val = (calcVal < 6) ? 'Poorly Suitable' : depth.val
        
        depth  = (depth.val !== 'Poorly Suitable' ) ? {val: depth.val, icon: 'check', color: 'green'} : {val:depth.val, icon: 'error', color: 'red'}
      
      }

      return depth
    },
    
    calcZeros(fieldNames){
      //get zeros list
      let zeros = this.$store.state.userResults.zeros
      let warnings = this.$store.state.userResults.warnings 
      //["Sewer_Outf", "Major_Sedi", "MCRM_Palau", "Major_Nav_", "Navigation", "Port_Buffe"]
      let suitable = {val: "Suitable", icon: 'check', color: 'green'}
        fieldNames.forEach((field)=>{
          //look for warnings
          if (warnings.includes(field)){
              suitable = {val: "Further Evaluation Needed", icon: 'warning_amber', color: 'warning'}
          }
          if(zeros.includes(field)){
            suitable = {val: "Poorly Suitable", icon: 'close', color: 'red'}
          }
        })
      return suitable
    },*/
  },
  props: ['species'],
  computed: {
    /*  report(){
      let report = this.calcErrorReport()
      return report
    },*/
    resultsData() {
      return this.species == 'clam' ? this.clam : this.finfish;
    },

    //this is the data object that holds the sections and info
    finfish() {
      return [
        {
          sectionName: 'Environmental',
          sectionIcon: 'language',
          sectionData: [
            {
              name: 'Depth',
              caption: 'f (negative values)',
              value: '',
              ////meetsRule:  this.calcZeros(["Bathy_New_Fill_w"]),
              rule:
                'Depths between 10 - 30 m are suitable (score of 1.00), between 0 - 6 m are poorly suitable and should be excluded from further consideration (score of 0.00), between 6 - 10 m are marginally unsuitable (score of 0.25), and greater than 30 m are moderately suitable (score of 0.50).',
              description:
                'Aquaculture operations within shallow waters can lead to deposition of fish waste and excess feed on the seafloor, which can cause nutrient pollution and impact seafloor communities. Operations in too deep of waters can be difficult to monitor for seafloor or mooring impacts, and can be costly to operate.',
              layers: [{ name: 'Bathymetry - feet', id: '6_0' }],
            },
            {
              name: 'Hydrodynamics (Water Current)',
              caption: 'f/s',
              value: '',
              ////meetsRule: this.calcZeros(['Current_Mean_w']),
              rule:
                'Current speeds (based on average) between 0.05 and 0.15 m/s are suitable for finfish aquaculture operations (score of 1.00), between 0.00 - 0.05 m/s are poorly suitable and should be excluded (score of 0.00), between 0.15 - 0.25 m/s are moderately highly suitable (score of 0.75), between 0.25 - 0.35 m/s are moderately suitable (score of 0.50), and above 0.35 m/s are marginally unsuitable (score of 0.25).',
              description:
                'Aquaculture operations within low current flow waters can lead to build-up of fish and feed waste on the seafloor beneath farm infrastructure, which can cause nutrient pollution and seafloor habitat impacts. Operations in waters with too high of current flow can be more challenging for aquaculture gear and cultivated species.',
              layers: [{ name: 'Mean Water Current Speed', id: '10_0' }],
            },
            {
              name: 'Hydrodynamics (Significant Wave height and period)',
              caption: 'Wave (f), Period (seconds)',
              value: '',
              ////meetsRule: this.calcZeros(['Hsig_annual_p95_w']),
              rule:
                'Areas with significant wave heights above 2 m are poorly suitable (score 0.00). Areas with short wave periods are poorly suitable (score 0.00).',
              description:
                'When waves are too high and have a short period it makes it increasingly difficult to visit a site to feed and maintain gear. In severe wave conditions gear can become dislogged or break apart.',
              layers: [{ name: 'Significant Wave Height (95%)', id: '12_0' }],
            },
            {
              name:
                'Sea Surface Temperature (SST) and Degree Heating Weeks (DHW)',
              caption: 'degrees C',
              value: '',
              ////meetsRule:  this.calcZeros(["DHW_02_2020_w"]),
              rule:
                'SST and Degreee heating weeks (DHW). Temperatures above 30°C can cause mortality of finfish and clam aquaculture, these areas of warmer water are poorly suitable (score 0.00). Similarily areas with DHW > 4°C are not suitable.',
              description:
                'High temperatures can cause negative affects to aquaculture species and for giant clams can lead to bleaching, disease, and death.',
              layers: [
                {
                  name: 'Degree Heating Weeks - Cumulative Heat Stress',
                  id: '17_0',
                },
              ],
            },
            {
              name: 'Sea Surface Temperature (Climate Change)',
              caption: 'degrees C',
              value: '',
              //meetsRule: this.calcZeros(["SST_rcp85_2050_w"]),
              rule:
                'Temperatures above 30°C can cause mortality of finfish and clam aquaculture, these areas of warmer water are poorly suitable (score 0.00). Incorporating different scenarios for future changes to SST for 2030, 2050, 2100',
              description:
                'High temperatures can cause negative affects to aquaculture species and for giant clams can lead to bleaching, disease, and death.',
              layers: [
                { name: 'Sea Surface Temperature - RCP 8.5 2050', id: '19_0' },
              ],
            },
            {
              name: 'Oceanographic (Chlr a)',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Kd490_MODIS_10yr_mean_w"]),
              rule:
                'Diffuse Attentuation Coefficient at 490 nm (Kd490) is a good indicator of the turbidity (cloudiness of the water). Areas with high turbidity and Chlorophyll a concentation are poorly suitable (score 0.00). ',
              description:
                'Areas with high chlorophyll might not be suitbale for all species, this might be an indicator of excess land runoff.',
              layers: [
                { name: 'Chlorophyll a - Mean concentration', id: '21_0' },
              ],
            },
            {
              name: 'Oceanographic (Kd 490)',
              caption: 'Kd490 (no units), Chlr a (kg/m-3)',
              value: '',
              //meetsRule: this.calcZeros(["Kd490_MODIS_10yr_mean_w"]),
              rule:
                'Diffuse Attentuation Coefficient at 490 nm (Kd490) is a good indicator of the turbidity (cloudiness of the water). Areas with high turbidity and Chlorophyll a concentation are poorly suitable (score 0.00). ',
              description:
                'High turbidity areas have a lot of sediment and nutrients that can be harmful to both finfish and clam aquaculture.',
              layers: [{ name: 'kd490 - Mean', id: '22_0' }],
            },
            {
              name: 'Oceanographic Climate Change (Chlr a)',
              caption: 'kg/ m-3',
              value: '',
              //meetsRule:  this.calcZeros(["Chla_annual_rcp85_2050_w"]),
              rule: 'Examining future scenarios from 2030, 2050, 2100',
              description:
                'Areas with high chlorophyll might not be suitbale for all species, this might be an indicator of excess land runoff.',
              layers: [{ name: 'Chlorophyll a - RCP 8.5 2050', id: '24_0' }],
            },
            {
              name: 'Major Sediment Deposition Areas',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(['Sediment_Major_w']),
              rule:
                'Further review and site evaluation necessary if within areas of major sediment outfall (score of 0.50).',
              description:
                'Water quality may be insufficient for aquaculture operations within major sediment deposition areas.',
              layers: [{ name: 'Major Sediment Deposition Areas', id: '7_0' }],
            },
            {
              name: 'Shoreline',
              caption: '',
              value: '',
              //meetsRule:  this.calcZeros(["Shoreline_100m_w"]),
              rule:
                'Areas within 100 m of the shoreline are poorly suitable (score of 0.00), and further review necessary if within 200 m of shoreline (score of 0.50).',
              description:
                'Aquaculture operations within close proximity of the shoreline can cause damage to sensitive nearshore habitats (e.g., mangroves, seagrass beds).',
              layers: [{ name: 'Shoreline - 100 m Buffer', id: '8_0' }],
            },
          ],
        },
        {
          sectionName: 'Natural Resources',
          sectionIcon: 'spa',
          sectionData: [
            {
              name: 'Corals',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Allen_Coral_w", "Allen_Coral_200m_w"]),
              rule:
                'Areas associated with coral reefs are poorly suitable (score of 0.00), as determined by data derived from the Millenium Coral Reef Assessment. Further review necessary for areas within 200 m of coral reef.',
              description:
                'Avoid impacts of effluent (excess feed and fish waste) aquaculture operations on corals, including in cases where water currents could carry materials towards corals.',
              layers: [
                { name: 'Coral Reefs', id: '26_0' },
                { name: 'Coral Reefs - 200 m buffer', id: '27_0' },
              ],
            },
            {
              name: 'Seagrass Beds',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Seagrass_w","Seagrass_200m_w"]),
              rule:
                'Areas associated with seagrass beds are poorly suitable (score 0.00), further review necessary for areas within 200 m of seagrass beds (score 0.5).',
              description:
                'Avoid impacts of effluent (excess feed and fish waste) and shading from aquaculture operations on seagrass beds. For clam aquaculture these areas should be avoided due to shading and potential trampling of areas.',
              layers: [
                { name: 'Seagrass Beds', id: '28_0' },
                { name: 'Seagrass Beds - 200 m buffer', id: '29_0' },
              ],
            },
            {
              name: 'Dugong Feding Concentration Areas',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Dugong_feeding_concentration_w"]),
              rule: '',
              description:
                'Avoid impacts to these protected species and assocaited sensitive habitats.',
              layers: [{ name: 'Dugong Feeding Concentration', id: '30_0' }],
            },
            {
              name: 'Marine Protected Areas',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Palau_MPA_Urban_w"]),
              rule:
                'Areas associated with marine protected areas are poorly suitable (score of 0.00).',
              description:
                'Avoid natural resource management conflict with aquaculture operations.',
              layers: [{ name: 'Marine Protected Areas', id: '31_0' }],
            },
          ],
        },
        {
          sectionName: 'Social and Cultural',
          sectionIcon: 'people',
          sectionData: [
            {
              name: 'Dive sites',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MA_Update_DiveSites_100m_w"]),
              rule:
                'Areas within 100 m of dive and tourist sites are poorly suitable (score of 0.00)',
              description: 'Avoid user conflicts with dive and tourist sites.',
              layers: [{ name: 'Dive Sites - 100 m buffer', id: '33_0' }],
            },
            {
              name: 'Tourist sites',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MA_Update_TouristSites_100m_w"]),
              rule:
                'Areas within 100 m of dive and tourist sites are poorly suitable (score of 0.00)',
              description: 'Avoid user conflicts with dive and tourist sites.',
              layers: [{ name: 'Tourist Sites - 100 m buffer', id: '34_0' }],
            },
            {
              name: 'Historic sites',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MA_Update_HistoricalSite_10m_w"]),
              rule:
                'Areas within 10 m of historic sites are poorly suitable (score of 0.00).',
              description:
                'Avoid conflicts and potential impacts of aquaculture operations atop historic sites.',
              layers: [{ name: 'Historic sites - 100 m buffer', id: '35_0' }],
            },
            {
              name: 'Ranger Station',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Rangers_Near_Grid_w"]),
              rule:
                'Areas within 2.5 km of a ranger station are highly suitable (score of 1.00). Suitability decreases with distance, where greater than 10 km away are least suitable (score 0.2).',
              description:
                'Areas near to ranger patrol stations could be prefered for aquaculture siting from a business perspective as risk of theft or vandalism may be lower.',
              layers: [{ name: 'Distance to Ranger Stations', id: '36_0' }],
            },
          ],
        },
        {
          sectionName: 'Infrastructure',
          sectionIcon: 'houseboat',
          sectionData: [
            {
              name: 'Existing aquaculture farms',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Active_Clam_Farms_100m_w", "Aqua_Sites_2020_Finfi_500m_w"]),
              rule:
                'Areas within 500 m of existing finfish farms are poorly suitable, and 100 m for existing clam farms (score of 0.00).',
              description:
                'Minimize potential for biosecurity and disease transmission issues between existing and future aquaculture operations.',
              layers: [
                { name: 'Clam Aquaculture Sites - 100 m buffer', id: '39_0' },
                {
                  name: 'Finfish Aquaculture Sites - 500 m buffer',
                  id: '38_0',
                },
              ],
            },
            {
              name: 'Sewer outfall',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Major_Sewer_Outfall_1000m_w","Sewer_Outfall_500m_w"]),
              rule:
                'Areas within 1000 m of the Malakal wastewater treatment plant outfall and two sewer emergency outfall pump locations are poorly suitable (score of 0.00), further review for areas within 500 m of other wastewater pump station locations.',
              description:
                'Minimize potential for human waste contamination on aquaculture operations which could pose human and fish health risks.',
              layers: [
                { name: 'Major Sewer Outfall - 1000 m buffer', id: '40_0' },
                { name: 'Sewer Outfalls - 500 m buffer', id: '41_0' },
              ],
            },
            {
              name: 'Fiber optic cable',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["FiberOptic_North_100m_w", "FiberOptic_toPeleliu_200m_w"]),
              rule:
                'Areas within 100 m of the underwater fiber optic cable are poorly suitable, and 200 m for the southern area to Peleliu (score of 0.00).',
              description:
                'Avoid potential impacts of moorings or anchors associated with aquaculture operations damaging the fiber optic communications cable.',
              layers: [
                { name: 'Fiber Optic Cable North - 100 m buffer', id: '42_0' },
                {
                  name: 'Fiber Optic Cable to Peleliu - 200 m buffer',
                  id: '43_0',
                },
              ],
            },
          ],
        },
        {
          sectionName: 'Navigation and Shipping',
          sectionIcon: 'directions_boat',
          sectionData: [
            {
              name: 'Navigational Channels',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Major_Nav_Channels_New_100m_w", "Major_Nav_Channels_New_500m_w","Small_Nav_Channels_50m_w", "Small_Nav_Channels_100m_w"]),
              rule:
                'Areas within 100 m of larger vessel routes are poorly suitable (score of 0.00; further review if within 500 m, score of 0.50), 50 m for smaller vessel routes (score of 0.00; further review if within 100 m, score of 0.50).',
              description:
                'Avoid navigational hazards associated with physical infrastructure and activities on aquaculture operations.',
              layers: [
                {
                  name: 'Major Navigation Channels - 100 m buffer',
                  id: '45_0',
                },
                {
                  name: 'Major Navigation Channels - 500 m buffer',
                  id: '46_0',
                },
                { name: 'Small Navigation Channels - 50 m buffer', id: '47_0' },
                {
                  name: 'Small Navigation Channels - 100 m buffer',
                  id: '48_0',
                },
              ],
            },
            {
              name: 'Anchorage or Mooring Areas',
              caption: '',
              value: '',
              //meetsRule:  this.calcZeros(["Anchorage_Mooring_Areas_w"]),
              rule:
                'Areas associated with anchorage or mooring areas are poorly suitable (score of 0.00)',
              description:
                'Avoid conflict between vessels within anchorage/mooring areas and aquaculture operations, as well as potential human waste or sewage contamination.',
              layers: [{ name: 'Anchorage Mooring Areas', id: '49_0' }],
            },
            {
              name: 'Ports',
              caption: '',
              value: '',
              //meetsRule:  this.calcZeros(["Port_Buffer_2km_w"]),
              rule:
                'Area within 2 km of the Port of Koror is poorly suitable (score of 0.00).',
              description:
                'Avoid conflict with large vessels and port-related activity, including military and other commercial uses of port infrastructure.',
              layers: [{ name: 'Major Port - 2 km buffer', id: '50_0' }],
            },
            {
              name: 'Piers, docks [Class B Waters]',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Class_B_Waters_w"]),
              rule:
                'Further review necessary if within areas associated with existing Class B waters (score of 0.50).',
              description:
                'Avoid conflict with existing developed areas, including potential for navigational hazards associated with aquaculture operations near docks',
              layers: [{ name: 'Class B Waters', id: '51_0' }],
            },
            {
              name: 'Docks 10 km [Cost Analysis]',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["docks_10km_w"]),
              rule: 'Area within 10 km of docks is more suitable (score 1.00)',
              description:
                'If farms are established within these areas there is the necessary infrastructure to easily access farm sites and to unload harvested product.',
              layers: [{ name: 'Distance from Docks', id: '53_0' }],
            },
          ],
        },
      ];
    },
    clam() {
      return [
        {
          sectionName: 'Environmental',
          sectionIcon: 'language',
          sectionData: [
            {
              name: 'Depth',
              caption: 'm (negative values)',
              value: '',
              //meetsRule: this.calcZeros(["Bathy_New_Fill_w"]),
              rule:
                'Depths less than or equal to 1.5 m are suitable (score of 1.00), between 1.5 - 3 m are moderately highly suitable (score of 0.75), between 3 - 6 m are moderately suitable (score of 0.50), and greater than 6 m are poorly suitable (score of 0.00).',
              description:
                'Appropriate depth scores based on the relationship of existing clam aquaculture operations and the bathymetry (water depth) dataset developed in this study.',
              layers: [{ name: 'Bathymetry - feet', id: '6_0' }],
            },
            {
              name: 'Hydrodynamics (Water Current)',
              caption: 'm/s',
              value: '',
              //meetsRule: this.calcZeros(["Current_Mean_w"]),
              rule:
                'Current speeds (based on average) between 0.05 and 0.15 m/s are suitable for clam aquaculture operations (score of 1.00), between 0.00 - 0.05 m/s are poorly suitable and should be excluded (score of 0.00), between 0.15 - 0.25 m/s are moderately highly suitable (score of 0.75), between 0.25 - 0.35 m/s are moderately suitable (score of 0.50), and above 0.35 m/s are marginally unsuitable (score of 0.25).',
              description:
                'Appropriate water current scores based on the relationship of existing clam aquaculture operations and hydrodynamics. Similar relationships to those identified from literature resources for finfish aquaculture apply to clam aquaculture.',
              layers: [{ name: 'Mean Water Current Speed', id: '10_0' }],
            },
            {
              name: 'Hydrodynamics (Significant Wave height and period)',
              caption: 'Wave (m), Period (seconds)',
              value: '',
              //meetsRule: this.calcZeros(['Hsig_annual_p95_w']),
              rule:
                'Areas with significant wave heights above 2 m are poorly suitable (score 0.00). Areas with short wave periods are poorly suitable (score 0.00).',
              description:
                'When waves are too high and have a short period it makes it increasingly difficult to visit a site to feed and maintain gear. In severe wave conditions gear can become dislogged or break apart.',
              layers: [{ name: 'Significant Wave Height (95%)', id: '12_0' }],
            },
            {
              name:
                'Sea Surface Temperature (SST) and Degree Heating Weeks (DHW)',
              caption: 'degrees C',
              value: '',
              //meetsRule: this.calcZeros(["SST_MUR_10", "DHW_0220mm"]),
              rule:
                'SST and Degreee heating weeks (DHW). Temperatures above 30°C can cause mortality of finfish and clam aquaculture, these areas of warmer water are poorly suitable (score 0.00). Similarily areas with DHW > 4°C are not suitable.',
              description:
                'High temperatures can cause negative affects to aquaculture species and for giant clams can lead to bleaching, disease, and death.',
              layers: [
                {
                  name: 'Degree Heating Weeks - Cumulative Heat Stress',
                  id: '17_0',
                },
              ],
            },
            {
              name: 'Sea Surface Temperature (Climate Change)',
              caption: 'degrees C',
              value: '',
              //meetsRule: this.calcZeros(["SST_rcp85_2050_w"]),
              rule:
                'Temperatures above 30°C can cause mortality of finfish and clam aquaculture, these areas of warmer water are poorly suitable (score 0.00). Incorporating different scenarios for future changes to SST for 2030, 2050, 2100',
              description:
                'High temperatures can cause negative affects to aquaculture species and for giant clams can lead to bleaching, disease, and death.',
              layers: [
                { name: 'Sea Surface Temperature - RCP 8.5 2050', id: '19_0' },
              ],
            },
            {
              name: 'Oceanographic (Chlr a)',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Kd490_MODIS_10yr_mean_w"]),
              rule:
                'Diffuse Attentuation Coefficient at 490 nm (Kd490) is a good indicator of the turbidity (cloudiness of the water). Areas with high turbidity and Chlorophyll a concentation are poorly suitable (score 0.00). ',
              description:
                'Areas with high chlorophyll might not be suitbale for all species, this might be an indicator of excess land runoff.',
              layers: [
                { name: 'Chlorophyll a - Mean concentration', id: '21_0' },
              ],
            },
            {
              name: 'Oceanographic (Kd 490)',
              caption: 'Kd490 (no units), Chlr a (kg/m-3)',
              value: '',
              //meetsRule: this.calcZeros(["Kd490_MODIS_10yr_mean_w"]),
              rule:
                'Diffuse Attentuation Coefficient at 490 nm (Kd490) is a good indicator of the turbidity (cloudiness of the water). Areas with high turbidity and Chlorophyll a concentation are poorly suitable (score 0.00). ',
              description:
                'High turbidity areas have a lot of sediment and nutrients that can be harmful to both finfish and clam aquaculture.',
              layers: [{ name: 'kd490 - Mean', id: '22_0' }],
            },
            {
              name: 'Oceanographic Climate Change (Chlr a)',
              caption: 'kg/ m-3',
              value: '',
              //meetsRule:  this.calcZeros(["Chla_annual_rcp85_2050_w"]),
              rule: '',
              description:
                'Areas with high chlorophyll might not be suitbale for all species, this might be an indicator of excess land runoff.',
              layers: [{ name: 'Chlorophyll a - RCP 8.5 2050', id: '24_0' }],
            },
            {
              name: 'Major Sediment Deposition Areas',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(['Sediment_Major_w']),
              rule:
                'Further review and site evaluation necessary if within areas of major sediment outfall (score of 0.50).',
              description:
                'Water quality may be insufficient for aquaculture operations within major sediment deposition areas.',
              layers: [{ name: 'Major Sediment Deposition Areas', id: '7_0' }],
            },
          ],
        },
        {
          sectionName: 'Natural Resources',
          sectionIcon: 'spa',
          sectionData: [
            {
              name: 'Corals',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Allen_Coral_w", "Allen_Coral_200m_w"]),
              rule:
                'Further review and site evaluation necessary if within areas of coral reefs (score of 0.5).',
              description:
                'Infrastructure and materials used for giant clam farming could negatively affect coral reefs, particularly if gear is abandoned or during storm events.',
              layers: [
                { name: 'Coral Reefs', id: '26_0' },
                { name: 'Coral Reefs - 200 m buffer', id: '27_0' },
              ],
            },
            {
              name: 'Seagrass Beds',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Seagrass_w","Seagrass_200m_w"]),
              rule:
                'Areas associated with seagrass beds are poorly suitable (score 0.00), further review necessary for areas within 200 m of seagrass beds (score 0.5).',
              description:
                'Avoid impacts of effluent (excess feed and fish waste) and shading from aquaculture operations on seagrass beds. For clam aquaculture these areas should be avoided due to shading and potential trampling of areas.',
              layers: [
                { name: 'Seagrass Beds', id: '28_0' },
                { name: 'Seagrass Beds - 200 m buffer', id: '29_0' },
              ],
            },
            {
              name: 'Dugong Feding Concentration Areas',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Dugong_feeding_concentration_w"]),
              rule: '',
              description:
                'Avoid impacts to these protected species and assocaited sensitive habitats.',
              layers: [{ name: 'Dugong Feeding Concentration', id: '30_0' }],
            },
            {
              name: 'Marine Protected Areas',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MPA_RockIs"]),
              rule:
                'Areas associated with marine protected areas are poorly suitable (score of 0.00).',
              description:
                'Avoid natural resource management conflict with aquaculture operations.',
              layers: [{ name: 'Marine Protected Areas', id: '31_0' }],
            },
          ],
        },
        {
          sectionName: 'Social and Cultural',
          sectionIcon: 'people',
          sectionData: [
            {
              name: 'Dive sites',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MA_Update_DiveSites_100m_w"]),
              rule:
                'Areas within 100 m of dive and tourist sites are poorly suitable (score of 0.00)',
              description: 'Avoid user conflicts with dive and tourist sites.',
              layers: [{ name: 'Dive Sites - 100 m buffer', id: '33_0' }],
            },
            {
              name: 'Tourist sites',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MA_Update_TouristSites_100m_w"]),
              rule:
                'Areas within 100 m of dive and tourist sites are poorly suitable (score of 0.00)',
              description: 'Avoid user conflicts with dive and tourist sites.',
              layers: [{ name: 'Tourist Sites - 100 m buffer', id: '34_0' }],
            },
            {
              name: 'Historic sites',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["MA_Update_HistoricalSite_10m_w"]),
              rule:
                'Areas within 10 m of historic sites are poorly suitable (score of 0.00).',
              description:
                'Avoid conflicts and potential impacts of aquaculture operations atop historic sites.',
              layers: [{ name: 'Historic sites - 100 m buffer', id: '35_0' }],
            },
            {
              name: 'Ranger Station',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Rangers_Near_Grid_w"]),
              rule:
                'Areas within 2.5 km of a ranger station are highly suitable (score of 1.00). Suitability decreases with distance, where greater than 10 km away are least suitable (score 0.2).',
              description:
                'Areas near to ranger patrol stations could be prefered for aquaculture siting from a business perspective as risk of theft or vandalism may be lower.',
              layers: [{ name: 'Distance to Ranger Stations', id: '36_0' }],
            },
          ],
        },
        {
          sectionName: 'Infrastructure',
          sectionIcon: 'houseboat',
          sectionData: [
            {
              name: 'Existing aquaculture farms',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Active_Clam_Farms_100m_w", "Aqua_Sites_2020_Finfi_500m_w"]),
              rule:
                'Areas within 500 m of existing finfish farms are poorly suitable, and 100 m for existing clam farms (score of 0.00).',
              description:
                'Minimize potential for biosecurity and disease transmission issues between existing and future aquaculture operations.',
              layers: [
                { name: 'Clam Aquaculture Sites - 100 m buffer', id: '39_0' },
                {
                  name: 'Finfish Aquaculture Sites - 500 m buffer',
                  id: '38_0',
                },
              ],
            },
            {
              name: 'Sewer outfall',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Major_Sewer_Outfall_1000m_w","Sewer_Outfall_500m_w"]),
              rule:
                'Areas within 1000 m of the Malakal wastewater treatment plant outfall and two sewer emergency outfall pump locations are poorly suitable (score of 0.00), further review for areas within 500 m of other wastewater pump station locations.',
              description:
                'Minimize potential for human waste contamination on aquaculture operations which could pose human and fish health risks.',
              layers: [
                { name: 'Major Sewer Outfall - 1000 m buffer', id: '40_0' },
                { name: 'Sewer Outfalls - 500 m buffer', id: '41_0' },
              ],
            },
            {
              name: 'Fiber optic cable',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["FiberOptic_North_100m_w", "FiberOptic_toPeleliu_200m_w"]),
              rule:
                'Areas within 100 m of the underwater fiber optic cable are poorly suitable, and 200 m for the southern area to Peleliu (score of 0.00).',
              description:
                'Avoid potential impacts of moorings or anchors associated with aquaculture operations damaging the fiber optic communications cable.',
              layers: [
                { name: 'Fiber Optic Cable North - 100 m buffer', id: '42_0' },
                {
                  name: 'Fiber Optic Cable to Peleliu - 200 m buffer',
                  id: '43_0',
                },
              ],
            },
          ],
        },
        {
          sectionName: 'Navigation and Shipping',
          sectionIcon: 'directions_boat',
          sectionData: [
            {
              name: 'Navigational Channels',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Major_Nav_Channels_New_100m_w", "Major_Nav_Channels_New_500m_w","Small_Nav_Channels_50m_w", "Small_Nav_Channels_100m_w"]),
              rule:
                'Areas within 100 m of larger vessel routes are poorly suitable (score of 0.00; further review if within 500 m, score of 0.50), 50 m for smaller vessel routes (score of 0.00; further review if within 100 m, score of 0.50).',
              description:
                'Avoid navigational hazards associated with physical infrastructure and activities on aquaculture operations.',
              layers: [
                {
                  name: 'Major Navigation Channels - 100 m buffer',
                  id: '45_0',
                },
                {
                  name: 'Major Navigation Channels - 500 m buffer',
                  id: '46_0',
                },
                { name: 'Small Navigation Channels - 50 m buffer', id: '47_0' },
                {
                  name: 'Small Navigation Channels - 100 m buffer',
                  id: '48_0',
                },
              ],
            },
            {
              name: 'Anchorage or Mooring Areas',
              caption: '',
              value: '',
              //meetsRule:  this.calcZeros(["Anchorage_Mooring_Areas_w"]),
              rule:
                'Areas associated with anchorage or mooring areas are poorly suitable (score of 0.00)',
              description:
                'Avoid conflict between vessels within anchorage/mooring areas and aquaculture operations, as well as potential human waste or sewage contamination.',
              layers: [{ name: 'Anchorage Mooring Areas', id: '49_0' }],
            },
            {
              name: 'Ports',
              caption: '',
              value: '',
              //meetsRule:  this.calcZeros(["Port_Buffer_2km_w"]),
              rule:
                'Area within 2 km of the Port of Koror is poorly suitable (score of 0.00).',
              description:
                'Avoid conflict with large vessels and port-related activity, including military and other commercial uses of port infrastructure.',
              layers: [{ name: 'Major Port - 2 km buffer', id: '50_0' }],
            },
            {
              name: 'Piers, docks [Class B Waters]',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["Class_B_Waters_w"]),
              rule:
                'Further review necessary if within areas associated with existing Class B waters (score of 0.50).',
              description:
                'Avoid conflict with existing developed areas, including potential for navigational hazards associated with aquaculture operations near docks',
              layers: [{ name: 'Class B Waters', id: '51_0' }],
            },
            {
              name: 'Docks 10 km [Cost Analysis]',
              caption: '',
              value: '',
              //meetsRule: this.calcZeros(["docks_10km_w"]),
              rule: 'Area within 10 km of docks is more suitable (score 1.00)',
              description:
                'If farms are established within these areas there is the necessary infrastructure to easily access farm sites and to unload harvested product.',
              layers: [{ name: 'Distance from Docks', id: '53_0' }],
            },
          ],
        },
      ];
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.q-item__section--main ~ .q-item__section--side {
  padding-left: 0px;
}
</style>
