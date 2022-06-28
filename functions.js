const request = require('request');

const reCaptchaCrack = async(captchaOptions, reqOptions) => {
  const captcha_crack_request = {...reqOptions.request_config};
  const captchaCrack_data = {...reqOptions.body_schema};
  //#region validateCaptcha Body-data Build
    captchaCrack_data.clientKey = captchaOptions.captchaClientKey;
    captchaCrack_data.websiteURL = captchaOptions.websiteUrl;
    captchaCrack_data.websiteKey = captchaOptions.websiteCaptchaKey;
  //#endregion
  captcha_crack_request.body = JSON.stringify(captchaCrack_data);
  return new Promise((resolve, reject) => {
    request(captcha_crack_request, function(requestErr, response){ 
      if(response.statusCode == 200){
        const init_captcha_time = Date.now();
        const result = JSON.parse(response.body)
        resolve({result, init_captcha_time})
      } else {
        reject({ error: `Error Request: ${requestErr}` });
      }
    })
  });
}

const validateCaptcha = async (initCaptcha, imagen_id) => {
  const route = validateCaptcha.name;
  const validate_captcha_request = {...http_request.validateCaptcha.request_config};
  const validateCaptcha_data = {...http_request.validateCaptcha.body_schema};
  //#region validateCaptcha Body-data Build
    validateCaptcha_data.clientKey = captchaClientKey
    validateCaptcha_data.taskId = initCaptcha.result.taskId
  //#endregion
  validate_captcha_request.body = JSON.stringify(validateCaptcha_data);
  return new Promise(async (resolve, reject) => {
    let condition = true;
    let requestCounter = 0;
    while (condition) {
      if(requestCounter === captcha_tries){
        reject({ imagen_id, route, error: 'exceeded requests', requestCounter, request_delay });
      } else {
        request(validate_captcha_request, function(requestErr, response){ 
          requestCounter === captcha_tries ? condition = false : requestCounter++;
          if(response.statusCode == 200){
            const {status, solution} = JSON.parse(response.body)
            console.log('status :>> ', status);
            if(status === "ready" && solution){
              const time = Date.now() - initCaptcha.init_captcha_time;
              captchaReponseKey = solution.gRecaptchaResponse;
              condition = false
              resolve({cracked: true, time})
            } else if (status == undefined){       
              reject({imagen_id, route, error: `Invalid Request status: ${status}` });
            }
          } else {
            reject({imagen_id, route, error: `Error Request: ${requestErr}` });
          }
        });
      }
      await delay(request_delay);
    }
  });
}

module.exports = {
  reCaptchaCrack,
  validateCaptcha,
}