/* eslint-disable no-useless-escape */
/* eslint-disable no-undef */
const axios = require('axios');
const pdf = require('pdf-parse');

const scrapper = async (text, policyType = 'od1tp5') => {
  const finalOutput = {};

  if (policyType === 'od1tp5' || policyType == 'od1tp1') {
    const splitText = text.split('OWN DAMAGE(A)');
    const removeNewLine = splitText[1]
      .replace(/,/g, '')
      .replace(/(\r\n|\n|\r)/gm, '');
    const addNewLine = removeNewLine.replace(
      /[+-]?([0-9]*[.])?[0-9]+/g,
      '$&\n'
    );
    const splitByNumber = addNewLine.split('\n');

    splitByNumber.forEach((element) => {
      element = element.trim();
      const splitLabelAndValue = element.match(
        /\b([^\d\.]+)\b|\b(\d+\.\d+)\b/g
      );
      if (splitLabelAndValue.length > 1) {
        finalOutput[splitLabelAndValue[0].trim()] =
          splitLabelAndValue[splitLabelAndValue.length - 1];
      }
    });
  } else {
    const splitText = text.split('OWN DAMAGE');
    const removeNewLine = splitText[1]
      .replace(/,/g, '')
      .replace(/(\r\n|\n|\r)/gm, '');
    const addNewLine = removeNewLine.replace(
      /[+-]?([0-9]*[.])?[0-9]+/g,
      '$&\n'
    );
    const splitByNumber = addNewLine.split('\n');

    splitByNumber.forEach((element) => {
      const splitLabelAndValue = element.match(
        /\b([^\d\.]+)\b|\b(\d+\.\d+)\b/g
      );
      // console.log(splitLabelAndValue);
      if (
        splitLabelAndValue !== 'null' &&
        splitLabelAndValue !== null &&
        splitLabelAndValue.length > 1
      ) {
        finalOutput[splitLabelAndValue[0].trim()] =
          splitLabelAndValue[splitLabelAndValue.length - 1];
      }
    });
  }

  return finalOutput;
};

const extractPDF = async (url, policyType) => {
  const fileData = await axios.get(
    url,
    { responseType: 'arraybuffer' },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/pdf'
      }
    }
  );

  const textData = pdf(fileData.data);
  const fileText = (await textData).text;
  const fieldsJson = await scrapper(fileText, policyType);
  return fieldsJson;
};

module.exports = extractPDF;
