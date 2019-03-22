<template>
  <page actionBarHidden="true">
    <GridLayout class="backgroundImageOverlay" rows="*">
      <ScrollView row="0" width="100%">
        <CardView verticalAlignment="center" padding="10" margin="15" elevation="10" shadowOffsetHeight="10" shadowOpacity="0.2" shadowRadius="50">
  
          <GridLayout class="p-15" verticalAlignment="center" width="100%">
            <FlexboxLayout v-if="currentPage == 0" class="m-10" justifyContent="space-between" width="100%" alignSelf="center" height="100%" flexDirection="column">
  
              <label fontSize="20%" verticalAlignment="center" textAlignment="center" class="font-weight-bold m-20 text-mute" text="Reset password"></label>
  
              <label fontSize="13%" :textWrap="true" verticalAlignment="center" text="Please enter your contact numbers below, An OTP (One Time Password) will be sent to those numbers."></label>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-phone' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Contact numbers"></label>
                <TextField row="1" col="1" keyboardType="number" returnKeyType="next" v-model="user.numbers" autocorrect="true"></TextField>
              </GridLayout>
  
              <Label v-show="txtError && txtError.length > 2" :text="txtError" :textWrap="true" class="text-mute text-light-red p-5" textAlignment="center"></Label>
  
              <ActivityIndicator v-show="isLoading" :busy="isLoading"></ActivityIndicator>
  
              <StackLayout v-show="!isLoading">
                <Button text="Send OTP" :isEnabled="!isLoading" class="submit-button bg-dark-blue text-white" @tap="moveForward()"></Button>
              </StackLayout>
            </FlexboxLayout>
            <FlexboxLayout v-if="currentPage == 1" class="m-10" justifyContent="space-between" width="100%" alignSelf="center" height="100%" flexDirection="column">
  
              <label fontSize="20%" verticalAlignment="center" textAlignment="center" class="font-weight-bold m-20 text-mute" text="Reset password"></label>
  
              <label fontSize="13%" :textWrap="true" verticalAlignment="center" :text="`An SMS with an OTP was sent to ${user.numbers} please enter it below`"></label>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-lock' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="One time password"></label>
                <TextField row="1" col="1" keyboardType="number" returnKeyType="next" v-model="user.otp" autocorrect="true"></TextField>
              </GridLayout>
  
              <Label v-show="txtError && txtError.length > 2" :text="txtError" :textWrap="true" class="text-mute text-light-red p-5" textAlignment="center"></Label>
  
              <ActivityIndicator v-show="isLoading" :busy="isLoading"></ActivityIndicator>
  
              <StackLayout v-show="!isLoading">
                <Button text="Proceed" :isEnabled="!isLoading" class="submit-button bg-dark-blue text-white" @tap="moveForward()"></Button>
              </StackLayout>
            </FlexboxLayout>
            <FlexboxLayout v-if="currentPage == 2" class="m-10" justifyContent="space-between" width="100%" alignSelf="center" height="100%" flexDirection="column">
  
              <label fontSize="20%" verticalAlignment="center" textAlignment="center" class="font-weight-bold m-20 text-mute" text="Reset password"></label>
  
              <label fontSize="13%" :textWrap="true" verticalAlignment="center" :text="`An SMS with an OTP was sent to ${user.numbers} please enter it below`"></label>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-lock' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Password"></label>
                <TextField row="1" col="1" ref="password" secure="true" returnKeyType="done" v-model="user.password" :class="{ light: !isLoading }"></TextField>
              </GridLayout>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-lock' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Confirm Password"></label>
                <TextField row="1" col="1" ref="password" secure="true" returnKeyType="done" v-model="user.confirmPassword" :class="{ light: !isLoading }"></TextField>
              </GridLayout>
  
              <Label v-show="txtError && txtError.length > 2" :text="txtError" :textWrap="true" class="text-mute text-light-red p-5" textAlignment="center"></Label>
  
              <ActivityIndicator v-show="isLoading" :busy="isLoading"></ActivityIndicator>
  
              <StackLayout v-show="!isLoading">
                <Button text="Save password" :isEnabled="!isLoading" class="submit-button bg-dark-blue text-white" @tap="moveForward()"></Button>
              </StackLayout>
            </FlexboxLayout>
          </GridLayout>
        </CardView>
      </ScrollView>
    </GridLayout>
  </page>
</template>

<script>
const dialogs = require("ui/dialogs");
import * as Toast from "nativescript-toast";
var appSettings = require("application-settings");

import * as connectivity from "tns-core-modules/connectivity";

export default {
  name: "login",
  data() {
    return {
      currentPage: 0,
      txtError: "",
      OTP: "000000",
      user: {
        numbers: "",
        otp: "",
        adminID: "",
        password: "",
        confirmPassword: ""
      }
    };
  },
  mounted() {
    this.pageLoaded();
  },
  created() {
    this.pageLoaded();
  },
  beforeDestroy() {
    this.isLoading = false;
  },
  Destroy() {
    this.isLoading = false;
  },
  methods: {
    GoToRegister() {
      this.navigate("/register");
    },
    GoToForgotPassword() {
      this.navigate("/forgot/password");
    },
    GeneratePassword() {
      return Math.floor(100000 + Math.random() * 900000);
    },
    async canGoForward() {
      this.txtError = "";
      if (this.currentPage == 0) {
        if (
          !this.user.numbers ||
          this.user.numbers.length < 9 ||
          this.user.numbers.length > 14
        ) {
          this.txtError = "Please enter valid contact numbers";
          return false;
        }
        try {
          this.OTP = this.GeneratePassword();
          var currentUser = await this.$api.sendOTP(
            this.user.numbers,
            this.OTP
          );
          console.log("current user", currentUser);
          if (!currentUser || !currentUser.content.toJSON()._id) {
            throw new Error(
              "Could not find a user with these contact details, are they registered?"
            );
          } else {
            console.log("adminID", currentUser.content.toJSON()._id);
            this.user.adminID = currentUser.content.toJSON()._id;
          }
        } catch (err) {
          this.txtError = err.message;
          return false;
        }
        return true;
      } else if (this.currentPage == 1) {
        if (this.OTP != this.user.otp) {
          this.txtError = "Incorrect OTP entered";
          return false;
        }
        return true;
      } else if (this.currentPage == 2) {
        if (this.user.confirmPassword != this.user.password) {
          this.txtError = "Passwords do not match";
          return false;
        } else if (this.user.password.length < 4) {
          this.txtError = "Passwords too short, please enter a longer password";
          return false;
        }
        try {
          var changePassword = await this.$api.changePassword(
            this.user.adminID,
            this.user.password
          );
          if (!changePassword) {
            throw new Error("Unable to set your new password, Try again later");
          } else {
            this.$feedback.success({
              title: changePassword.content.toString()
            });
            this.navigate("/login", null, {
              clearHistory: true
            });
          }
        } catch (err) {
          this.txtError = err.message;
          return false;
        }
        return true;
      }
    },
    async moveForward() {
      this.isLoading = true;
      if (await this.canGoForward()) {
        this.currentPage++;
      }
      this.isLoading = false;
    },
    pageLoaded() {
      var self = this;
      this.ApplyNavigation(self);
      this.$store.commit("refreshCache", {
        db: this.$db,
        api: this.$api,
        appSettings: appSettings,
        doc: "admin"
      });
    }
  }
};
</script>

<style scoped>
.backgroundImage {
  background: url("~/assets/images/suit77_black_white.jpeg") no-repeat center;
  background-size: cover;
  padding-top: 3%;
  padding-bottom: 3%;
}

.backgroundImageOverlay {
  background-color: rgba(0, 0, 0, 0.3);
  z-index: -1;
}

.bg-dark-blue-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
