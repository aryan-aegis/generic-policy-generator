// File system
import fs from 'fs';
// import node-fetch
import fetch from 'node-fetch';

// Import node-machine-id
import pkg from 'node-machine-id';
const { machineId, machineIdSync } = pkg;

// Locate chrome
import locateChrome from 'locate-chrome';

// Command line args
import commandLineArgs from 'command-line-args';

// Credentials
import credentials from './credentials.js';
// Errors
import { CREDS_NOT_FOUND } from './errors.js';
import path from 'path';

// ? Script functions

// Function to get chrome executable path
const getChromePath = async () => {
  const chromePath = await new Promise((resolve) =>
    locateChrome((arg) => resolve(arg))
  );

  return chromePath;
};

// Function to delay execution by a set time
const delay = (callback, timeout) => {
  return new Promise((resolve) => setTimeout(() => {
    resolve(callback());
  }, timeout));
};

// Function to extract cmd params
const getCmdParams = () => {
  const paramDefinition = [
    { name: 'taskID', type: String },
    { name: 'chassisNumber', type: String },
  ];
  
  const cmdParams = commandLineArgs(paramDefinition);

  const taskId = cmdParams.taskID.split('/').pop().trim();

  const params = {
    taskId,
    chassisNumber: cmdParams.chassisNumber
  };

  return params;
};

// Function used for rounding off numbers
const roundToDecimal = (num, decimal = 2) => {
  const rounded = Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal);
  return rounded;
};

// Function to get insurer credentials
const getCredentials = async(insurer, branch) => {

  const getCredsUrl = 'https://wandering-overcoat-duck.cyclic.app/aegiscovenant/generic-credentials';

  const jsonBody = JSON.stringify({
    branch: branch,
    insurer : insurer
  });
  
  const data = await fetch(getCredsUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: jsonBody
  });

  const creds = await data.json();

  try {
    // Return creds
    return creds;
  } catch (error) {
    // Return Error
    throw new Error(CREDS_NOT_FOUND);
  }

  // if (credentials?.[insurer]?.[branch]) {
  //   return credentials[insurer][branch];
  // } else {
  //   throw new Error(CREDS_NOT_FOUND);
  // }
};

// ? DOM Functions

// Function to click an element in the DOM
const domClickElement = async (page, selector) => {
  await page.waitForSelector(selector);
  await page.evaluate((selector) => {
    document.querySelector(selector).click();
  }, selector);
};

// Function to check if an element exists in the DOM
const checkElementExists = async (page, selector) => {
  return await page.evaluate((selector) => {
    const exists = document.querySelector(selector) ? true : false;
    return exists;
  }, selector);
};

// Function to get the value of an element
const getElementValue = async (page, selector, numeric = false, type = 'input') => {
  const getValue = (selector, type) => {
    return page.evaluate((selector, type) => {
      const value = type === 'input'
                    ? document.querySelector(selector).value
                    : document.querySelector(selector).innerText;
      return value;
    },selector, type);
  };

  await page.waitForSelector(selector);
  const rawValue = await getValue(selector, type);
  const value = numeric ? roundToDecimal(parseFloat(rawValue)) : rawValue;
  return value;
};

// Function to set the value of an element
const setElementValue = async(page, selector, elementValue) => {
  await page.waitForSelector(selector);
  await page.evaluate((selector, elementValue) => {
    document.querySelector(selector).value = elementValue;
  }, selector, elementValue);
};

// Function to check if dropdown options are loaded
const dropdownOptionsLoaded = async (page, selector, minOptionsCount = 1) => {
  await page.waitForFunction((selector, minOptionsCount) => {
    const options = document.querySelectorAll(`${selector} option`);
    return options.length >= minOptionsCount;
  }, {}, selector, minOptionsCount);
};

// Function to select a value in dropdown by its label
const selectDropdownOptionByLabel = async (page, selector, value, minOptions = 2) => {
  const getDropdownValueByLabel = (selector, value) => {
    return page.evaluate(
      (selector, value) => {
        const makes = document.querySelector(selector);
        const options = makes.options;
        for (const option of options) {
          if (option.value && option.innerText === value) {
            return option.getAttribute('value');
          }
        }
      },
      selector,
      value
    );
  };

  await dropdownOptionsLoaded(page, selector, minOptions);
  const optionValue = await getDropdownValueByLabel(selector, value);
  await page.select(selector, optionValue);
};

// ? File handling

// Function to check if a file exists
const checkFileExists = async (path, pollingInterval = 100, duration = 120000) => {
  for (let time = pollingInterval; time <= duration; time += pollingInterval) {
    const exists = await delay(() => {
      const exists = fs.existsSync(path);
      if (exists) {
        return true;
      }
    }, pollingInterval);
    if (exists) return exists;
  }

  return false;
};

// Function to get base 64 buffer of a file
const getFileBase64 = async (path) => {
  const data = fs.readFileSync(path, 'base64', (err) => {
    if (err) throw new Error(err);
  });

  return data;
};

// Function to get machine id
const getMachineId = async () => {
  const id = await machineId({original: true});
  const idSync = machineIdSync({original: true});
  if (id === idSync) {
    return id;
  } else {
    throw new Error('Cannot get SYSTEM UNIQUE ID');
  }
};

const getDriveCreds = async () => {
  const data = await fetch('https://wandering-overcoat-duck.cyclic.app/aegiscovenant/drive-credentials');
  
  const creds = (await data.json());
  fs.writeFileSync('./driveCredentials.json', (creds), (err) => {
    throw new Error('Error in downloading KYC Documents');
  });
  return true;
};


// Function to add created by
const getCreatedBy = async () => {
  const machineId = {
    '8bd9d0cd-36dd-5dfd-ac58-b77290f038f7': 'KAPIL VASHIST',
    'eb9d4b76-bdfe-420a-8586-9388f79f9e6e': 'DEEPIKA',
    '6b4108a9-89de-401f-ba3f-cda47da74c0c': 'SHASHANK',
    '94e903d1-f11f-44cd-9610-83eb2a0e5e82': 'MUKUL',
    '0f276681-42ef-4de2-9621-7be2d0509ea0': 'VIKASH',
    '0cd75041-1a17-41d6-932c-570107efdc5a': 'GAGAN'
  };

  const systemId = await getMachineId();

  if (machineId[systemId]) {
    return machineId[systemId];
  } else {
    return 'ARVIND / GAURAV';
  }
  
};

// Function to delete google drive creds
const deleteGoogleDriveCredsFile = async () => {
  fs.unlinkSync(path.resolve('driveCredentials.json'), (err) => {
    console.log('Errror in Deleting Google Drive Creds File.');
  });
};

export {
  delay,
  getChromePath,
  getCmdParams,
  roundToDecimal,
  getCredentials,
  domClickElement,
  checkElementExists,
  getElementValue,
  setElementValue,
  dropdownOptionsLoaded,
  selectDropdownOptionByLabel,
  checkFileExists,
  getFileBase64,
  getCreatedBy,
  getDriveCreds,
  deleteGoogleDriveCredsFile
};
