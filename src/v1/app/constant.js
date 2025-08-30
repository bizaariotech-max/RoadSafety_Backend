// const GetENV = async (code) => {
//     const __ENV = await AdminEnvSetting.findOne({
//         EnvSettingCode: code,
//     });

//     return __ENV;
// };

const AssetHPQuestion = require("../../models/AssetHealthQuestion");

const AddHPAnswers = async (dataObject, AH_Profile) => {
  try {
    const {
      Question_ID,
      HP_Category_ID,
      Answers = [],
      StringAnswers = [],
      Options = {},
      Index,
    } = dataObject;
    const { _id } = AH_Profile;

    const check = await AssetHPQuestion.findOne({
      HealthProfileID: _id,
      HealthProfileCategoryID: HP_Category_ID,
      HPQuesID: Question_ID,
    });
    if (check) {
      await AssetHPQuestion.findByIdAndUpdate(check?._id, {
        Answers,
        StringAnswers,
        Options,
        Index,
      });
    } else {
      await AssetHPQuestion.create({
        HealthProfileID: _id,
        HealthProfileCategoryID: HP_Category_ID,
        HPQuesID: Question_ID,
        Answers,
        StringAnswers,
        Options,
        Index,
      });
    }
    return;
  } catch (error) {
    console.log(error);
    return;
  }
};

module.exports = {
  // GetENV,
  AddHPAnswers,
};
