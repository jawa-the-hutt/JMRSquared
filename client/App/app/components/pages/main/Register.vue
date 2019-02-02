<template>
  <page class="backgroundImage" actionBarHidden="true" @loaded="pageLoaded()">
    <GridLayout class="backgroundImageOverlay" rows="*">
      <ScrollView row="0" width="100%">
        <CardView verticalAlignment="center" padding="10" margin="25" elevation="10" shadowOffsetHeight="10" shadowOpacity="0.2" shadowRadius="50">
          <GridLayout width="100%">
            <FlexboxLayout class="m-10" justifyContent="space-between" width="100%" alignSelf="center" height="100%" flexDirection="column">
  
              <label fontSize="20%" verticalAlignment="center" textAlignment="center" class="font-weight-bold m-20 text-mute" text="Register"></label>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-account-outline' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Username"></label>
                <TextField row="1" col="1" returnKeyType="next" v-model="user.username" autocorrect="true" autocapitalizationType="none"></TextField>
              </GridLayout>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-account-card-details' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Full name"></label>
                <TextField row="1" col="1" returnKeyType="next" v-model="user.fullname" autocorrect="true" autocapitalizationType="none"></TextField>
              </GridLayout>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-phone' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Contact numbers"></label>
                <TextField row="1" col="1" keyboardType="number" returnKeyType="next" v-model="user.numbers" autocorrect="true"></TextField>
              </GridLayout>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-email' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Email"></label>
                <TextField row="1" col="1" keyboardType="email" returnKeyType="next" v-model="user.email" autocorrect="true" autocapitalizationType="none"></TextField>
              </GridLayout>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-lock' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Password"></label>
                <TextField row="1" col="1" ref="password" secure="true" returnKeyType="done" v-model="user.password" @returnPress="submit()" :class="{ light: !isLoading }"></TextField>
              </GridLayout>
  
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*">
                <label row="0" rowSpan="2" col="0" verticalAlignment="center" textAlignment="center" class="mdi m-10" fontSize="25%" :text="'mdi-lock' | fonticon"></label>
                <label row="0" col="1" class="h3 font-weight-bold text-mute" text="Confirm Password"></label>
                <TextField row="1" col="1" ref="password" secure="true" returnKeyType="done" v-model="user.confirmPassword" @returnPress="submit()" :class="{ light: !isLoading }"></TextField>
              </GridLayout>
  
              <ActivityIndicator v-show="isLoading" :busy="isLoading"></ActivityIndicator>
  
              <StackLayout v-show="!isLoading">
                <Button text="Register" :isEnabled="!isLoading" class="submit-button bg-dark-blue text-white" @tap="submit()"></Button>
              </StackLayout>
  
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
      user: {
        numbers: "",
        password: "",
        confirmPassword: "",
        email: "",
        username: "",
        fullname: null
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
    pageLoaded() {
      this.$store.commit("refreshCache", {
        db: this.$db,
        api: this.$api,
        appSettings: appSettings,
        doc: "admin"
      });
    },
    submit() {
      var self = this;
      this.isLoading = true;
      if (!this.user.username || this.user.username.length < 3) {
        this.$feedback.error({
          title: "Invalid username",
          message: "Username too short"
        });
        this.isLoading = false;
        return;
      } else if (
        !this.user.numbers ||
        this.user.numbers.length < 9 ||
        this.user.numbers.length > 14
      ) {
        this.$feedback.error({
          title: "Invalid contact numbers",
          message: "Please enter valid contact numbers"
        });
        this.isLoading = false;
        return;
      } else if (!this.user.password || this.user.password.length < 5) {
        this.$feedback.error({
          title: "Invalid password",
          message: "Password too short"
        });
        this.isLoading = false;
        return;
      } else if (this.user.password != this.user.confirmPassword) {
        this.$feedback.error({
          title: "Invalid password",
          message: "Passwords do not match"
        });
        this.isLoading = false;
        return;
      } else if (
        !this.user.email ||
        this.user.email.length < 4 ||
        this.user.email.indexOf(".") < 0 ||
        this.user.email.indexOf("@") < 0
      ) {
        this.$feedback.error({
          title: "Invalid email",
          message: "Please insert a valid email address"
        });
        this.isLoading = false;
        return;
      }

      this.$api
        .addPartner(
          this.user.email,
          this.user.password,
          this.user.numbers,
          "ADMIN",
          this.user.username,
          this.user.fullname,
          null,
          null
        )
        .then(response => {
          var statusCode = response.statusCode;
          this.isLoading = false;
          if (statusCode == 200) {
            this.$feedback.success({
              title: "Profile successfully created",
              message: `Welcome ${
                this.user.username
              }! , Please log in and enjoy our system.`
            });
            this.navigate("/login");
          } else {
            throw new Error(response.content.toString());
          }
        })
        .catch(err => {
          this.$feedback.error({
            title: "Your account was not created.",
            duration: 4000,
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
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
