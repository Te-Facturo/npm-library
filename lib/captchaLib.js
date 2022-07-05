//#region File Dependencies 
const axios = require('axios');
let request_promise = require('request-promise').defaults({ encoding: null });
const delay = require('delay');
const reqOptions = require('./reqConfig');
//#endregion

//#region Captcha Functions
const reCaptchaCrack = async (captchaOptions) => {
  //#region validateCaptcha Request Build
    const captcha_crack_request = {...reqOptions.reCaptcha.request_config};
    const captchaCrack_data = {...reqOptions.reCaptcha.body_schema};
  //#endregion
  //#region validateCaptcha Body-data Build
    captchaCrack_data.clientKey = captchaOptions.captchaClientKey;
    captchaCrack_data.task.websiteURL = captchaOptions.websiteUrl;
    captchaCrack_data.task.websiteKey = captchaOptions.websiteCaptchaKey;
  captcha_crack_request.data = JSON.stringify(captchaCrack_data);
  //#endregion
  try {
    const resp = await axios(captcha_crack_request);
    const init_captcha_time = Date.now();
    const result = {
      result: resp.data, 
      init_captcha_time
    }
    return result;
  } catch (error) {
    console.log('reCaptchaCrack error :>> ', error);
  }
};


const textCaptchaCrack = async (captchaOptions) => {
  //#region validateCaptcha Request Build
    const text_captcha_crack_request = {...reqOptions.textCaptcha.request_config};
    const text_captchaCrack_data = {...reqOptions.textCaptcha.body_schema};
  //#endregion
  const imgCoded = await getCaptchaImg(captchaOptions.imgUrl);
  //#region validateCaptcha Body-data Build
    text_captchaCrack_data.clientKey = captchaOptions.captchaClientKey;
    text_captchaCrack_data.task.body = imgCoded;
  text_captcha_crack_request.data = JSON.stringify(text_captchaCrack_data);
  //#endregion
  try {
    const resp = await axios(text_captcha_crack_request);
    const init_captcha_time = Date.now();
    const result = {
      result: resp.data, 
      init_captcha_time
    }
    return result;
  } catch (error) {
    console.log('reCaptchaCrack error :>> ', error);
  }
};

const validateCaptcha = async (captchaOptions, initCaptcha) => {
  //#region Function Global Variables
    const captcha_tries= 15;
    const request_delay= 20000;
    let condition = true;
    let requestCounter = 0;
  //#endregion
  //#region validateCaptcha Request Build
    const validate_captcha_request = {...reqOptions.validateReCaptcha.request_config};
    const validateCaptcha_data = {...reqOptions.validateReCaptcha.body_schema};
  //#endregion
  //#region validateCaptcha Body-data Build
    validateCaptcha_data.clientKey = captchaOptions.captchaClientKey
    validateCaptcha_data.taskId = initCaptcha.result.taskId
  validate_captcha_request.data = JSON.stringify(validateCaptcha_data);
  //#endregion
  try {
    while (condition) {
      if(requestCounter === captcha_tries){
        return({ error: 'exceeded requests', requestCounter, request_delay });
      } else {
        const resp = await axios(validate_captcha_request);
        requestCounter === captcha_tries ? condition = false : requestCounter++;
        const {status, solution} = resp.data;
        console.log('status :>> ', status);
        if(status === "ready" && solution){
          const time = Date.now() - initCaptcha.init_captcha_time;
          let responseToken
          if(solution.text) responseToken = solution.text;
          if(solution.gRecaptchaResponse) responseToken = solution.gRecaptchaResponse;
          condition = false
          return({cracked: true, time, responseToken})
        } else if (status == undefined){       
          return({cracked: false, time, responseToken: status});
        }
      }
      await delay(request_delay);
    }
  } catch (error) {
    console.log('validateCaptcha error :>> ', error);
  }
};

const getCaptchaImg = async(imgUrl) => {
  return new Promise((resolve, reject) => {
    request_promise.get(imgUrl, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          const imgCoded = Buffer.from(body).toString('base64');
          // const buffer = Buffer.from(imgCoded, 'base64');
          // fs.writeFileSync("new-path.png", buffer);
          resolve(imgCoded)
      }
    });
  });
}
//#endregion

//#region Module Exports
module.exports = {
  reCaptchaCrack,
  textCaptchaCrack,
  validateCaptcha
}
//#endregion
