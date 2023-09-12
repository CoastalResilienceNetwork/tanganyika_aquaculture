<template>
  <h5>Aquaculture Site Suitability. Baja Peninsula - Mexico</h5>
  <div style="border-bottom: 2px solid #195f64">
    <p class="text-h6 text-weight-light q-mb-none q-pb-none">Site Statistics</p>
  </div>
  <site-statistics></site-statistics>
  <br />
  <div style="border-bottom: 2px solid #195f64">
    <p class="text-h6 text-weight-light q-mb-none q-pb-none">Site Parameters</p>
  </div>
  <site-parameters></site-parameters>
  <div class="q-mb-sm" style="border-bottom: 2px solid #195f64" id="siteMap">
    <p class="text-h6 text-weight-light q-mb-none q-pb-none">Site Map</p>
  </div>
  <q-img
    fit="contain"
    id="mapImage"
    :src="$store.state.userSiteMap.mapImageURI"
  />
</template>

<script>
import SiteParameters from './SiteParameters.vue';
import SiteStatistics from './SiteStatistics.vue';

export default {
  name: 'PrintReport',
  components: {
    SiteParameters,
    SiteStatistics,
  },
  data() {
    return {
      expanded: true,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
@media print {
  #siteMap {
    page-break-before: always;
  }
}

@page {
  margin: 15mm 15mm;
}
</style>
