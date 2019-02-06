<template>
  <GridLayout rows="auto,auto,*" columns="*,auto">
    <StackLayout colSpan="2" row="0" class="bg-light-red" v-show="connectionType == 0">
      <label class="text-white p-5" fontSize="15" textAlignment="center" text="offline"></label>
    </StackLayout>
     <StackLayout col="1" row="1" class="bg-light-red p-x-15 ribbon ribbon-top-right" textAlignment="right" v-if="TNS_ENV !== 'production'">
      <label class="text-white p-x-15 m-x-10 span" textAlignment="center" fontSize="15" text="Demo"></label>
    </StackLayout>
    <Navigator colSpan="2" row="1" rowSpan="2" :defaultRoute="this.$router.current.userAuthLevel() < 1 ? currentPage : adminDashboard" />
  </GridLayout>
</template>

<script>
import * as connectivity from "tns-core-modules/connectivity";
export default {
  name: "App",
  data() {
    return {
      currentPage: "/home",
      adminDashboard: "/admin/dashboard",
      connectionType: null
    };
  },
  beforeCreate() {
    this.$store.commit("refreshCache", {
      db: this.$db,
      api: this.$api,
      appSettings: this.appSettings,
      doc: "admin"
    });
  },
  mounted() {
    connectivity.startMonitoring(conn => {
      if (this.connectionType == 0 && conn > 0) {
        this.$feedback.success({
          title: "Back online",
          message: "You are now online"
        });
      } else if (this.connectionType > 0 && conn == 0) {
        this.$feedback.warning({
          title: "You are offline",
          message: "Some features are not accessible offline"
        });
      }
      this.connectionType = conn;
    });
  },
  methods: {}
};
</script>

<style>
.ribbon {
  transform: rotate(45deg);
  margin-top: 20;
  margin-right: -35;
  z-index: 10;
  overflow: hidden;
}
</style>