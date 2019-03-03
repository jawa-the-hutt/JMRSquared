const cron = require("node-cron");
import helper from "../services/Helper";
import FCM from "./FirebaseManager";
import mongoose from "mongoose";

import Notification from "../models/Notification";
import Setting from "../models/Setting";
import Business from "../models/Business";

export default class CronJob {
    constructor() {
        this.tasks = [];
    }

    schedule(
        interval,
        registrationToken,
        payload,
        toTopic = false,
        notificationID = null
    ) {
        console.log(
            "cron",
            `Scheduled a job (${interval}) to ${registrationToken}`
        );
        let task = cron.schedule(interval, () => {
            console.log("cron", "Performing the cron job....");
            if (toTopic) {
                FCM.sendToTopic(registrationToken, payload)
                    .then(v => {
                        if (notificationID) {
                            Notification.findById(notificationID)
                                .then(notification => {
                                    if (notification == null)
                                        throw "Scheduled notification does not exist (anymore) , " +
                                            notificationID;
                                    notification.status = "SENT";
                                    notification.save(function (err) {
                                        if (err)
                                            throw "Unable to save notification status change , " +
                                                err.message;
                                    });
                                })
                                .catch(err => {
                                    console.log("Notification status change", err);
                                });
                        }
                        console.log("cron", "Cron job done....");
                    })
                    .catch(err => {
                        console.log("cron", err);
                    });
            } else {
                FCM.sendToDevice(registrationToken, payload)
                    .then(v => {
                        if (notificationID) {
                            Notification.findById(notificationID)
                                .then(notification => {
                                    if (notification == null)
                                        throw "Scheduled notification does not exist (anymore) , " +
                                            notificationID;
                                    notification.status = "SENT";
                                    notification.save(function (err) {
                                        if (err)
                                            throw "Unable to save notification status change , " +
                                                err.message;
                                    });
                                })
                                .catch(err => {
                                    console.log("Notification status change", err);
                                });
                        }
                    })
                    .catch(err => {
                        console.log("cron", err);
                    });
            }
        });
        this.tasks.push(task);
    }

    getTasks() {
        return this.tasks;
    }

    // This is called on app.js (everytime the server starts)
    fireJobs() {
        this.resendNotifications();
        this.createIDForStaticFields();
        this.populateBusinessSettings();
        this.populateBusinessTargets();
        //this.clearTargets();
    }

    // A list of jobs that can be fired.
    resendNotifications() {
        Notification.find({
                status: "PENDING",
                scheduled: true,
                removed: false,
                expiryDate: {
                    $gte: Date.now()
                }
            })
            .populate("toId")
            .then(notifications => {
                if (notifications == null)
                    return console.log(
                        `Error while reading notifications to re-shedule.`
                    );
                console.log(`Re-scheduling ${notifications.length} notifications ....`);
                notifications.map(notification => {
                    var payload = helper.makePayload(
                        notification.title,
                        notification.body,
                        notification.data
                    );
                    if (notification.topic != null) {
                        this.schedule(
                            notification.scheduleInterval,
                            notification.topic,
                            payload,
                            true
                        );
                    } else if (notification.toId) {
                        if (
                            notification.toId.deviceTokens &&
                            notification.toId.deviceTokens.filter(d => !d.removed && d.token)
                            .length > 0
                        ) {
                            notification.toId.deviceTokens
                                .map(t => t.token)
                                .forEach(device_token => {
                                    this.schedule(
                                        notification.scheduleInterval,
                                        device_token,
                                        payload
                                    );
                                });
                        } else {
                            console.log(
                                `${
                  notification.toId.userName
                } was suppose to be sent a notification , but there is no device linked to them ....`
                            );
                        }
                    }
                });
            });
    }

    createIDForStaticFields() {
        Setting.findOne()
            .then(settings => {
                var count = 0;
                settings.settings.business
                    .filter(bs => !bs._id)
                    .forEach(victim => {
                        victim._id = mongoose.Types.ObjectId();
                        count++;
                    });

                settings.settings.user
                    .filter(bs => !bs._id)
                    .forEach(victim => {
                        victim._id = mongoose.Types.ObjectId();
                        count++;
                    });

                settings.options.businessTypes
                    .filter(bs => !bs._id)
                    .forEach(victim => {
                        victim._id = mongoose.Types.ObjectId();
                        count++;
                    });

                settings.save(function (err) {
                    if (err) throw err;
                    console.log(`${count} settings got new ids`);
                });
            })
            .catch(err => {
                throw err;
            });
    }

    async populateBusinessSettings() {
        Setting.findOne().then(settings => {
            const businessSettings = settings.settings.business;
            businessSettings.forEach(async businessSetting => {
                var businesses = await Business.find({
                    $or: [{
                            removed: false
                        },
                        {
                            removed: null
                        }
                    ]
                });
                businesses.forEach(async business => {
                    if (!business.settings) {
                        business.settings = [];
                    }
                    if (
                        !business.settings.some(
                            setting =>
                            setting.title == businessSetting.title &&
                            setting.description == businessSetting.description
                        )
                    ) {
                        business.settings.push(businessSetting);
                        var savedBuinessSetting = await business.save();
                    }
                });
            });
        });
    }

    clearTargets() {
        Business.find({
            $or: [{
                    removed: false
                },
                {
                    removed: null
                }
            ]
        }).then(businesses => {
            if (!businesses) throw new Error("Unable to find any business that matches");
            businesses.forEach(async business => {
                business.targets = [];
                var answer = await business.save();
                console.log(`Cleared ${business.name}`);
            });
        });
    }

    populateBusinessTargets() {
        Setting.findOne().then(async settings => {
            var targets = settings.targets;
            if (targets.find(t => !t._id)) {
                console.log(
                    "Business has no target",
                    `${targets.filter(t => !t._id).length} businesses`
                );
            }

            targets.forEach(target => {
                Business.find({
                        "targets._id": {
                            $ne: target._id
                        },
                        $or: [{
                                removed: false
                            },
                            {
                                removed: null
                            }
                        ]
                    })
                    .then(businesses => {
                        if (!businesses) throw "Unable to find any business that matches";
                        businesses.forEach(async business => {
                            if (
                                business.targets.filter(v => v._id == target._id).length == 0
                            ) {
                                business.targets.push(target);
                                var answer = await business.save();
                                if (answer) {
                                    console.log(
                                        `A business (${business.name}) got a new target ${
                      target.title
                    }`
                                    );
                                }
                            }
                        });
                        console.log(`All targets are in sync.`);
                    })
                    .catch(err => {
                        console.log("businessGettingError", err);
                    });
            });
        });
    }
}