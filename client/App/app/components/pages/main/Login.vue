<template>
  <page class="backgroundImage" actionBarHidden="true" @loaded="pageLoaded()">
    <GridLayout class="backgroundImageOverlay" rows="*">
      <ScrollView row="0" width="100%">
        <CardView verticalAlignment="center" padding="10" margin="25" elevation="10" shadowOffsetHeight="10" shadowOpacity="0.2" shadowRadius="50">
          <GridLayout width="100%">
            <FlexboxLayout class="m-10" justifyContent="space-between" width="100%" alignSelf="center" height="100%" flexDirection="column">
  
              <label @tap="isEnterEmail = !isEnterEmail" fontSize="20%" verticalAlignment="center" textAlignment="center" class="font-weight-bold m-20 text-mute" text="Login"></label>
  
              <GridLayout v-show="!isEnterEmail" class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-phone' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Contact numbers"></label>
                <TextField row="1" col="1" :isEnabled="!isEnterEmail" keyboardType="number" returnKeyType="next" v-model="user.numbers" autocorrect="true"></TextField>
              </GridLayout>
  
              <GridLayout v-show="isEnterEmail" class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-email' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Email"></label>
                <TextField row="1" col="1" :isEnabled="isEnterEmail" keyboardType="email" returnKeyType="next" v-model="user.email" autocorrect="true" autocapitalizationType="none" :class="{ 'light hidden': isEnterEmail}" :hidden="!isEnterEmail"></TextField>
              </GridLayout>
             
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-lock' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Password"></label>
                <TextField row="1" col="1" ref="password" secure="true" returnKeyType="done" v-model="user.password" @returnPress="submit()" :class="{ light: !isLoading }"></TextField>
              </GridLayout>
  
              <GridLayout columnss="*,auto">
                <Ripple col="1" @tap="GoToForgotPassword()">
                  <label textAlignment="right" class="text-mute text-dark-blue p-15" fontSize="12%" text="Forget password?"></label>
                </Ripple>
              </GridLayout>
              <ActivityIndicator v-show="isLoading" :busy="isLoading"></ActivityIndicator>
  
              <StackLayout v-show="!isLoading">
                <Button text="Login" :isEnabled="!isLoading" class="submit-button bg-dark-blue text-white" @tap="submit()"></Button>
              </StackLayout>
  
              <GridLayout class="m-10">
                <Ripple @tap="GoToRegister()">
                  <label textAlignment="center" class="text-mute text-dark-blue p-15" fontSize="13%" text="Don't have an account? Register today."></label>
                </Ripple>
              </GridLayout>
  
              <GridLayout v-if="$router.current.userAuthLevel() > 0" justifyContent="flex-end" columns="*" rows="auto">
                <Button v-if="$router.current.userAuthLevel() == 3" @tap="navigate('/admin/dashboard',null,{ clearHistory: true })" :text="'Continue as ' + $store.state.cache.cachedAdmin.userName"></Button>
              </GridLayout>
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
      isEnterEmail: false,
      user: {
        numbers: "",
        password: "",
        email: ""
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
    pageLoaded() {
      this.$store.commit("refreshCache", {
        db: this.$db,
        api: this.$api,
        appSettings: appSettings,
        doc: "admin"
      });
    },
    submit() {
      // Travis
      var self = this;
      this.isLoading = true;
      this.$api
        .adminLogin({
          useEmail: this.isEnterEmail,
          numbers: this.user.numbers,
          email: this.user.email,
          pass: this.user.password
        })
        .then(response => {
          var result = response.content.toJSON();
          this.appSettings.setString("CurrentUserID", result._id);
          this.$api
            .getAuthToken()
            .then(answer => {
              console.log("tag getting auth after login", answer);
              this.loginAdmin(self, result);
              this.isLoading = false;
              this.navigate("/admin/dashboard", null, {
                clearHistory: true,
                transition: {
                  name: "slideTop",
                  duration: 1000,
                  curve: "spring"
                }
              });
            })
            .catch(err => {
              this.$feedback.warning({
                title: "Access denied!",
                duration: 40000,
                message: err.message
              });
              this.isLoading = false;
              this.navigate("/home", null, {
                clearHistory: true
              });
            });
        })
        .catch(err => {
          if (err.message.indexOf("Failed to connect") >= 0) {
            err.message = "Please check your internet connection";
          }
          if (err.message.indexOf("position") >= 0) {
            err.message = "We are current having issues,please contact admin";
          }
          this.$feedback.error({
            title: "Unable to log in",
            message: err.message
          });
          this.isLoading = false;
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
