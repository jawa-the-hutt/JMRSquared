<template>
  <page backgroundSpanUnderStatusBar actionBarHidden="true">
    <GridLayout rows="auto,auto,*" columns="*,auto">
      <StackLayout class="m-t-5" textAlignment="center" colSpan="2" verticalAlignment="center" row="0">
        <Image textAlignment="center" stretch="aspectFill" width="100" height="100" borderRadius="100%" :src="user.profilePic ? user.profilePic : $store.state.settings.defaultProfilePic"></Image>
        <label row="0" class="labelTitle m-t-5" textAlignment="center">{{ user.fullName }}</label>
        <label row="0" class="labelname" textAlignment="center">{{ user.userName }}</label>
      </StackLayout>
      <CardView col="1" row="1" textAlignment="right" elevation="15" radius="100" margin="10">
      <Ripple @tap="isEditting = !isEditting">
        <label class="mdi p-15 black-text" verticalAlignment="center" textAlignment="left" fontSize="35" :text="(isEditting ? 'mdi-close' : 'mdi-pencil') | fonticon"></label>
      </Ripple>
     </CardView>
      <StackLayout colSpan="2" row="2">
        <CardView v-if="!isEditting" textAlignment="center" margin="10">
          <ScrollView width="100%">
            <StackLayout width="100%">
              <label class="text-dark-black p-l-20 p-t-20 p-b-10" verticalAlignment="center" fontSize="20" style="opacity:0.6" text="Personal information"></label>
              <GridLayout class="text-dark-black p-x-20 p-y-15" rows="auto,auto" columns="auto,*" v-for="(userInfo,index) in userInfos" :key="index">
                <label row="0" col="0" class="mdi text-dark-black m-r-20" rowSpan="2" verticalAlignment="center" textAlignment="left" fontSize="35" :text="userInfo.icon | fonticon"></label>
                <label row="0" col="1" class="font-weight-bold" fontSize="15" verticalAlignment="center" textAlignment="left" :text="userInfo.title"></label>
                <label row="1" col="1" fontSize="15" textAlignment="left" :text="userInfo.body"></label>
              </GridLayout>
              <label class="text-dark-black p-l-20 p-t-20 p-b-10" verticalAlignment="center" fontSize="20" style="opacity:0.6" text="Previous devices"></label>
              <GridLayout class="text-dark-black p-x-20 p-y-15" rows="auto,auto" columns="auto,*,auto" v-for="(device,index) in Devices" :key="index">
                <label row="0" col="0" class="mdi text-dark-black m-r-20" rowSpan="2" verticalAlignment="center" textAlignment="left" fontSize="35" :text="device.icon | fonticon"></label>
                <label row="0" col="1" class="font-weight-bold" fontSize="15" textAlignment="left" :text="device.manufacturer"></label>
                <label row="0" col="2" class="font-weight-bold p-x-10 p-b-2" fontSize="15" rowSpan="2" borderRadius="50" style="color:White;background-color:black;" verticalAlignment="center" textAlignment="center" :text="device.model"></label>
                <label row="1" col="1" fontSize="15" textAlignment="left" :text="getMoment(device.lastActiveDate).fromNow()"></label>
              </GridLayout>
            </StackLayout>
          </ScrollView>
        </CardView>
        <CardView v-if="isEditting" textAlignment="center" margin="10">
          <GridLayout rows="*,auto">
          <ScrollView row="0" width="100%">
            <StackLayout width="100%">
              <GridLayout class="text-dark-black p-x-20 p-y-15" rows="auto,auto" columns="auto,*" v-for="(userInfo,index) in userInfos" :key="index">
                <label row="0" col="0" class="mdi text-dark-black m-r-20" rowSpan="2" verticalAlignment="center" textAlignment="left" fontSize="35" :text="userInfo.icon | fonticon"></label>
                <label row="0" col="1" class="font-weight-bold" fontSize="15" verticalAlignment="center" textAlignment="left" :text="userInfo.title"></label>
                <TextField row="1" col="1" fontSize="15" textAlignment="left" v-model="userInfo.body" />
              </GridLayout>
            </StackLayout>
          </ScrollView> 
            <StackLayout row="1">
                <Button text="Save changes" :isEnabled="!isLoading" class="submit-button bg-dark-blue text-white"></Button>
              </StackLayout>
              </GridLayout>
        </CardView>
      </StackLayout>
    </GridLayout>
  </page>
</template>

<script>
const dialogs = require("ui/dialogs");
import * as Toast from "nativescript-toast";

import * as imagepicker from "nativescript-imagepicker";

var appSettings = require("application-settings");
import * as connectivity from "tns-core-modules/connectivity";

import { isIOS } from "tns-core-modules/platform";
export default {
  data() {
    return {
      isEditting: false,
      layouts: [],
      isLoaded: false,
      currentPage: 0,
      currentTab: 0,
      selectedScreen: 1,
      feeds: [],
      userInfos: [],
      Devices: []
    };
  },
  computed: {
    user: {
      get() {
        return this.$store.state.cache.cachedAdmin;
      }
    },
    cachedBusinesses: {
      get() {
        return this.$store.state.cache.cachedBusinesses;
      }
    },
    Reminders: {
      get() {
        return this.$store.state.collections.tasks.all;
      }
    }
  },
  mounted() {
    if (!this.isLoaded) {
      this.pageLoaded();
    }
    setTimeout(() => {
      const testing = this.TNS_ENV !== "production";
      this.$firebase.admob
        .showBanner({
          size: this.$firebase.admob.AD_SIZE.SMART_BANNER, // see firebase.admob.AD_SIZE for all options
          margins: {
            top: 10
          },
          androidBannerId: "ca-app-pub-4924835910036108~3001656373",
          iosBannerId: "ca-app-pub-4924835910036108~3001656373",
          testing: testing, // when not running in production set this to true, Google doesn't like it any other way
          iosTestDeviceIds: [],
          keywords: ["business", "money", "cash", "rich", "free", "job", "work"] // add keywords for ad targeting
        })
        .then(() => {})
        .catch(errorMessage => {});
    }, 5000);
  },
  methods: {
    pageLoaded(args = null) {
      this.layouts = [];
      this.isLoaded = true;
      this.userInfos = [
        {
          title: "User name",
          body: this.user.userName,
          icon: "mdi-account"
        },
        {
          title: "Full name",
          body: this.user.fullName,
          icon: "mdi-account-circle-outline"
        },
        {
          title: "Email",
          body: this.user.email,
          icon: "mdi-email"
        },
        {
          title: "Contact number",
          body:"0" + this.user.numbers,
          icon: "mdi-phone"
        },
        {
          title: "Active since",
          body: this.getMoment(this.user.date).fromNow(),
          icon: "mdi-clock-outline"
        }
      ];

      this.Devices = [
        {
          lastActiveDate: new Date(),
          model: "SM-959G",
          manufacturer: "Samsung"
        },
        {
          lastActiveDate: new Date(),
          model: "SM-959G",
          manufacturer: "Samsung"
        },
        {
          lastActiveDate: new Date(),
          model: "SM-959G",
          manufacturer: "Samsung"
        }
      ];

      this.$api
        .getAllBusinessesForUser(this.$store.state.cache.cachedAdmin._id)
        .then(results => {
          var count = results.length;
          if (count > this.layouts.length) {
            count = this.layouts.length;
          }
          var i = 0;
          var tank = [];
          var timer = setInterval(() => {
            if (tank.filter(t => t == i).length == 0) {
              if (i < count) {
                this.layouts[i].icon = results[i].type.icon;
                this.layouts[i].title = results[i].name;
                this.layouts[i].link = "/business/home";
                this.layouts[i].props = {
                  businessID: results[i]._id
                };
              } else if (i == count && count < this.layouts.length - 1) {
                if (this.layouts.filter(l => !l.title && !l.icon).length > 0) {
                  var first = this.layouts.filter(l => !l.title && !l.icon)[0];
                  first.icon = "briefcase-plus";
                  first.title = "Add Business";
                  first.link = "/business/add/business";
                }
                this.layouts
                  .filter(l => !l.title && !l.icon)
                  .map(layout => {
                    layout.icon = " ";
                    layout.title = " ";
                  });
                if (args) {
                  args.object.refreshing = false;
                }
              } else {
                clearInterval(timer);
              }
              tank.push(i);
              i++;
              this.$forceUpdate();
            }
          }, 300);
        })
        .catch(err => {
          this.$feedback.error({
            title: "Unable to load your businesses",
            duration: 4000,
            message: "Please try again later"
          });
          this.layouts.forEach(layout => {
            layout.icon = "bug-report";
            layout.title = "Invalid";
          });
          if (args) {
            args.object.refreshing = false;
          }
          this.$forceUpdate();
        });

      var firstTime = appSettings.getBoolean("shownChangeLog");
      if (!firstTime) {
        this.$feedback.success({
          title: "Welcome to the JMRSquared app",
          message: "You are currently using version 1"
        });
        appSettings.setBoolean("shownChangeLog", true);
      }
    },
    refreshList(args) {
      this.pageLoaded(args);
    },
    eventChanged(event) {
      dialogs.alert("Changed view").then(() => {
        console.log("This is it");
      });
    },
    onItemTap(item) {
      if (item.link) {
        this.navigate(item.link, item.props);
      }
    },
    onBusinessTap(item) {}
  }
};
</script>

<style lang="scss" scoped>
.labelTitle {
  color: black;
  font-size: 29px;
  font-weight: bold;
}

.labelname {
  color: black;
  opacity: 0.4;
  font-size: 15px;
}

.text-left-margin {
  margin-top: -40px;
}

.icon-stager {
  margin-top: 20px;
  opacity: 0.8;
  margin-right: 20px;
}

.email-grid {
  margin-left: 25px;
}

.businessIcon {
  &.visible {
    animation-name: show;
    animation-duration: 0.5s;
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

.pulse {
  animation-name: pulse;
  animation-duration: 3s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  @keyframes pulse {
    0% {
      transform: opacity(1) scale(1);
    }
    50% {
      transform: opacity(0.5) scale(0.5);
    }
  }
}
</style>
