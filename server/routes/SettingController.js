var express = require("express");
var router = express.Router();
const auth = require('../config/auth');
import mongoose from "mongoose";

import Setting from "../models/Setting";
import Business from "../models/Business";
import CronJob from "../services/CronManager";
const cronJob = new CronJob();

router.get("/options/business/types", function (req, res) {
  Setting.findOne()
    .then(settings => {
      if (!settings) return res.status(512).send("No settings are avaliable.");
      res.json(settings.options.businessTypes);
    })
    .catch(err => {
      return res.status(512).send("No settings are avaliable.");
    });
});

router.get("/options/business/settings", function (req, res) {
  Setting.findOne()
    .then(settings => {
      if (!settings) return res.status(512).send("No settings are avaliable.");
      res.json(settings.settings);
    })
    .catch(err => {
      return res.status(512).send("No settings are avaliable.");
    });
});

router.get("/cron/reboot", function (req, res) {
  cronJob.fireJobs();
  res.send("Cron rebooted, firing the jobs......");
});

router.post("/options/reset/all/business/settings", async (req, res) => {
  var businessID = req.body.businessID;
  var businesses = [];

  try {
    if (businessID == null) {
      businesses = await Business.find({}, {
        logo: 0,
        transactions: 0,
        settings: 0,
        categories: 0,
        targets: 0
      });
    } else {
      businesses.push(await Business.findById(businessID, {
        logo: 0,
        transactions: 0,
        settings: 0,
        categories: 0,
        targets: 0
      }));
    }
    var count = 0;
    businesses.forEach(async business => {
      business.settings = [];
      business.markModified("settings");
      var saved = await business.save();
    });
    Setting.findOne()
      .then(settings => {
        if (!settings) return res.status(512).send("No settings are avaliable.");
        settings.settings.business.forEach(setting => {
          setting.businessIDs = setting.businessIDs.filter(v => !businesses.some(t => t._id == v));
          settings.markModified("settings.business");
          settings.save(function (err) {
            if (err) return res.status(512).send("Can not save settings replaced.");
            return res.send("Applied changes to " + businesses.length);
          })
        });
      });
  } catch (err) {
    return res.status(512).send(err.message);
  }
});

module.exports = router;