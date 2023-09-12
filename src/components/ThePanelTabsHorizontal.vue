<template>
  <div class="q-pt-md">
    <!--Example with supporting layers in a horizontal tab-->
    <div class="q-gutter-y-md">
      <q-card flat>
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="justify"
          narrow-indicator
        >
          <q-route-tab
            to="/"
            name="supporting"
            label="All Layers"
            icon="layers"
          />

          <q-route-tab
            to="/create"
            name="create"
            label="Create Site"
            icon="edit"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="create" class="q-pr-none">
            <!--ref is sent to child comp in order to allow scroll to top on create site-->
            <q-scroll-area
              ref="panelC"
              class="panel panelM"
              :thumb-style="{ width: '7px' }"
            >
              <div class="q-ma-md">
                <create-site :parentRefs="$refs"></create-site>
              </div>
            </q-scroll-area>
          </q-tab-panel>
          <q-tab-panel name="supporting" class="q-pr-none">
            <q-scroll-area class="panel panelM" :thumb-style="{ width: '7px' }">
              <div class="q-mr-lg">
                <SupportingLayers displayClass="supportingLayersPanel" />
              </div>
            </q-scroll-area>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </div>
</template>

<script>
import SupportingLayers from './SupportingLayers.vue';
import CreateSite from './CreateSite.vue';

export default {
  name: 'ThePanelTabsHorizontal',
  components: {
    SupportingLayers,
    CreateSite,
  },
  data() {
    return {
      tab: 'supporting',
      firstLoad: this.$store.state.firstLoad,
    };
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.panel {
  height: calc(100vh - 130px);
  min-width: 360px;
}

@media screen and (max-width: 700px) {
  .panel {
    height: calc(100vh - 520px);
    min-width: 260px;
  }
}
</style>
