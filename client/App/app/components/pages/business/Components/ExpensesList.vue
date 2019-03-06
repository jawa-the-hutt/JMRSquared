<template>
  <page actionBarHidden="true">
    <GridLayout rows="auto,*,auto" backgroundColor="white">
      <CardView row="0" elevation="15">
        <GridLayout rows="auto,auto" columns="auto,*" class="bg-dark-blue p-10">
          <Ripple rowSpan="2" @tap="navigate(null)" verticalAlignment="center" borderRadius="50%">
            <Label verticalAlignment="center" textAlignment="center" class="mdi text-white p-5" fontSize="30%" :text="'mdi-arrow-left' | fonticon"></Label>
          </Ripple>
          <label class="p-x-15 text-white" fontSize="18%" col="1" text="Expenses"></label>
          <label row="1" class="p-x-15 text-white" verticalAlignment="center" fontSize="13%" col="1" :text="`Any known expense that ${businessName} pays`"></label>
        </GridLayout>
      </CardView>
      <Fab @tap="AddBusinessExpense" row="1" icon="res://ic_add_white_24dp" class="fab-button fixedBtn"></Fab>
  
      <StackLayout rowSpan="2" row="1" @tap="GetBusinessExpenses()" v-if="expenses.length == 0 && !isLoading" class="p-x-15 p-5 text-dark-black" verticalAlignment="center">
        <label textAlignment="center" class="mdi p-5" fontSize="50%" :text="'mdi-trending-down' | fonticon"></label>
        <label textAlignment="center" class="font-weight-bold text-dark-black p-5" fontSize="25%" :textWrap="true" text="No expenses yet!"></label>
        <label textAlignment="center" class="text-light-black p-5" fontSize="20%" :textWrap="true" text="Hit the + button to add known expenses"></label>
      </StackLayout>
      <ScrollView rowSpan="2" row="1">
        <StackLayout>
          <ActivityIndicator verticalAlignment="center" textAlignment="center" v-show="isLoading" :busy="isLoading"></ActivityIndicator>
          <Ripple v-show="!isLoading" class="p-15" v-for="(expense,i) in expenses" :key="i">
            <CardView elevation="10" margin="1">
              <GridLayout class="p-10" rows="auto,auto" columns="*,auto">
                <label row="0" col="0" fontSize="15%" class="p-x-15 font-weight-bold" :text="expense.title"></label>
                <label row="1" col="0" fontSize="15%" class="p-x-15 text-light-red" :text="`R${expense.value}`"></label>
                <Label row="1" col="1" textAlignment="right" fontSize="15%" textWrap="true" verticalAlignment="center" :text="`${expense.count} transactions`" />
              </GridLayout>
            </CardView>
          </Ripple>
        </StackLayout>
      </ScrollView>
      <CardView row="2" margin="15" v-if="expenses.filter(v => v.value) && expenses.filter(v => v.value).length > 0" elevation="20">
        <StackLayout>
          <GridLayout class="m-x-15 m-y-5" rows="auto,auto" columns="*,*">
            <label row="0" col="0" class="font-weight-bold" textAlignment="center" text="Total"></label>
            <label row="1" col="0" class="font-weight-bold text-light-red summaryStats" :text="`R${expenses.filter(v => v.value).map(v => v.value).reduce(add)}`" :class="{'visible':true}" fontSize="15%" vertialAlignment="center" textAlignment="center"></label>
            <label row="0" col="1" class="font-weight-bold" textAlignment="center" text="Transactions"></label>
            <label row="1" col="1" class="font-weight-bold text-light-red summaryStats" :text="expenses.filter(v => v.value).map(v => v.count).reduce(add)" :class="{'visible':true}" fontSize="15%" vertialAlignment="center" textAlignment="center"></label>
          </GridLayout>
        </StackLayout>
      </CardView>
    </GridLayout>
  </page>
</template>

<script>
export default {
  name: "ExpensesList",
  data() {
    return {
      expenses: [],
      isLoading: false
    };
  },
  mounted() {
    this.GetBusinessExpenses();
  },
  props: ["businessName", "businessId"],
  methods: {
    add(a, b) {
      return a + b;
    },
    GetBusinessExpenses() {
      this.isLoading = true;
      this.$api
        .getBusinessExpenses(this.businessId)
        .then(expenses => {
          this.isLoading = false;
          this.expenses = expenses;
        })
        .catch(err => {
          this.isLoading = false;
          this.$feedback.error({
            title: "Unable to load your expenses",
            duration: 4000,
            message: "Please try again later"
          });
        });
    },
    AddBusinessExpense() {
      prompt({
        title: `Add a new expense for ${this.businessName}`,
        message: "Please enter the name of the expense",
        okButtonText: "Save",
        cancelButtonText: "Cancel"
      }).then(result => {
        if (!result.text || result.text.length < 2) {
          this.$feedback.error({
            title: "Invalid expense",
            duration: 4000,
            message:
              "Please try again with a valid name like : Electricity or Rates"
          });
          return;
        }
        this.isLoading = true;
        this.$api
          .addBusinessExpense(this.businessId, result.text)
          .then(expenses => {
            this.GetBusinessExpenses();
          })
          .catch(err => {
            this.isLoading = false;
            this.$feedback.error({
              title: `Unable to add ${result.text} as an expense`,
              duration: 4000,
              message: "Please try again later"
            });
          });
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>