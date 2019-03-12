<template>
  <StackLayout>
    <GridLayout rows="auto,*" columns="*">
      <CardView class="m-b-5" row="0" textAlignment="center" shadowOpacity="0.2" shadowRadius="50" elevation="20">
        <GridLayout class="bg-dark-blue p-5" rows="auto,auto" columns="auto,*,auto">
          <Ripple rowSpan="2" @tap="navigate(null)" verticalAlignment="center" borderRadius="50%">
            <Label verticalAlignment="center" textAlignment="center" class="mdi text-white p-15" fontSize="30%" :text="'mdi-arrow-left' | fonticon"></Label>
          </Ripple>
          <Image v-if="business.logo" row="0" rowSpan="2" col="2" verticalAlignment="center" width="70" height="70" class="circle p-5" stretch="aspectFill" :src="business.logo" borderRadius="50%" />
          <Ripple v-if="!business.logo" row="0" rowSpan="2" col="2" width="70" height="70" verticalAlignment="center" borderRadius="50%">
            <Label verticalAlignment="center" textAlignment="center" class="mdi" fontSize="35%" :text="'mdi-camera' | fonticon"></Label>
          </Ripple>
          <label row="0" col="0" colSpan="3" fontSize="18%" verticalAlignment="bottom" textAlignment="center" class="font-weight-bold text-white text-mute" :text="business.name"></label>
          <Label row="1" col="0" colSpan="3" fontSize="15%" verticalAlignment="center" textAlignment="center" class="text-white" :textWrap="true" text="Settings"></Label>
        </GridLayout>
      </CardView>
      <CardView row="1" margin="2" elevation="5">
        <ScrollView>
          <StackLayout>
            <GridLayout v-if="settings.length > 0" class="m-10" rows="auto" columns="*,auto">
              <label row="0" col="0" class="h3 font-weight-bold text-mute text-dark-blue" text="Manage"></label>
            </GridLayout>
  
            <Ripple v-for="(option,i) in options" :key="i" @tap="GoTo(option)">
              <GridLayout class="p-10" rows="auto,auto" columns="auto,*">
                <Label row="0" rowSpan="2" col="0" fontSize="25%" verticalAlignment="center" borderRadius="50%" textAlignment="center" class="h2 mdi" :text="'mdi-' + option.icon | fonticon"></Label>
                <label row="0" col="1" class="p-x-15 h3 font-weight-bold" :text="option.title"></label>
                <label row="1" col="1" class="p-x-15 h4" :text="option.text"></label>
              </GridLayout>
            </Ripple>
            <StackLayout v-if="business.type && business.type.optionals && business.type.optionals.length > 0" width="100%" class="hr-light"></StackLayout>
            <GridLayout v-if="business.type && business.type.optionals && business.type.optionals.length > 0" class="m-10" rows="auto" columns="*,auto">
              <label row="0" col="0" class="h3 font-weight-bold text-mute text-dark-blue" text="Optionals"></label>
            </GridLayout>
  
            <StackLayout>
              <GridLayout class="m-10" v-for="(optional,i) in business.type.optionals" :key="i" rows="auto,auto" columns="auto,*">
                <Label row="0" rowSpan="2" col="0" fontSize="25%" verticalAlignment="center" borderRadius="50%" textAlignment="center" class="h2 mdi" :text="'mdi-' + optional.icon | fonticon"></Label>
                <label row="0" col="1" class="p-x-15 h3 font-weight-bold text-mute" :text="optional.title"></label>
                <label row="1" col="1" :textWrap="true" class="p-x-15 h4 text-mute" :text="optional.answer"></label>
              </GridLayout>
            </StackLayout>
  
            <StackLayout v-if="settings.length > 0" width="100%" class="hr-light"></StackLayout>
            <GridLayout v-if="settings.length > 0" class="m-10" rows="auto" columns="*,auto">
              <label row="0" col="0" class="h3 font-weight-bold text-mute text-dark-blue" text="Settings"></label>
            </GridLayout>
  
            <StackLayout v-for="(setting,i) in settings" :key="i">
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*,auto">
                <Label row="0" rowSpan="2" col="0" fontSize="25%" verticalAlignment="center" borderRadius="50%" textAlignment="center" class="h2 mdi" :text="'mdi-' + setting.icon | fonticon"></Label>
                <label row="0" col="1" class="p-x-15 h3 font-weight-bold text-mute" :text="setting.title"></label>
                <label row="1" col="1" :textWrap="true" class="p-x-15 h4 text-mute" :text="setting.description"></label>
                <switch row="0" rowSpan="2" col="2" @checkedChange="changeSetting($event,setting.value,setting._id)" :checked="setting.value"></switch>
              </GridLayout>
  
              <StackLayout v-if="setting.additionals">
                <GridLayout v-show="setting.value" class="m-10" rows="auto,auto" columns="auto,*" v-for="(additional,a) in setting.additionals" :key="a">
                  <Label row="0" rowSpan="2" col="0" fontSize="25%" verticalAlignment="center" borderRadius="50%" textAlignment="center" class="h2 mdi" :text="'mdi-' + additional.icon | fonticon"></Label>
                  <label row="0" col="1" class="p-x-15 h3 font-weight-bold text-mute" :text="additional.description"></label>
                  <StackLayout class="p-x-15" :textWrap="true" orientation="horizontal" row="1" col="1">
                    <CheckBox class="p-x-15" name="circleToggle" boxType="circle" :textWrap="true" :key="c" v-for="(current,c) in additional.options" @tap="changeSetting(additional,current,additional._id,true)" :text="current" :checked="additional.value == current"></CheckBox>
                  </StackLayout>
                </GridLayout>
              </StackLayout>
            </StackLayout>
  
            <Ripple @tap="DeleteBusiness()">
              <GridLayout class="p-10" rows="auto,auto" columns="auto,*">
                <Label row="0" rowSpan="2" col="0" fontSize="25%" verticalAlignment="center" borderRadius="50%" textAlignment="center" class="h2 mdi" :text="'mdi-delete' | fonticon"></Label>
                <label row="0" col="1" class="p-x-15 h3 font-weight-bold" text="Remove this business"></label>
                <label row="1" col="1" class="p-x-15 h4" text="You will no longer see this business"></label>
              </GridLayout>
            </Ripple>
  
            <StackLayout v-if="targets.length > 0" width="100%" class="hr-light"></StackLayout>
            <GridLayout v-if="targets.length > 0" class="m-10" rows="auto" columns="*,auto">
              <label row="0" col="0" class="h3 font-weight-bold text-mute text-dark-blue" text="Targets"></label>
            </GridLayout>
  
            <StackLayout>
              <GridLayout class="m-10" rows="auto,auto" columns="auto,*,auto,auto" v-for="(target,i) in targets" :key="i">
                <Label row="0" rowSpan="2" col="0" fontSize="25%" verticalAlignment="center" borderRadius="50%" textAlignment="center" class="h2 mdi" :text="'mdi-' + target.icon | fonticon"></Label>
                <label row="0" col="1" class="p-x-15 h3 font-weight-bold text-mute" :text="target.title"></label>
                <label v-show="!target.enable" colSpan="2" row="1" col="1" :textWrap="true" class="p-x-15 h4 text-mute" :text="target.description"></label>
                <TextField v-show="target.enable" row="1" col="1" class="h4 m-x-15" :hint="`How much is the ${ target.title }?`" v-model="target.value" returnKeyType="next" keyboardType="number"></TextField>
                <Ripple v-show="target.enable && target.value && target.value != target.defaultValue" row="1" col="2" @tap="changeTarget(target)" verticalAlignment="center" borderRadius="50%">
                  <Label verticalAlignment="center" textAlignment="center" class="mdi" fontSize="25%" :text="'mdi-check' | fonticon"></Label>
                </Ripple>
                <switch row="0" rowSpan="2" col="3" @checkedChange="changeTarget(target)" v-model="target.enable"></switch>
              </GridLayout>
            </StackLayout>
          </StackLayout>
        </ScrollView>
      </CardView>
    </GridLayout>
  </StackLayout>
</template>

<script>
const dialogs = require("ui/dialogs");
import application from "application";

export default {
  data() {
    return {
      isMainScreen: false,
      selectedScreen: "",
      options: [],
      businessSettings: {
        evidenceRequired: false
      },
      targets: [],
      settings: []
    };
  },
  mounted() {
    this.pageLoaded();
  },
  props: ["business"],
  methods: {
    pageLoaded() {
      this.options = [];
      this.options.push({
        title: "Partners (clients/workers)",
        text: `List of ${this.business.name} clients and workers`,
        link: `/business/partners/list`,
        props: {
          businessId: this.business._id,
          businessName: this.business.name
        },
        icon: "worker"
      });
      this.options.push({
        title: "Expenses",
        text: `Expenses of the business`,
        link: `/business/expenses/list`,
        props: {
          businessId: this.business._id,
          businessName: this.business.name
        },
        icon: "trending-down"
      });

      this.options.push({
        title: "Income",
        text: `Income streams of the business`,
        link: `/business/income/list`,
        props: {
          businessId: this.business._id,
          businessName: this.business.name
        },
        icon: "trending-up"
      });

      this.targets = JSON.parse(
        JSON.stringify(
          this.business.targets.map(t => {
            t.defaultValue = t.value;
            return t;
          })
        )
      );
      this.settings = JSON.parse(JSON.stringify(this.business.settings));
    },
    changeTarget(target) {
      // This is an empty enabled
      if (target.enable && !target.value) {
        return;
      }
      this.$api
        .changeBusinessTarget(
          this.business._id,
          target._id,
          target.enable,
          target.value
        )
        .then(changedBusinessTarget => {
          this.targets.find(t => t._id == target._id).defaultValue =
            target.value;
          this.$feedback.success({
            title: "Your changes are saved.",
            message: target.value
          });
          this.$emit(
            "changeBusiness",
            this.targets.map(t => {
              t.value = t.defaultValue;
              return t;
            }),
            "target"
          );
        })
        .catch(err => {
          this.$feedback.error({
            title: "Unable to save your change.",
            duration: 4000,
            message: err.message
          });
          this.targets = JSON.parse(
            JSON.stringify(
              this.business.targets.map(t => {
                t.defaultValue = t.value;
                return t;
              })
            )
          );
        });
    },
    changeSetting(event, value, settingsID, isAdditional = false) {
      if (event.value != value) {
        if (isAdditional) {
          event.value = value;
        }
        this.$api
          .changeBusinessSettings(
            this.business._id,
            settingsID,
            isAdditional ? value : event.value
          )
          .then(changedBusinessSettings => {
            this.$feedback.success({
              title: "Your changes are saved."
            });
            if (!isAdditional) {
              this.settings.forEach(element => {
                if (element._id == settingsID) {
                  element.value = event.value;
                }
              });
            } else {
              this.settings
                .filter(s => s.additionals)
                .forEach(setting => {
                  setting.additionals.forEach(addi => {
                    if (addi._id == settingsID) {
                      addi.value = event.value;
                    }
                  });
                });
            }
            this.$emit("changeBusiness", this.settings, "setting");
          })
          .catch(err => {
            this.$feedback.error({
              title: "Unable to save your change.",
              duration: 4000,
              message: err.message
            });
            this.settings = JSON.parse(JSON.stringify(this.business.settings));
          });
      }
    },
    GoTo(option) {
      if (option.link) {
        this.navigate(option.link, option.props);
      }
    },
    DeleteBusiness() {
      confirm({
        title: "Are you sure you want to remove this business",
        message: "This can not be recovered",
        okButtonText: "Yes",
        cancelButtonText: "No"
      }).then(result => {
        if (result) {
          this.$api
            .deleteBusiness(
              this.$store.state.cache.cachedAdmin._id,
              this.business._id
            )
            .then(result => {
              this.$store.commit("clearCachedBusiness", {
                db: this.$db,
                api: this.$api,
                appSettings: this.appSettings,
                doc: "businesses"
              });
              this.$feedback.success({
                title: "Business removed",
                message: "You are no longer linked to this business"
              });
              this.navigate("/admin/dashboard", null, {
                clearHistory: true
              });
            })
            .catch(err => {
              this.$feedback.error({
                title: "Unable to remove the business",
                message: err.message
              });
            });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.fixedBtn {
  position: fixed;
}
</style>
