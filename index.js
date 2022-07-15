const { reCaptchaCrack, validateCaptcha, textCaptchaCrack } = require('./lib/captchaLib');
const fetch = require('node-fetch');

//#region Global Functions
const resolveRecaptcha = async (captchaOptions) => {
  return new Promise(async (resolve, reject) => {
    const initCaptcha = await reCaptchaCrack(captchaOptions);
    const validateResult = await validateCaptcha(captchaOptions, initCaptcha);
    const result = {
      resolved: validateResult.cracked,
      responseToken: validateResult.responseToken,
      duration: validateResult.time,
    }
    resolve(result);
  });
}

const resolveTextCaptcha = async (captchaOptions) => {
  return new Promise(async (resolve, reject) => {
    const initCaptcha = await textCaptchaCrack(captchaOptions);
    const validateResult = await validateCaptcha(captchaOptions, initCaptcha);
    const result = {
      resolved: validateResult.cracked,
      responseToken: validateResult.responseToken,
      duration: validateResult.time,
    }
    resolve(result);
  });
}

const getCookies = async (url) => {
  try {
    let result;
    const response = await fetch(url);
    if(response.headers.raw()['set-cookie']){
      result = {
        cookies: response.headers.raw()['set-cookie'],
      }
    } else {
      result = {
        cookies: null
      }
    }
    
    return result
  } catch (error) {
    console.log('error :>> ', error); 
  }
}

const validateCamposImagen = (imagen_id, camposInput, camposCatalogo) => {
  return new Promise((resolve, reject) => {
    const route = 'AJV Pre Validator'
    const list = camposInput.filter(element => !!element.campo)
    if(list.length < camposCatalogo.length){
      const missingFields = camposCatalogo.filter(({ campo: campoCatalogo }) => !camposInput.some(({ campo: campoInput }) => campoInput === campoCatalogo));
      reject({ imagen_id, route, error: `Faltan campos en imagen` });
    } else {
      resolve(true)
    }
  }); 
}

const getCamposTicket = (inputCampos, endpointCampos) => {
  let fields = {}
  const camposValores = endpointCampos.map((field) =>{
    return inputCampos.find((element) => element.campo == field);
  });
  for (let i = 0; i < camposValores.length; ++i){
    fields[endpointCampos[i]] = camposValores[i];
  }
  return fields;
}

const rfcSplitter = (rfc) => {
  const words = rfc.match(/^.{0,3}/gi)[0];
  const date = rfc.match(/[0-9A-Fa-f]{6}/g)[0];
  const key = rfc.match(/.{3}$/gi)[0];
  return {words, date, key}
}

const capWord = (word) => {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
//#endregion

//#region Walmart Functions 
const walmartGetCardCode = (paymentMethod) => {
  let paymentCode;
  if(paymentMethod.valor.toLowerCase().includes('debito') || paymentMethod.valor.toLowerCase().includes('mastercard')) paymentCode = '28'
  if(paymentMethod.valor.toLowerCase().includes('credito') || paymentMethod.valor.toLowerCase().includes('american')) paymentCode = '04'
  if(paymentMethod.valor.toLowerCase().includes('monedero')) paymentCode = '05'
  return paymentCode;
}

const walmartFilterTransactionId = (transactionId) => {
  const result = transactionId.match(/\b\d{5}\b/g)
  if(result){
  return result[0];
  }
  return 0;
}

const walmartFilterTicketId = (ticketId) => {
  const result = ticketId.match(/\d{19,}/g)
  if (result) {
    return result[0];    
  } else {
    return 0;
  }
}
//#endregion

//#region Mefacturo Functions 
const mefacturoGetFacturaId = (root) => {
  const data = root.getElementsByTagName('a');
  const arr = data[0].rawAttrs.split('/').slice(-1);
  const result = arr[0].split('?').shift()
  return result;
}
//#endregion

//#region Alsea Functions 
const alseaParseDate = (date, operador) => {
  const dateFormat = date.includes('/') ? true : false
  let arr;
  let newDate;
  if (dateFormat){
    arr = date.split('/');
  } else {
    arr = date.split('-')
  }
  switch (operador) {
    case 'Starbucks':
      arr[0] == '2022' ? newDate = arr[0] + '-' + arr[1] + '-' + arr[2] : newDate = arr[2] + '-' + arr[1] + '-' + arr[0];
      break;
    case 'Dominos':
      arr[0] == '2022' ? newDate = arr[0] + '-' + arr[1] + '-' + arr[2] : newDate = arr[2] + '-' + arr[0] + '-' + arr[1];
      break;
    case 'BurgerKing':
      arr[0] == '2022' ? newDate = arr[0] + '-' + arr[1] + '-' + arr[2] : newDate = arr[2] + '-' + arr[1] + '-' + arr[0];
      break;
  }
  return newDate;
}

const alseaParseMessage = (message) => {
  const arr  = message.split('\n\r');
  let newMessage;
  if(arr[1] == undefined){
    newMessage = arr[0]
  } else {
    newMessage = arr[0] + " " + arr[1]
  }
  return newMessage;
};

const alseaGetInvoiceDownloadable = (root) => {
  const data = root.getElementsByTagName('a');
  const pdfData = data[0].rawAttrs.match(/http.*(?=')/g);
  const xmlData = data[1].rawAttrs.match(/http.*(?=')/g);
  const pdfEndpoint = pdfData[0];
  const xmlEndpoint = xmlData[0];
  return {pdfEndpoint, xmlEndpoint};
}
//#endregion

module.exports = {
  resolveRecaptcha,
  getCookies,
  rfcSplitter,
  resolveTextCaptcha,
  validateCamposImagen,
  getCamposTicket,
  capWord,
  walmartGetCardCode,
  walmartFilterTransactionId,
  walmartFilterTicketId,
  mefacturoGetFacturaId,
  alseaParseDate,
  alseaParseMessage,
  alseaGetInvoiceDownloadable
}