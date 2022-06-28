const { reCaptchaCrack } = require("./functions");

const resolveRecaptcha = async (captchaClientKey, websiteCaptchaKey, websiteUrl) => {
  const initCaptcha = await captchaCrack(captchaClientKey, websiteCaptchaKey, websiteUrl);
  // const result = {
    // responseToken: String,
    // duration: Int16Array,
    // resolved: Boolean,
  // }
  return initCaptcha;
}






module.exports = {
  resolveRecaptcha,
}