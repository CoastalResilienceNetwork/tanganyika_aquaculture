<template>
  <div id="print" class="print-only">
    <print-report></print-report>
  </div>
  <the-header></the-header>
  <div id="mobile" v-if="smallScreen" class="print-hide">
    <q-splitter
      v-model="splitterModelMobile"
      unit="px"
      separator-class="bg-primary"
      horizontal
      @update:model-value="updateScrollContainerHeight($event)"
    >
      <template v-slot:after v-if="smallScreen">
        <!--PANEL COMPONENT-->
        <the-panel-tabs-horizontal
          v-if="$store.state.config.panelDisplayType == 'tabsHorizontal'"
        ></the-panel-tabs-horizontal>
      </template>
      <template v-slot:separator>
        <q-avatar
          draggable="false"
          color="primary"
          text-color="white"
          size="20px"
          icon="drag_indicator"
        />
      </template>
      <template v-slot:before>
        <!--MAP COMPONENT-->
        <the-map></the-map>
      </template>
    </q-splitter>
  </div>
  <div id="desktop" v-if="!smallScreen" class="print-hide">
    <q-splitter
      :limits="[350, Infinity]"
      v-model="splitterModel"
      unit="px"
      separator-class="bg-primary"
    >
      <template v-slot:before>
        <!--PANEL COMPONENT-->
        <the-panel-tabs-horizontal
          v-if="$store.state.config.panelDisplayType == 'tabsHorizontal'"
        ></the-panel-tabs-horizontal>
      </template>
      <template v-slot:separator>
        <q-avatar
          draggable="false"
          color="primary"
          text-color="white"
          size="20px"
          icon="drag_indicator"
        />
      </template>
      <template v-slot:after>
        <!--MAP COMPONENT-->
        <the-map></the-map>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import TheMap from './components/TheMap.vue';
import TheHeader from './components/UI/TheHeader.vue';
import ThePanelTabsHorizontal from './components/ThePanelTabsHorizontal.vue';
import PrintReport from './components/PrintReport.vue';

export default {
  name: 'App',
  components: {
    TheMap,
    TheHeader,
    ThePanelTabsHorizontal,
    PrintReport,
    //TheMapToggle, TheSideNav
  },
  data() {
    return {
      splitterModel:
        this.$store.state.config.panelDisplayType == 'tabsVertical' ? 500 : 600,
      splitterModelMobile:
        this.$store.state.config.panelDisplayType == 'tabsVertical' ? 300 : 400,
      panelScreenSize: 'v-slot:before',
    };
  },
  computed: {
    smallScreen() {
      return this.$q.screen.lt.sm;
    },
  },
  mounted() {
    this.$q.screen.setSizes({ sm: 700 });
    this.$store.dispatch('requestSupportingLayers');
  },
  methods: {
    updateScrollContainerHeight(value) {
      //fires when the splitter is moved on mobile view -resizes the container
      //for tabsHorizontal!  update for tabsvertical
      let newVal = value + 150;
      //document.getElementById('panelM').style.height = 'calc(100vh - ' + newVal  + 'px)'
      document.getElementsByClassName('panelM').forEach((elem) => {
        elem.style.height = 'calc(100vh - ' + newVal + 'px)';
      });
    },
  },
};
</script>

<style>
@media screen and (max-width: 700px) {
  .q-splitter__before,
  .q-splitter__after {
    overflow: hidden !important;
  }
  .esri-view-width-xsmall .esri-expand--auto .esri-expand__mask--expanded {
    display: none;
  }
  .esri-view-width-xsmall .esri-expand--auto .esri-expand__container--expanded {
    top: 100px;
  }
  .esri-view-width-xsmall
    .esri-expand--auto
    .esri-expand__container--expanded
    .esri-expand__panel {
    padding: 2px;
  }
}
</style>
