//#region Request Configs
const reCaptcha = {
  'request_config': {
    'method': 'POST',
    'url': 'https://api.anti-captcha.com/createTask',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  },
  'body_schema': {
    'clientKey': '' ,
    'task': {
      'type': 'RecaptchaV2TaskProxyless',
      'websiteURL': '',
      'websiteKey': ''
    }
  }
}

const validateReCaptcha = {
  'request_config': {
    'method': 'POST',
    'url': 'https://api.anti-captcha.com/getTaskResult',
    'headers': {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  },
  'body_schema': {
    'clientKey': '',
    'taskId': ''
    }
}
//#endregion

//#region Module Exports
module.exports = {
  reCaptcha,
  validateReCaptcha
}
//#endregion
