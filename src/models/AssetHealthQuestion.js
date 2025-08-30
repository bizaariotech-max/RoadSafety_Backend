const mongoose = require("mongoose");

const _AssetHPQues = new mongoose.Schema(
    {
        HealthProfileID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "asset_health_profile",
        },
        HealthProfileCategoryID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "admin_lookups",
        },
        HPQuesID: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "hp_question_masters",
        },
        WeightAge: { type: Number },
        Index: { type: Number },
        Answers: [
            {
                type: mongoose.SchemaTypes.ObjectId,
                ref: "hp_option_master",
            },
        ],
        StringAnswers: [
            {
                type: String,
            },
        ],
        //Save Json object of the options chosen and input values (if anyinput value is required by the option)
        Options: { type: Object },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("asset_hp_questions", _AssetHPQues);
