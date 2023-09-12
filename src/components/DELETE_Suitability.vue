<template> 
<div class="q-pr-md">
  <div class="row">
    <div class="col-11">
    <p class="text-h6 text-primary q-mb-none">Aquaculture Suitability Study</p>
    <p>Select a species to view the best possible areas for clam or finfish aquaculture in Palau. What makes a site suitable? Each parameter used in the study is listed below with a description explaining why it was included.  Click the layers button next 
        to the description to view the data associated with each parameter.
    </p>
    </div>
    <div class="col-1">
        <q-btn flat round color="primary" icon="layers_clear" @click="clearAllLayers()">
          <q-tooltip>Clear layers</q-tooltip>
        </q-btn>
    </div>
  </div>
    <p class="text-subtitle2 q-mb-none q-mt-lg text-primary" >Select species type</p>
    <q-separator spaced />
    <div class="q-gutter-sm">
        <q-radio v-model="species" @update:model-value="setSpecies($event)" val="finfish" label="finfish" />
        <q-radio v-model="species" @update:model-value="setSpecies($event)" val="clam" label="clam" />
    </div>
  
    <p class="text-subtitle2 q-mb-none q-mt-lg text-primary" >View all {{species}} parameters</p>
    <q-separator spaced />
    <site-parameters-suitability :species="species"></site-parameters-suitability>
</div>

</template>

<script>
import SiteParametersSuitability from './SiteParametersSuitability.vue'


export default {
  name: 'Suitability',
  components: {
    SiteParametersSuitability

  },
  data(){
    return{
        species: ''
    }    

  },
  mounted() {
      if (this.$store.state.userResults.species){
          this.setSpecies(this.$store.state.userResults.species)
      }
  },
  methods: {
      clearAllLayers(){
        this.$store.commit('clearLayers')
      },
      setSpecies(val){
        if(val == 'clam'){
            this.$store.commit('updateSetTicked', {tick:["3_0"], untick:["4_0"]})
            let layerObj = {value: 0.5, id: 3, mapServiceIndex: 0, type: 'Raster Layer'}
            this.$store.commit('updateSupportingLayerVisibleOpacity', layerObj)
          }
        else if(val =='finfish'){
            this.$store.commit('updateSetTicked', {tick:["4_0"], untick:["3_0"]})
            let layerObj = {value: 0.5, id: 4, mapServiceIndex: 0, type: 'Raster Layer'}
            this.$store.commit('updateSupportingLayerVisibleOpacity', layerObj)
        }
        this.species = val
        //this.userProcess.species = val
        //this.$store.commit('updateUserProcess', this.userProcess)
      }
  }
   
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>
