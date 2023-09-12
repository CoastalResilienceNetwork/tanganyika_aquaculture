<template>
  <header class="print-hide">
    <span class="text-green-1"
      >Aquaculture Site Suitability
      <span class="text-subtitle2 q-ml-sm text-green-1"
        >Baja Peninsula - Mexico</span
      >
    </span>

    <div>
      <q-btn
        @click="showHelp = true"
        padding="none"
        color="white"
        flat
        icon="help"
      />
    </div>
  </header>

  <!-- INTRO DIALOG -->
  <q-dialog v-model="showHelp" persistent>
    <q-card style="width: 900px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6 text-primary">Aquaculture Site Suitability</div>
        <q-separator color="primary" />
      </q-card-section>

      <q-card-section class="q-pt-none">
        Welcome to the Aquaculture Site Suitability web map and decision support
        tool. These tools allow you to view, explore, and interact with ...
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="OK"
          color="primary"
          v-close-popup
          @click="setUserChoice"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  data() {
    return {
      showHelp: false,
    };
  },
  mounted() {
    //localStorage.userHideDialogOption = ''
    if (localStorage.userHideDialogOption == 'true') {
      this.showHelp = false;
    }
  },
  methods: {
    setUserChoice() {
      localStorage.userHideDialogOption = true;
    },
  },
};
</script>

<style scoped>
.shadow {
  -webkit-box-shadow: 0px 10px 13px -7px #000000,
    12px 9px 0px 5px rgba(104, 104, 104, 0);
  box-shadow: 0px 10px 13px -7px #000000,
    12px 9px 0px 5px rgba(104, 104, 104, 0);
}
header {
  background: var(--q-primary);
  height: 50px;
  color: #fff;
  font-size: 22px;
  padding: 10px 20px;
  box-shadow: 0px 8px 8px -2px rgb(51 51 51 / 42%);
  position: relative;
  z-index: 10;
  display: flex;
}

header span {
  flex: 1;
  width: 700px;
  overflow: hidden;
  white-space: wrap;
  text-overflow: ellipsis;
}

header button {
  font-size: 15px;
}

.minHeight {
  min-height: 200px;
}

.maxWidth {
  max-width: 1000px;
}

@media screen and (max-width: 700px) {
  .minHeight {
    min-height: 100%;
  }
  header {
    background: var(--q-primary);
    height: 30px;
    color: #fff;
    font-size: 14px;
    padding: 5px 10px;
    box-shadow: 0px 8px 8px -2px rgb(51 51 51 / 42%);
    position: relative;
    z-index: 10;
    display: flex;
  }
  header button {
    font-size: 12px;
  }
  .selected {
    color: #8c9fb9;
  }
}
</style>
