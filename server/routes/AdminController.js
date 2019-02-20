var express = require("express");
var router = express.Router();
const auth = require("../config/auth");

import mongoose from "mongoose";
// import the models
import Admin from "../models/Admin";
import Document from "../models/Document";
import Business from "../models/Business";
import Transaction from "../models/Transaction";
import Bug from "../models/Bug";
import Rent from "../models/Rent";
import Student from "../models/Student";
import User from "../models/User";
import FCM from "../services/FirebaseManager";
import helper from "../services/Helper";
import SMSProvider from "../services/SMSProvider"
const smsProvider = new SMSProvider();

/*
  TODO : Add admin
         Remove Admin
         Log in admin
         Get stats involving the admin
                - Notifications sent
                - 
*/

router.get("/all", auth.required, (req, res, next) => {
    Admin.find({}, "-pass ")
        .populate(["documents"])
        .populate(["notifications"])
        .then(admins => {
            if (admins == null) res.send("Error : 9032rtu834g9erbo");
            res.json(admins);
        });
});

router.post("/block/user/:adminID", auth.required, (req, res, next) => {
    var adminID = req.params.adminID;
    Admin.findById(adminID).then(admin => {
        if (admin == null) res.status(512).send("User not found");
        admin.removed = true;
        admin.save(function () {
            User.deleteMany({
                    adminID: admin._id
                })
                .then(t => {
                    FCM.sendToUser(
                            admin._id,
                            helper.makePayload("", "", {
                                link: "/home",
                                props: null,
                                deactive: "true"
                            })
                        )
                        .then(v => {
                            res.send("Removed the user.");
                        })
                        .catch(err => {
                            throw err;
                        });
                })
                .catch(err => {
                    res.status(512).send(err.message);
                });
        });
    });
});

router.get(
    "/get/by/contactnumbers/:contactNumbers",
    auth.required,
    (req, res, next) => {
        var contactNumbers = req.params.contactNumbers;
        Admin.findOne({
                    numbers: contactNumbers
                },
                "_id userName fullName email"
            )
            .then(admin => {
                return res.json(admin);
            })
            .catch(err => {
                return res.status(512).send("Failed to find user, try again later");
            });
    }
);

router.get("/GetById/:adminID", function (req, res) {
    var adminID = req.params.adminID;
    Admin.findById(adminID)
        .populate(["documents"])
        .populate(["notifications"])
        .then(admin => {
            if (admin == null) {
                res.status(512).send("Invalid user");
            } else {
                res.json(admin);
            }
        })
        .catch(err => {
            res.status(512).send("Unable to log you in");
        });
});

router.post("/login", auth.disabled, (req, res, next) => {
    if (req.body.useEmail) {
        Admin.findOne({
                email: req.body.email,
                pass: req.body.pass
            })
            .populate(["documents"])
            .populate(["notifications"])
            .then(admin => {
                if (admin == null) {
                    res.status(512).send("Incorrect log in details");
                } else {
                    res.json(admin);
                }
            });
    } else {
        Admin.findOne({
                numbers: req.body.numbers,
                pass: req.body.pass
            })
            .populate(["documents"])
            .populate(["notifications"])
            .then(admin => {
                if (admin == null) {
                    res.status(512).send("Incorrect log in details");
                } else {
                    res.json(admin);
                }
            });
    }
});

router.post("/add", async (req, res) => {
    let admin = new Admin({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        pass: req.body.pass,
        numbers: req.body.numbers,
        role: req.body.role.toUpperCase(),
        userName: req.body.username,
        fullName: req.body.fullName
    });

    if (req.body.partnerID) {
        var _admin = await Admin.findById(req.body.partnerID);
        if (_admin) {
            admin = _admin;
        }
    }

    admin.save(async function (err) {
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
            return res.status(512).send("Unable to save changes, try again later");
        }
        if (req.body.businessID && req.body.adminID) {
            Business.findById(req.body.businessID, {
                    logo: 0,
                    transactions: 0,
                    settings: 0,
                    categories: 0,
                    targets: 0
                })
                .then(business => {
                    if (business == null)
                        return res
                            .status(512)
                            .send("User is saved, but can't link to a business");
                    if (!business.admin.some(v => v.id == admin._id)) {
                        business.admin.push({
                            id: admin._id,
                            assignedBY: req.body.adminID,
                            authority: admin.role && admin.role.toUpperCase()
                        });
                    }
                    business.save(async (err) => {
                        if (err) return res.status(512).send(err);
                        // We just return to the client only , but execution continues
                        res.send("Client successfully linked to business");
                        // JS <love> , by now the client got the response already, we are just sending out notifications and staff now

                        var payload = helper.makePayload(`${business.name} got a new ${admin.role}`, `${admin.userName} is added as a ${admin.role} for ${business.name}`, {
                            link: `/profile/view`,
                            props: admin._id,
                            deactive: 'true'
                        });
                        business.admin.filter(ba => ba.authority != "CLIENT").forEach(bb => {
                            FCM.sendToUser(bb._id, payload);
                        });

                        if (!req.body.partnerID) {
                            try {
                                var message = `Hi ${admin.fullName} ${admin.userName} and welcome to JMRSquared. \n\nYou have been added as a ${admin.role} of a business called ${business.name}\n\nUse the following details to login \n\nContact Numbers: ${req.body.numbers}\n\nPassword: ${admin.pass}`;
                                var smsResponse = await smsProvider.sendSMS(req.body.numbers, message);
                                if (smsResponse) {
                                    var payload2 = helper.makePayload(`Your new ${admin.role} was notified successfully`, `We sent an sms to ${admin.fullName ? admin.fullName : admin.userName } with their login details to the system.`, {
                                        link: ``,
                                        props: "",
                                        deactive: 'true'
                                    });
                                    FCM.sendToUser(req.body.adminID, payload2);
                                } else {
                                    throw new Error(Error);
                                }
                            } catch (err) {
                                var payload2 = helper.makePayload(`Unable to notify ${admin.fullName ? admin.fullName : admin.userName }`, `We were unable to sent an sms to ${admin.fullName ? admin.fullName : admin.userName } that contains their login details to the system.`, {
                                    link: ``,
                                    props: "",
                                    deactive: 'true'
                                });
                                FCM.sendToUser(req.body.adminID, payload2);
                            }
                        }
                    });
                })
                .catch(err => {
                    return res
                        .status(512)
                        .send(
                            "User is saved, but can't link to a business , " + err.message
                        );
                });
        } else {
            return res.send(admin._id);
        }
    });
});

router.post("/device/token/add", function (req, res) {
    var adminID = req.body.adminID;
    var deviceToken = req.body.deviceToken;
    var deviceInfo = req.body.deviceInfo;

    Admin.findById(adminID)
        .then(admin => {
            if (admin == null) {
                return res.status(512).send("Invalid user");
            }
            if (!admin.deviceTokens) {
                admin.deviceTokens = new Array();
            }

            var exist = admin.deviceTokens.filter(
                v => v.token == deviceToken && !v.removed
            ).length;
            if (exist == 0) {
                admin.deviceTokens.push({
                    date: Date.now(),
                    token: deviceToken,
                    deviceInfo: deviceInfo
                });
                admin.save(function (err) {
                    if (err) return res.status(512).send(err);
                    return res.send("Successfully added the new token");
                });
            } else {
                return res.send("Token was already linked to user");
            }
        })
        .catch(err => {
            return res.status(512).send(err.message);
        });
});

router.get("/bug/get/:bugId", function (req, res) {
    var bugID = req.params.bugId;
    Bug.findById(bugID).then(bug => {
        if (bug == null) {
            res.status(512).send("Invalid request");
        } else {
            res.json(bug);
        }
    });
});

router.get("/bug/all", function (req, res) {
    Bug.find({}, "_id senderName senderPic bugText date").then(bugs => {
        if (bugs == null) {
            res.status(512).send("Error : 9032rtu834g9erbo");
        }
        bugs.reverse();
        res.json(bugs);
    });
});

router.post("/bug/add", function (req, res) {
    var bug = new Bug({
        _id: mongoose.Types.ObjectId(),
        senderName: req.body.senderName,
        senderPic: req.body.senderPic,
        bugText: req.body.bugText
    });

    bug.save(function (err) {
        if (err) {
            res.status(512).send(err);
        }
        res.send("Bug added successfully saved");
    });
});

router.get("/document/get/:documentId", function (req, res) {
    var documentID = req.params.documentId;
    Document.findById(documentID).then(document => {
        if (document == null) {
            res.status(512).send("Invalid request");
        } else {
            res.json(document);
        }
    });
});

router.get("/document/all", function (req, res) {
    Document.find({}, "_id title description type date").then(documents => {
        if (documents == null) {
            res.status(512).send("Error : 9032rtu834g9erbo");
        }
        documents.reverse();
        res.json(documents);
    });
});

router.post("/document/add", function (req, res) {
    var document = new Document({
        _id: mongoose.Types.ObjectId(),
        title: req.body.title,
        adminID: req.body.adminID,
        location: req.body.location,
        thumbnail: req.body.thumbnail,
        description: req.body.description,
        type: req.body.type
    });

    document.save(function (err) {
        if (err) {
            res.status(512).send(err);
        }
        res.send("Document added successfully saved");
    });
});

// This function will soon be abolute (it returns for properties only)
router.get("/transaction/all", function (req, res) {
    Transaction.find({
                $or: [{
                        source: "PROPERTY"
                    },
                    {
                        source: null
                    }
                ]
            },
            "_id adminID amount type rentTenantName rentMonth description date"
        )
        .populate("adminID", "userName")
        .then(transactions => {
            if (transactions == null) {
                res.status(512).send("Error : 9032rtu834g9erbo");
            }
            transactions.reverse();
            res.json(transactions);
        })
        .catch(err => {
            res.status(512).send("Error : " + err.message);
        });
});

// This is the new function to be used
router.get("/transaction/:source/all", function (req, res) {
    var source = req.params.source.toUpperCase();
    Transaction.find({
                source: source
            },
            "_id adminID amount type itemCount carName propertyName productName source rentTenantName rentMonth description date"
        )
        .populate("adminID", "userName")
        .then(transactions => {
            if (transactions == null) {
                res.status(512).send("Error : 9032rtu834g9erbo");
            }
            transactions.reverse();
            res.json(transactions);
        });
});

router.get("/notifications/all", function (req, res) {
    Notification.find({
        dueDate: null
    }).then(result => {
        if (result == null) {
            res.status(400);
            res.send("Error : 9032egrrtu834g9erbo");
        }

        res.json(result);
    });
});

module.exports = router;