<template>
  <page backgroundSpanUnderStatusBar actionBarHidden="true">
    <GridLayout rows="auto,auto,*" columns="*,auto">
      <StackLayout class="m-t-5" textAlignment="center" colSpan="2" verticalAlignment="center" row="0">
        <ActivityIndicator textAlignment="center" verticalAlignment="center" v-show="!profilePic" :busy="!profilePic"></ActivityIndicator>
        <Image @tap="choosePic()" textAlignment="center" v-show="profilePic" stretch="aspectFill" width="100" height="100" borderRadius="100%" :src="profilePic == null ? '' : profilePic"></Image>
        <label row="0" class="labelTitle m-t-5" textAlignment="center">{{ user.fullName }}</label>
        <label row="0" class="labelname" textAlignment="center">{{ user.userName }}</label>
      </StackLayout>
      <CardView col="1" row="1" textAlignment="right" elevation="15" radius="50" margin="10">
        <Ripple @tap="isEditting = !isEditting">
          <label class="mdi p-15 black-text" verticalAlignment="center" textAlignment="left" fontSize="35" :text="(isEditting ? 'mdi-close' : 'mdi-pencil') | fonticon"></label>
        </Ripple>
      </CardView>
      <StackLayout colSpan="2" row="2">
        <CardView v-if="!isEditting" textAlignment="center" margin="10">
          <ScrollView width="100%">
            <StackLayout width="100%">
              <label class="text-dark-black p-l-20 p-t-20 p-b-10" verticalAlignment="center" fontSize="18" style="opacity:0.6" text="Personal information"></label>
              <GridLayout class="text-dark-black p-x-20 p-y-15" rows="auto,auto" columns="auto,*" v-for="(userInfo,index) in userInfos" :key="index">
                <label row="0" col="0" class="mdi text-dark-black m-r-20" rowSpan="2" verticalAlignment="center" textAlignment="left" fontSize="35" :text="userInfo.icon | fonticon"></label>
                <label row="0" col="1" class="font-weight-bold" fontSize="15" verticalAlignment="center" textAlignment="left" :text="userInfo.title"></label>
                <label row="1" col="1" fontSize="15" textAlignment="left" :text="userInfo.body"></label>
              </GridLayout>
              <label v-show="Devices && Devices.length > 0" class="text-dark-black p-l-20 p-t-20 p-b-10" verticalAlignment="center" fontSize="18" style="opacity:0.6" text="Previous devices"></label>
              <GridLayout class="text-dark-black p-x-20 p-y-15" rows="auto,auto,auto" columns="auto,*,auto" v-for="(device,index) in Devices" :key="index">
                <label row="0" col="0" class="mdi text-dark-black m-r-20" rowSpan="3" verticalAlignment="center" textAlignment="left" fontSize="35" :text="device.icon | fonticon"></label>
                <label row="0" col="1" class="font-weight-bold" fontSize="15" textAlignment="left" :text="device.manufacturer"></label>
                <label row="0" col="2" class="font-weight-bold p-x-10 p-b-2" fontSize="15" rowSpan="2" borderRadius="50" style="color:White;background-color:black;" verticalAlignment="center" textAlignment="center" :text="device.model"></label>
                <label row="1" col="1" fontSize="15" :textWrap="true" textAlignment="left" :text="device.os + ' ' + device.osVersion"></label>
                <label row="2" col="1" fontSize="15" textAlignment="left" :text="getMoment(device.lastActiveDate).fromNow()"></label>
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
import * as imageSource from "tns-core-modules/image-source";

var appSettings = require("application-settings");
import * as connectivity from "tns-core-modules/connectivity";

import { isIOS, device } from "tns-core-modules/platform";
export default {
  data() {
    return {
      isEditting: false,
      layouts: [],
      currentPage: 0,
      currentTab: 0,
      selectedScreen: 1,
      feeds: [],
      userInfos: [],
      Devices: [],
      profilePic: null
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
    this.pageLoaded();
  },
  methods: {
    pageLoaded(args = null) {
      this.layouts = [];
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
          body: "0" + this.user.numbers,
          icon: "mdi-phone"
        },
        {
          title: "Active since",
          body: this.getMoment(this.user.date).fromNow(),
          icon: "mdi-clock-outline"
        }
      ];

      this.profilePic = this.user.profilePic
        ? this.user.profilePic
        : this.$store.state.settings.defaultProfilePic;

      this.$api
        .getPreviousUserDevices(this.user._id)
        .then(devices => {
          this.Devices = devices;
        })
        .catch(err => {
          this.$feedback.error({
            title: "Unable to load your previous devices",
            message: "Try again later"
          });
        });
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
    onBusinessTap(item) {},
    choosePic() {
      let context = imagepicker.create({
        mode: "single"
      });
      var tempPic = this.profilePic;
      this.profilePic = null;
      context
        .authorize()
        .then(function() {
          return context.present();
        })
        .then(selection => {
          selection.forEach(async selected => {
            // process the selected image
            let source = new imageSource.ImageSource();
            let img = await source.fromAsset(selected);
            if (img) {
              this.profilePic =
                "data:image/png;base64," + img.toBase64String("png");
            }
          });
          if (!this.profilePic) {
            this.profilePic = tempPic;
          }
        })
        .catch(err => {
          // process error
          this.$feedback.error({
            title: "No file selected",
            message: "Please select a valid image file",
            duration: 4000,
            position: 1,
            onTap: () => {}
          });
          this.profilePic = tempPic;
        });
    }
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
