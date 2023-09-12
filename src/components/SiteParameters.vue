<template>
  <div v-if="$store.state.userResults.suitabilityStatistics">
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

            <q-item-section side>
              <!-- Section summary error count section-->
              <div class="row items-center">
                <q-badge
                  color="red"
                  outline
                  v-if="report.sectionSummary[index].sectionOverall == 'close'"
                >
                  {{ report.sectionSummary[index].sectionSummary.errors }}
                  <q-icon name="close" color="red" class="q-ml-xs" />
                </q-badge>
                <q-badge
                  color="yellow"
                  outline
                  v-if="
                    report.sectionSummary[index].sectionOverall ==
                      'warning_amber'
                  "
                >
                  {{ report.sectionSummary[index].sectionSummary.warnings }}
                  <q-icon name="warning_amber" color="yellow" class="q-ml-xs" />
                </q-badge>
              </div>
            </q-item-section>
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
                <q-item-label
                  class="text-red"
                  v-if="param.meetsRule.icon == 'close'"
                  caption
                  >{{ param.description }}</q-item-label
                >
                <q-item-label
                  class="text-grey-6"
                  v-if="param.meetsRule.icon == 'warning_amber'"
                  caption
                  >{{ param.description }}</q-item-label
                >
              </q-item-section>

              <!--rule button section -->
              <q-item-section side center>
                <q-btn
                  size="12px"
                  push
                  flat
                  round
                  :color="param.meetsRule.color"
                  :icon="param.meetsRule.icon"
                >
                  <q-popup-proxy style="width:50%">
                    <q-banner>
                      <!--p class="text-subtitle2 text-primary q-mb-none">Rule </p>
                    {{param.rule}}
                    <br/><br/-->
                      <p class="text-subtitle2 text-primary q-mb-none">
                        Description
                      </p>
                      {{ param.description }}
                      <br /><br />
                      <p
                        :style="'color: ' + param.meetsRule.color"
                        class="text-caption"
                      >
                        Score:
                        <br />
                        <span style="font-size: 20px"
                          ><q-icon
                            :name="param.meetsRule.icon"
                            :class="'text-' + param.meetsRule.color"
                        /></span>
                        {{ param.meetsRule.val }}
                      </p>
                    </q-banner>
                  </q-popup-proxy>
                </q-btn>
              </q-item-section>

              <!--Description button section -->
              <q-item-section side center class="q-pl-none print-hide">
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
  name: 'SiteParameters',
  components: {},
  data() {
    return {
      viewLayers: [],
      selectedList: [],
    };
  },

  methods: {
    //these 3 functions show / hide associated layers
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
      this.$store.commit('updateSetTicked', {
        tick: this.viewLayers,
        untick: layerIds,
      });
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

    //compiles the errors and warnings for the users site into an object
    calcErrorReport() {
      let report = {
        totalWarnings: 0,
        totalErrors: 0,
        totalSuccess: 0,
        overallSuitability: '',
        sectionSummary: [],
      };
      let reportWarnings = 0;
      let reportErrors = 0;
      let reportSuccess = 0;
      this.resultsData.forEach((section) => {
        let sectionWarnings = 0;
        let sectionErrors = 0;
        let sectionSuccess = 0;
        let overall = '';
        section.sectionData.forEach((param) => {
          if (param.meetsRule.icon == 'check') {
            reportSuccess = reportSuccess + 1;
            sectionSuccess = sectionSuccess + 1;
          }
          if (param.meetsRule.icon == 'warning_amber') {
            reportWarnings = reportWarnings + 1;
            sectionWarnings = sectionWarnings + 1;
          }
          if (param.meetsRule.icon == 'close') {
            reportErrors = reportErrors + 1;
            sectionErrors = sectionErrors + 1;
          }
        });
        if (sectionErrors > 0) {
          overall = 'close';
        }
        if (sectionErrors == 0 && sectionWarnings > 0) {
          overall = 'warning_amber';
        }
        if (sectionErrors == 0 && sectionWarnings == 0) {
          overall = 'check';
        }
        let sectionOb = {
          sectionName: section.sectionName,
          sectionIcon: section.sectionIcon,
          sectionSummary: {
            warnings: sectionWarnings,
            errors: sectionErrors,
            successes: sectionSuccess,
          },
          sectionOverall: overall,
        };
        report.sectionSummary.push(sectionOb);
      });
      report.totalWarnings = reportWarnings;
      report.totalErrors = reportErrors;
      report.totalSuccess = reportSuccess;

      if (reportErrors > 0) {
        report.overallSuitability = 'Poorly Suitable';
      }
      if (reportErrors == 0 && reportWarnings > 0) {
        report.overallSuitability = 'Further Site Review Needed';
      }
      if (reportErrors == 0 && reportWarnings == 0) {
        report.overallSuitability = 'Suitable';
      }
      // if (this.$store.state.userResults.rasterStatistics == 'out of bounds') {
      //   report.overallSuitability = 'Outside Study Area';
      // }
      this.$store.commit(
        'updateUserResultsOverallSuitability',
        report.overallSuitability
      );
      return report;
    },

    //this function is called from the data object for each object we check the list to see if the field name(s)
    //is a warning or error
    calcZeros(fieldNames) {
      //get zeros list
      let zeros = this.$store.state.userResults.zeros;
      let warnings = this.$store.state.userResults.warnings;
      let err = 0;
      let warn = 0;
      let suitable = { val: 'Suitable', icon: 'check', color: 'green' };

      fieldNames.forEach((field) => {
        //look for warnings
        if (warnings.length > 0 && warnings.includes(field)) {
          warn = warn + 1;
        }
        //look for errors
        if (zeros.length > 0 && zeros.includes(field)) {
          err = err + 1;
        }
      });

      if (warn > 0) {
        suitable = {
          val: 'Further Evaluation Needed',
          icon: 'warning_amber',
          color: 'warning',
        };
      }
      if (err > 0) {
        suitable = { val: 'Poorly Suitable', icon: 'close', color: 'red' };
      }
      return suitable;
    },
  },
  computed: {
    report() {
      let report = this.calcErrorReport();
      return report;
    },
    resultsData() {
      return this.$store.state.userResults.species == 'onshore'
        ? this.onshore
        : this.offshore;
    },

    //this is the data object that holds the sections and info
    offshore() {
      return [
        {
          sectionName: 'Ambiental',
          sectionIcon: 'language',
          sectionData: [
            {
              name: 'Profundidad del agua',
              caption: 'm (negative values)',
              value: '',
              meetsRule: this.calcZeros(['Mexico_B_1']),
              rule:
                'Depth between -40 - -60 m are suitabel (score of 1.00), between 0 - -30 m and -100 and below are poorly suitable and should be exceluded from further',
              description:
                'Las operaciones de acuicultura en aguas poco profundas pueden conducir a la deposición de desechos de pescado y exceso de alimento en el lecho marino, lo que puede causar contaminación e impacto por nutrientes.',
              layers: [{ name: 'Batimetría - metro', id: '17_0' }],
            },
            {
              name: 'Temperatura de la superficie del mar (SST)',
              caption: 'C',
              value: '',
              meetsRule: this.calcZeros(['Mexico_S_1']),
              rule:
                'Temperature less than 16 is less suitable (score 0.1), between 16 and less than 23 and 26 or greater are moderately suitable (score 0.5), tempearture at 23 and less than 26 are most suitable (1.00)',
              description:
                'Las temperaturas que no son las ideales pueden causar efectos negativos en las especies acuícolas y pueden provocar un crecimiento lento, enfermedades y la muerte.',
              layers: [{ name: 'Temperatura', id: '31_0' }],
            },
            {
              name: 'Hidrodinámica (Altura de ola significativa)',
              caption: 'Wave (m)',
              value: '',
              meetsRule: this.calcZeros(['Mexico_W_1']),
              rule:
                'Wave height below 0.5 m are suitable (score of 1.00), greater than 0.5 and less than 2.5 m are moderatley suitable (score of 0.5), and greater than 2.5 m are less suitable (score of 0.1).',
              description:
                'Cuando las olas son demasiado altas, es cada vez más difícil visitar un sitio para alimentar y mantener el equipo. En condiciones de olas severas, el equipo puede soltarse o romperse.',
              layers: [
                { name: 'Altura de ola significativa - metro', id: '29_0' },
              ],
            },
            {
              name: 'Clorofila a (mg m-3)',
              caption: '',
              value: '',
              meetsRule: this.calcZeros(['Mexico_C_2']),
              rule:
                'Chlorophyll less than 0.1 and 2 or greater have the lowest suitability (score 0.1), between 0.5 and less than 2, have moderature suitabililty (score 0.5), and between 0.1 and less than 0.5 have the highest suitability (score 1.00)',
              description:
                'Las áreas con alto contenido de clorofila pueden no ser adecuadas para todas las especies, esto podría ser un indicador de un exceso de escorrentía.',
              layers: [{ name: 'Clorofila a', id: '30_0' }],
            },
          ],
        },
        {
          sectionName: 'Infraestructura',
          sectionIcon: 'houseboat',
          sectionData: [
            {
              name: 'Sitios de acuicultura',
              caption: '',
              value: '',
              meetsRule: this.calcZeros(['Mexico_Aqu', 'Mexico_A_1']),
              rule:
                'Areas within 500 m of existing aquaculture farms are poorly suitable (score of 0.00).',
              description:
                'Minimizar el potencial de bioseguridad y problemas de transmisión de enfermedades entre las operaciones acuícolas existentes y futuras.',
              layers: [
                {
                  name: 'Sitios de acuicultura - Zona de influencia de 500 m',
                  id: '15_0',
                },
              ],
            },
            {
              name: 'Puertos',
              caption: '',
              value: '',
              meetsRule: this.calcZeros(['Mexico_Por']),
              rule:
                'Areas within 20 km of a port are highly suitable (score of 1.00).',
              description:
                'Los puertos son una infraestructura importante para las operaciones en alta mar.',
              layers: [
                { name: 'Puertos - Zona de influencia de 20 km', id: '36_0' },
              ],
            },
            {
              name: 'Carreteras',
              caption: '',
              value: '',
              meetsRule: this.calcZeros(['Mexico_Hig']),
              rule:
                'Areas within 5 km of a highway are highly suitable (score of 1.00).',
              description:
                'Las carreteras son una infraestructura importante para las operaciones en alta mar.',
              layers: [
                { name: 'Carreteras - Zona de influencia de 5 km', id: '21_0' },
              ],
            },
            {
              name: 'Línea costera',
              caption: '',
              value: '',
              meetsRule: this.calcZeros(['Mexico_Coa']),
              rule:
                'Areas within 20 km of a port are highly suitable (score of 1.00).',
              description:
                'Los sitios de acuicultura demasiado lejos de la costa pueden ser costosos de acceder y mantener.',
              layers: [
                {
                  name: 'Línea costera - Zona de influencia de 20 km',
                  id: '20_0',
                },
              ],
            },
          ],
        },
        {
          sectionName: 'Recursos naturales',
          sectionIcon: 'spa',
          sectionData: [
            {
              name: 'Áreas Marinas Protegidas',
              caption: '',
              value: '',
              meetsRule: this.calcZeros(['Mexico_MPA']),
              rule:
                'Areas associated with marine protected areas are poorly suitable (score of 0.00).',
              description:
                'Vitar el conflicto entre la gestión de los recursos naturales y las operaciones de acuicultura.',
              layers: [{ name: 'Áreas Marinas Protegidas', id: '22_0' }],
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
