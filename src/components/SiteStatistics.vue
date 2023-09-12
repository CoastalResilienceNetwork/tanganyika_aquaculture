<template>
  <q-markup-table dense bordered flat>
    <tbody>
      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Overall Suitability ({{ $store.state.userResults.species }})
        </td>
        <td
          colspan="3"
          class="text-left text-green text-bold"
          v-if="
            $store.state.userResults.overallSuitability == 'Suitable' ||
              $store.state.userResults.overallSuitability ==
                'Further Site Review Needed'
          "
        >
          Suitable
        </td>
        <td
          colspan="3"
          class="text-left text-red"
          v-if="
            $store.state.userResults.overallSuitability == 'Poorly Suitable'
          "
        >
          {{ $store.state.userResults.overallSuitability }}
        </td>
        <td
          colspan="3"
          class="text-left text-black"
          v-if="
            $store.state.userResults.overallSuitability == 'Outside Study Area'
          "
        >
          Outside Study Area
        </td>
      </tr>
      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Avg Score
        </td>
        <td colspan="3" class="text-left">
          {{ $store.state.userResults.avgSuitability }}
        </td>
      </tr>
      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Area
        </td>
        <td colspan="3" class="text-left">
          {{ $store.state.userSiteMap.drawAcres }} sq meters
        </td>
      </tr>
      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Site Corners <br />(decimal degrees)
        </td>
        <td class="text-left">
          Upper Left:<br />
          Upper Right:<br />
          Lower Right:<br />
          Lower Left:<br />
          Centroid:
        </td>
        <td colspan="2">
          {{ $store.state.userSiteMap.siteCornersDecimalDegrees.upperLeft }}
          <br />
          {{ $store.state.userSiteMap.siteCornersDecimalDegrees.upperRight }}
          <br />
          {{ $store.state.userSiteMap.siteCornersDecimalDegrees.lowerRight }}
          <br />
          {{ $store.state.userSiteMap.siteCornersDecimalDegrees.lowerLeft }}
          <br />
          {{ $store.state.userSiteMap.siteCornersDecimalDegrees.centroid }}
        </td>
      </tr>

      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left"></td>
        <td class="text-left text-grey-7">(avg)</td>
        <td class="text-left text-grey-7">(min)</td>
        <td class="text-left text-grey-7">(max)</td>
      </tr>
      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Depth (m)
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.avg_depth +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <!-- depth is negative numbers so min is max and max is min.. -->
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.max_depth +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.min_depth +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
      </tr>
      <!--tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Water Current (m/s)
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.avg_current +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.min_current +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.max_current +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
      </tr-->
      <tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Wave Height (m)
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.avg_hsig +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.min_hsig +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.max_hsig +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
      </tr>
      <!--tr>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Wave Period (seconds)
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.avg_tm +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.min_tm +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
        <td class="text-left">
          {{
            Math.round(
              ($store.state.userResults.rasterStatistics.max_tm +
                Number.EPSILON) *
                100
            ) / 100
          }}
        </td>
      </tr-->
      <!--tr>
        <converting meters to kilometers>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Distance to Rangers (km)
        </td>
        <td class="text-left">
          {{
            (
              $store.state.userResults.rasterStatistics.avg_rangers / 1000
            ).toFixed(2)
          }}
        </td>
        <td class="text-left">
          {{
            (
              $store.state.userResults.rasterStatistics.min_rangers / 1000
            ).toFixed(2)
          }}
        </td>
        <td class="text-left">
          {{
            (
              $store.state.userResults.rasterStatistics.max_rangers / 1000
            ).toFixed(2)
          }}
        </td>
      </tr>
      <tr>
        < converting meters to kilometers>
        <td style="background-color: rgb(25,95,100, .1)" class="text-left">
          Distance to Docks (km)
        </td>
        <td class="text-left">
          {{
            (
              $store.state.userResults.rasterStatistics.avg_docks / 1000
            ).toFixed(2)
          }}
        </td>
        <td class="text-left">
          {{
            (
              $store.state.userResults.rasterStatistics.min_docks / 1000
            ).toFixed(2)
          }}
        </td>
        <td class="text-left">
          {{
            (
              $store.state.userResults.rasterStatistics.max_docks / 1000
            ).toFixed(2)
          }}
        </td>
      </tr-->
    </tbody>
  </q-markup-table>
</template>

<script>
export default {
  name: 'SiteSatistics',
  components: {},
  computed: {},
  mounted() {},
  methods: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
