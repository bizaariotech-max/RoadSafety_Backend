const { boolean } = require("joi");
const mongoose = require("mongoose");

const _HPQuesMas = new mongoose.Schema({
    HealthProfileCategoryID: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "admin_lookups",
    },
    Question: { type: String },
    QuestionType: { type: String },
    KeyBoardType: { type: String },
    IsActive: { type: Boolean },
    SortOrder: { type: Number },
    MinAge: { type: Number },
    Gender: { type: String },
    WeightAge: { type: Number },
});

module.exports = mongoose.model("hp_question_masters", _HPQuesMas);
