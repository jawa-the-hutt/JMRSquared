var express = require("express");
var router = express.Router();
const auth = require('../config/auth');

import mongoose from "mongoose";
import Admin from '../models/Admin';
import FCM from "../services/FirebaseManager";
import CronJob from "../services/CronManager";
import moment from "moment";
const cronJob = new CronJob();

router.get("/", async (req, res, next) => {
    var dbActive = false;
    var fcmID = null;
    var jobs = null;
    try {
        switch (mongoose.connection.readyState) {
            case 0:
                dbActive = 'disconnected'
                break;
            case 1:
                dbActive = 'connected'
                break;
            case 2:
                dbActive = 'connecting'
                break;
            case 3:
                dbActive = 'disconnecting'
                break;
        }
    } catch (ex) {

    }

    try {
        fcmID = FCM.getInstanceId();
    } catch (ex) {

    }

    try {
        jobs = cronJob.getTasks()
    } catch (ex) {

    }

    var upTime = moment().subtract(process.uptime(), 'seconds').fromNow();


    res.json({
        api: true,
        db: dbActive,
        fcmId: fcmID,
        dateTime: new Date(),
        upTime,
        jobs
    });
});
module.exports = router;