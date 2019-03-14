<template>
  <page actionBarHidden="true">
    <GridLayout rows="auto,*" backgroundColor="white">
      <CardView row="0" elevation="15">
        <GridLayout rows="auto,auto" columns="auto,*" class="bg-dark-blue p-10">
          <Ripple rowSpan="2" @tap="navigate(null)" verticalAlignment="center" borderRadius="50%">
            <Label verticalAlignment="center" textAlignment="center" class="mdi text-white p-5" fontSize="30%" :text="'mdi-arrow-left' | fonticon"></Label>
          </Ripple>
          <label class="p-x-15 text-white" fontSize="18%" col="1" text="Partners"></label>
          <label row="1" class="p-x-15 text-white" verticalAlignment="center" fontSize="13%" col="1" :text="`Workers and clients of ${businessName}`"></label>
        </GridLayout>
      </CardView>
      <Fab @tap="GoTo(option)" row="1" icon="res://ic_add_white_24dp" class="fab-button fixedBtn"></Fab>
      <PullToRefresh row="1" @refresh="refreshList($event)">
        <ScrollView row="1">
          <StackLayout>
            <ActivityIndicator verticalAlignment="center" textAlignment="center" v-show="isLoading" :busy="isLoading"></ActivityIndicator>
            <GridLayout v-show="!isLoading" v-for="(partner,i) in partners" :key="i" class="p-10" rows="auto,auto,auto" columns="auto,*,auto,auto">
              <Image row="0" rowSpan="3" col="0" borderWidth="5px" borderColor="$blueLightColor" stretch="aspectFill" :src="partner.profilePic ? partner.profilePic : $store.state.settings.defaultProfilePic" width="70" height="70" borderRadius="50%" />
              <label row="0" col="1" class="p-x-15 font-weight-bold" fontSize="20%" verticalAlignment="bottom" :text="partner.userName"></label>
              <label row="1" col="1" class="p-x-15" fontSize="18%" verticalAlignment="bottom" :text="partner.role.toLowerCase()"></label>
              <label row="2" col="1" class="p-x-15" fontSize="18%" verticalAlignment="bottom" :text="`0${partner.numbers}`"></label>
              <label row="0" col="2" v-if="partner.lastEventDate" class="p-x-15 font-weight-bold" :textWrap="true" fontSize="15%" verticalAlignment="bottom" textAlignment="right" :text="partner.lastEventTitle"></label>
              <label row="1" col="2" v-if="partner.lastEventDate" class="p-x-15" :textWrap="true" fontSize="15%" verticalAlignment="bottom" textAlignment="right" :text="getMoment(partner.lastEventDate).format('Do MMMM YYYY')"></label>
              <label row="2" col="2" v-if="partner.lastEventDate" class="p-x-15 text-dark-blue" fontSize="15%" verticalAlignment="bottom" textAlignment="right" :text="`R${partner.lastEventAmount}`"></label>
              <Ripple row="1" col="3" rowSpan="2" v-if="partner.role != 'ADMIN'" @tap="RemovePartner(partner)" verticalAlignment="center" borderRadius="50%">
                <Label verticalAlignment="center" textAlignment="center" class="mdi text-light-red p-5" fontSize="30%" :text="'mdi-delete' | fonticon"></Label>
              </Ripple>
            </GridLayout>
          </StackLayout>
        </ScrollView>
      </PullToRefresh>
    </GridLayout>
  </page>
</template>

<script>
export default {
  name: "PartnersList",
  data() {
    return {
      option: {},
      partners: [],
      isLoading: false
    };
  },
  mounted() {
    this.GetPartnersForBusiness();
    this.option = {
      link: "/business/add/partner",
      props: {
        businessId: this.businessId,
        businessName: this.businessName
      }
    };
  },
  props: ["businessName", "businessId"],
  methods: {
    refreshList(args) {
      this.GetPartnersForBusiness(args);
    },
    GetPartnersForBusiness(args = null) {
      this.isLoading = true;
      this.$api
        .getPartners(this.businessId)
        .then(partners => {
          if (args) {
            args.object.refreshing = false;
          }
          this.isLoading = false;
          this.partners = partners;
        })
        .catch(err => {
          if (args) {
            args.object.refreshing = false;
          }
          this.isLoading = false;
          this.$feedback.error({
            title: "Unable to load your partners",
            message: "Please try again later"
          });
        });
    },
    RemovePartner(partner) {
      confirm({
        title: "Are you sure you want to remove this partner?",
        message: "This can not be recovered",
        okButtonText: "Yes",
        cancelButtonText: "No"
      }).then(result => {
        if (result) {
          this.isLoading = true;
          this.$api
            .unassignFromBusiness(partner._id, this.businessId)
            .then(partners => {
              this.isLoading = false;
              this.partners = this.partners.filter(v => v._id != partner._id);
            })
            .catch(err => {
              this.isLoading = false;
              this.$feedback.error({
                title: "Unable to remove the partner",
                message: "Please try again later"
              });
            });
        }
      });
    },
    GoTo(option) {
      if (option.link) {
        this.navigate(option.link, option.props);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
</style>