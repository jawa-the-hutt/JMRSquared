var express = require("express");
var router = express.Router();
const auth = require("../config/auth");

import mongoose from "mongoose";
import Admin from "../models/Admin";
import Business from "../models/Business";
import Transaction from "../models/Transaction";
import FCM from "../services/FirebaseManager";
import CronJob from "../services/CronManager";
const cronJob = new CronJob();
import helper from "../services/Helper";

router.get("/all/for/:userid", auth.required, (req, res, next) => {
  var adminID = req.params.userid;
  Admin.findById(adminID)
    .then(admin => {
      if (admin == null)
        return res
          .status(512)
          .send("Admin of id " + adminID + " does not exist");
      Business.find(
        {
          "admin.id": adminID
        },
        {
          logo: 0,
          transactions: 0,
          settings: 0,
          categories: 0,
          targets: 0
        }
      ).then(businesses => {
        if (businesses == null)
          return res.status(512).send("Error : 9032rtu834g9erbo");
        res.json(businesses);
      });
    })
    .catch(err => {
      return res.status(512).send(err);
    });
});

router.get("/get/:business/for/:userid", auth.required, (req, res, next) => {
  var businessID = req.params.business;
  var adminID = req.params.userid;
  // TODO : Cache the business logo and not send it everytime
  Business.findById(businessID)
    .populate("admin.id", "_id userName fullName")
    .then(business => {
      if (business == null)
        return res.status(512).send("The requested business is not avaliable");
      if (!business.admin || !business.admin.some(a => a.id._id == adminID)) {
        return res
          .status(512)
          .send("You are not part of the requested business");
      }

      Transaction.find(
        {
          businessID: businessID,
          removed: false
        },
        "-proof"
      )
        .then(transactions => {
          var returnedBusiness = business.toObject();
          const revenues = helper.GetTransactionProfitAndRevenue(transactions);
          returnedBusiness.revenues = {
            date: new Date(),
            values: revenues
          };

          const currentTargets = helper.GetTransactionBusinessTargetsFromTransactions(
            business.targets,
            transactions
          );
          returnedBusiness.currentTargets = {
            date: new Date(),
            values: currentTargets
          };
          if (returnedBusiness.settings) {
            function onlyUnique(value, index, self) {
              return self.indexOf(value) === index;
            }
            returnedBusiness.settings = returnedBusiness.settings.filter(
              onlyUnique
            );
          }
          return res.json(returnedBusiness);
        })
        .catch(err => {
          console.log("err", err);
          return res.json(business);
        });
    })
    .catch(err => {
      return res.status(512).send(err);
    });
});

router.post("/set/business/:type", auth.required, (req, res, next) => {
  var businessID = req.body.businessID;
  var value = req.body.value;
  var type = req.params.type;

  if (type == "settings") {
    var settingID = req.body.settingID;
    Business.findById(businessID, {
      logo: 0,
      transactions: 0,
      categories: 0,
      targets: 0
    })
      .then(business => {
        if (!business)
          return res
            .status(512)
            .send("The requested business is not avaliable");

        if (business.settings.some(s => s._id == settingID)) {
          business.settings.find(s => s._id == settingID).value = value;
          business.markModified("settings");
        } else if (
          business.settings.some(
            s => s.additionals && s.additionals.some(v => v._id == settingID)
          )
        ) {
          business.settings.forEach(s => {
            s.additionals.find(v => v._id == settingID).value = value;
          });
          business.markModified("settings");
        } else {
          return res.status(512).send("Setting not changed, try again later.");
        }

        business.save(function(err) {
          if (err) return res.status(512).send(err);
          res.send("Business setting successfully saved");
        });
      })
      .catch(err => {
        return res.status(512).send(err);
      });
  } else if (type == "target") {
    var targetID = req.body.targetID;
    var enable = req.body.enable;
    Business.findById(businessID, {
      logo: 0,
      transactions: 0,
      settings: 0,
      categories: 0
    })
      .then(business => {
        if (!business)
          return res
            .status(512)
            .send("The requested business is not avaliable");

        business.targets.find(t => t._id == targetID).value = value;
        business.targets.find(t => t._id == targetID).enable = enable;

        business.markModified("targets");
        business.save(function(err) {
          if (err) return res.status(512).send(err);
          res.send("Business targets successfully saved");
        });
      })
      .catch(err => {
        return res.status(512).send(err);
      });
  } else {
    value = value && value[0].toUpperCase() + value.slice(1).toLowerCase();
    Business.findById(businessID, {
      logo: 0,
      transactions: 0,
      settings: 0,
      targets: 0
    })
      .then(business => {
        if (!business)
          return res
            .status(512)
            .send("The requested business is not avaliable");

        if (!business.categories.find(v => v == value)) {
          business.categories.push(value);
        }

        business.save(function(err) {
          if (err) return res.status(512).send(err);
          res.send(`Business ${type} successfully saved`);
        });
      })
      .catch(err => {
        return res.status(512).send(err);
      });
  }
});

router.get("/get/all/:type/for/:business", auth.required, (req, res, next) => {
  var businessID = req.params.business;
  var type = req.params.type;
  if (type == "partners") {
    Business.findById(businessID, {
      logo: 0,
      transactions: 0,
      settings: 0,
      categories: 0,
      targets: 0
    })
      .populate("admin.id", "-deviceTokens")
      .then(async business => {
        if (business == null)
          return res
            .status(512)
            .send("The requested business is not avaliable");
        if (!business.admin) res.json([]);
        var partners = business.admin
          .toObject()
          .map(b => b.id)
          .filter(b => b && b._id);

        for (const partner of partners) {
          var transaction = await Transaction.findOne(
            {
              client: mongoose.Types.ObjectId(partner._id)
            },
            "client date amount"
          );

          partner.lastEventDate = transaction ? transaction.date : null;
          partner.lastEventAmount = transaction ? transaction.amount : 0;
          partner.lastEventTitle = "Last payment";
        }
        res.json(partners);
      })
      .catch(err => {
        return res.status(512).send(err.message);
      });
  } else {
    type = type == "expenses" ? "MONEYOUT" : "MONEYIN";
    Transaction.find(
      {
        businessID: businessID
      },
      "-proof"
    )
      .then(transactions => {
        if (!transactions) transactions = [];
        var returnOBJs = [];
        transactions
          .filter(t => t.type == type)
          .forEach(transaction => {
            if (!returnOBJs.some(r => r.title == transaction.category)) {
              returnOBJs.push({
                title: transaction.category,
                value: Number(transaction.amount),
                count: 1
              });
            } else {
              returnOBJs.find(
                r => r.title == transaction.category
              ).value += Number(transaction.amount);
              returnOBJs.find(r => r.title == transaction.category).count += 1;
            }
          });
        Business.findById(businessID, {
          logo: 0,
          transactions: 0,
          settings: 0,
          targets: 0
        })
          .then(business => {
            business.categories
              .filter(v => !returnOBJs.find(t => t.title == v))
              .map(cat => {
                returnOBJs.push({
                  title: cat,
                  value: 0,
                  count: 0
                });
                return cat;
              });
            return res.json(returnOBJs);
          })
          .catch(err => {
            return res.json(returnOBJs);
          });
      })
      .catch(err => {
        console.log("err", err);
        return res.json(business);
      });
  }
});

router.post("/add/business", auth.required, (req, res, next) => {
  var adminID = req.body.adminID;
  var adminAuthority = req.body.adminAuthority;
  var _business = req.body.business;
  if (_business == null)
    return res
      .status(512)
      .send("Invalid request , make sure you have all the required attributes");

  Admin.findById(adminID)
    .then(admin => {
      if (admin == null)
        return res
          .status(512)
          .send("Admin of id " + adminID + " does not exist");
      var business = new Business({
        _id: mongoose.Types.ObjectId(),
        admin: [
          {
            id: adminID,
            authority: adminAuthority && adminAuthority.toUpperCase()
          }
        ],
        name: _business.name,
        logo: _business.logo,
        description: _business.description,
        type: _business.type
      });

      if (!business.name) {
        return res.status(512).send("A business name is required");
      }
      business.save(function(err) {
        if (err) {
          if (
            err.name == "ValidationError" &&
            err.errors &&
            Object.values(err.errors).some(v => v.message)
          ) {
            return res
              .status(512)
              .send(Object.values(err.errors).map(v => v.message)[0]);
          }
          return res
            .status(512)
            .send("Unable to save changes, try again later");
        }
        cronJob.populateBusinessSettings();
        cronJob.populateBusinessTargets();
        res.send(business._id);
      });
    })
    .catch(err => {
      return res.status(512).send(err);
    });
});

router.post("/remove/business", auth.required, async (req, res, next) => {
  var adminID = req.body.adminID;
  var businessID = req.body.businessID;

  try {
    var business = await Business.findById(businessID);
    if (business == null || !business.admin) {
      return res.status(512).send("Invalid business provided");
    }
    business.admin = business.admin.filter(b => b.id != adminID);
    business.save(function(err) {
      if (err) return res.status(512).send(err);
      res.send("Removed link from business");
    });
  } catch (err) {
    return res.status(512).send("Unable to remove business");
  }
});

router.post("/assign/to/business", auth.required, (req, res, next) => {
  var adminID = req.body.adminID;
  var adminAuthority = req.body.adminAuthority;
  var businessID = req.body.businessID;
  var assignedBY = req.body.assignedBY;
  if (businessID == null)
    return res
      .status(512)
      .send("Invalid request , make sure you have all the required attributes");
  Admin.findById(adminID)
    .then(admin => {
      if (admin == null)
        return res
          .status(512)
          .send("Admin of id " + adminID + " does not exist");

      Business.findById(businessID, {
        logo: 0,
        transactions: 0,
        settings: 0,
        categories: 0,
        targets: 0
      }).then(business => {
        if (business == null)
          return res.status(512).send("Error : 9032rtu834g9erbo");
        business.admin.push({
          id: adminID,
          assignedBY: assignedBY,
          authority: adminAuthority && adminAuthority.toUpperCase()
        });
        business.save(function(err) {
          if (err) return res.status(512).send(err);
          res.send("Client successfully linked to business");
        });
      });
    })
    .catch(err => {
      return res.status(512).send(err);
    });
});

// This is the newest function to be used
router.post(
  "/transactions/for/business/:businessId",
  auth.required,
  (req, res, next) => {
    var businessID = req.params.businessId;
    var existing = req.body.existing;
    if (!existing) existing = [];
    Transaction.find(
      {
        businessID: businessID,
        _id: {
          $nin: existing
        }
      },
      "-proof"
    )
      .sort({
        date: -1
      })
      .populate("adminID", "userName")
      .populate("client", "userName")
      .then(transactions => {
        if (transactions == null) {
          res.status(512).send("Error : 9032rtu834g9erbo");
        }
        res.json(transactions);
      })
      .catch(err => {
        res.send(err);
      });
  }
);

router.get(
  "/get/transaction/:transactionID",
  auth.required,
  (req, res, next) => {
    var transactionID = req.params.transactionID;
    Transaction.findById(transactionID)
      .populate("adminID", "userName")
      .populate("client", "userName")
      .then(transaction => {
        if (!transaction)
          return res.status(512).send("Transaction does not exist");
        return res.json(transaction);
      })
      .catch(err => {
        return res.status(512).send(err);
      });
  }
);

router.post("/transaction/add", auth.required, async (req, res, next) => {
  var transaction = new Transaction({
    _id: mongoose.Types.ObjectId(),
    adminID: req.body.adminID, //ForeignKey
    businessID: req.body.businessID,
    date: req.body.date,
    type: req.body.type.toUpperCase(),
    amount: req.body.amount,
    monthOfPayment: req.body.monthOfPayment,
    client: req.body.client,
    category: req.body.category,
    description: req.body.description,
    proof: req.body.proof
  });

  transaction.category =
    transaction.category &&
    transaction.category[0].toUpperCase() +
      transaction.category.slice(1).toLowerCase();

  var business = await Business.findById(transaction.businessID, {
    logo: 0,
    transactions: 0,
    settings: 0,
    targets: 0
  });
  if (!business) {
    return res.status(512).send("The provided business is not avaliable");
  }
  if (
    transaction.category &&
    !business.categories.find(v => v == transaction.category)
  ) {
    business.categories.push(transaction.category);
    business.save(function(err) {
      if (err) {
        return res
          .status(512)
          .send("The selected category is invalid, please try again");
      }
    });
  }

  var admin = await Admin.findById(transaction.adminID);
  if (!admin) {
    return res.status(512).send("The provided user is not avaliable");
  }

  var _client = null;
  if (transaction.client) {
    _client = await Admin.findById(transaction.client);
    if (!_client) {
      return res.status(512).send("The provided client is not avaliable");
    }
  }

  transaction.save(function(err) {
    if (err) return res.status(512).send(err);
    // TODO : Notify the other admins about this transaction.
    if (business && business.admin) {
      business.admin
        .filter(b => b.authority == "ADMIN")
        .map(b => {
          var title = `Money was ${
            transaction.type == "MONEYIN" ? "deposited into" : "withdrawn from"
          } ${business.name}`;
          var body = `R${transaction.amount} was ${
            transaction.type == "MONEYIN" ? "deposited" : "withdrawn"
          } by ${admin.userName} ${
            transaction.client ? "from " + _client.userName : ""
          } for ${transaction.category}`;
          var data = {
            link: "/open/transaction",
            props: JSON.stringify({
              businessID: transaction.businessID,
              transactionID: transaction._id
            })
          };
          FCM.sendToUser(b.id, helper.makePayload(title, body, data))
            .then(v => {
              console.log("Notifications success", v);
            })
            .catch(err => {
              console.log("Notifications error", err);
            });
          return b;
        });
    }

    return res.send("Transaction successfully saved");
  });
});

router.post("/remove/:businessId", auth.required, async (req, res, next) => {
  var businessID = req.params.businessId;
  try {
    var business = await Business.findById(businessID);
    if (!business) return res.status(512).send("Invalid business");
    business.removed = true;
    await business.save();
    return res.send("Business removed successfully");
  } catch (err) {
    return res.status(512).send(err.message);
  }
});

module.exports = router;
