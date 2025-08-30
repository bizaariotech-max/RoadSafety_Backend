const { bool, boolean } = require("joi");
const mongoose = require("mongoose");

const _HPOptMas = new mongoose.Schema({
    HealthProfileQuesID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "hp_question_masters",
    },
    Option: { type: String },
    OptionValue: [{ type: String }],
    IsActive: { type: Boolean },
    ISInput: { type: Boolean },
    InputType: { type: String },
    NextQuestionID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "hp_question_masters",
    },
    SortOrder: { type: Number },
    MinAge: { type: Number },
    Gender: { type: String },
});

module.exports = mongoose.model("hp_option_master", _HPOptMas);
