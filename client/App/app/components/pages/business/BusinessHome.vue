<template>
  <page backgroundSpanUnderStatusBar actionBarHidden="true">
    <GridLayout @swipe="SegmentedBarSwipe" v-if="business && currentTab > -1" rows="*,auto" columns="*">
      <component row="0" class="enterAnimation" @changeTab="changeTabByChild" @changeBusiness="changeBusiness(business)" :business="business" :is="tabs[currentTab].view"></component>
      <BottomNavigation class="businessIcon" :class="{'visible':business}" @tabSelected="onBottomNavigationTabSelected" :selectedTabIndex="currentTab" titleVisibility="always" activeColor="#0093a4" inactiveColor="black" backgroundColor="transparent" row="1">
        <BottomNavigationTab v-for="(tab,i) in tabs" :key="i" :title="tab.text" :icon="tab.icon" />
      </BottomNavigation>
      <!--  
        <SegmentedBar row="1" #tabs borderColor="$blueDarkColor" backgroundColor="transparent" selectedBackgroundColor="#0093a4" v-model="currentTab">
          <SegmentedBarItem  v-for="(tab,i) in tabs" :key="i" class="mdi" @tap="currentTab = i" style="font-size:25%" :title="tab.icon | fonticon"></SegmentedBarItem>
        </SegmentedBar>
      -->
    </GridLayout>
    <GridLayout v-show="!business" rows="*" columns="*">
      <ActivityIndicator v-if="!business" verticalAlignment="center" textAlignment="center" :busy="!business"></ActivityIndicator>
    </GridLayout>
  </page>
</template>

<script>
const dialogs = require("ui/dialogs");
import * as Toast from "nativescript-toast";

import BusinessProfile from "./Tabs/BusinessProfile.vue";
import BusinessSettings from "./Tabs/BusinessSettings.vue";
import BusinessStats from "./Tabs/BusinessStats.vue";
import BusinessTransactions from "./Tabs/BusinessTransactions.vue";
import BusinessNotifications from "./Tabs/BusinessNotifications.vue";

import * as connectivity from "tns-core-modules/connectivity";

const SwipeDirection = require("tns-core-modules/ui/gestures").SwipeDirection;

export default {
  name: "BusinessHome",
  components: {
    BusinessProfile,
    BusinessSettings,
    BusinessStats,
    BusinessTransactions,
    BusinessNotifications
  },
  data() {
    return {
      currentTab: -1,
      business: null,
      isLoaded: false,
      tabs: []
    };
  },
  mounted() {
    if (!this.isLoaded) {
      this.pageLoaded();
    }
  },
  props: ["businessID"],
  methods: {
    onBottomNavigationTabSelected(event) {
      this.currentTab = event.newIndex;
    },
    pageLoaded(destination = null) {
      this.$api
        .getBusiness(this.businessID, this.$store.state.cache.cachedAdmin._id)
        .then(results => {
          this.business = results;
          this.tabs = [];
          // We do the fall strategy here

          this.business.currentAuth = this.business.admin.find(
            a => a.id._id == this.$store.state.cache.cachedAdmin._id
          );

          if (this.business.currentAuth.authority == "WORKER") {
            this.tabs.push({
              text: "Notifications",
              icon: "ic_bell_black_24dp",
              view: "BusinessNotifications"
            });
          }
          switch (this.business.currentAuth.authority) {
            case "ADMIN":
              this.tabs.push({
                text: "Notifications",
                icon: "ic_home_black_24dp",
                view: "BusinessProfile"
              });
              this.tabs.push({
                text: "Settings",
                icon: "ic_settings_black_24dp",
                view: "BusinessSettings"
              });

            case "WORKER":
              this.tabs.push({
                text: "Transactions",
                icon: "ic_receipt_black_24dp",
                view: "BusinessTransactions"
              });
              this.tabs.push({
                text: "Stats",
                icon: "ic_finance_black_24dp",
                view: "BusinessStats"
              });
              this.currentTab = 0;
              break;
            default:
              this.$feedback.warning({
                title: "Access denied",
                message: "You are not part of this business"
              });
              var goToRoute = "/home";
              if (this.$router.current.userAuthLevel() >= 1) {
                goToRoute = "/admin/dashboard";
              }
              this.navigate(goToRoute, null, {
                clearHistory: true
              });
              this.tabs = [];
              return;
          }
          if (destination) {
            this.changeTabByChild(destination);
          }
        })
        .catch(err => {
          this.$feedback.error({
            title: "Unable to load your business",
            duration: 4000,
            message: err.message
          });
          this.navigate(null);
        });
    },
    changeBusiness(value, type) {
      if (type == "setting") {
        this.business.settings = value;
      } else if (type == "target") {
        this.business.targets = value;
      }
      this.pageLoaded("Settings");
    },
    changeTabByChild(link) {
      var tab = this.tabs.filter(t => t.text == link);
      if (tab && tab.length > 0) {
        this.currentTab = this.tabs.indexOf(tab[0]);
      }
    },
    SegmentedBarSwipe(args) {
      let direction =
        args.direction == SwipeDirection.down
          ? "down"
          : args.direction == SwipeDirection.up
          ? "up"
          : args.direction == SwipeDirection.left
          ? "left"
          : "right";

      if (direction == "left" && this.currentTab < this.tabs.length - 1) {
        this.currentTab++;
      } else if (direction == "right" && this.currentTab > 0) {
        this.currentTab--;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.businessIcon {
  &.visible {
    animation-name: show;
    animation-duration: 1s;
    animation-fill-mode: forwards;
  }
  @keyframes show {
    from {
      transform: scale(4);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
}

.enterAnimation {
  animation-name: show;
  animation-duration: 1s;
  animation-fill-mode: forwards;
  @keyframes show {
    0% {
      transform: translateY(-10);
      opacity: 0.5;
    }
    100% {
      transform: translateY(0);
      opacity: 1;
    }
  }
}

.nav-item::after {
  content: "joe";
}
</style>