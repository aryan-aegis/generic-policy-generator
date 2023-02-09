import axios from 'axios';
import extractPDF from './getPdfText.cjs';
import { google } from 'googleapis';
import dayjs from 'dayjs';
import fs from 'fs';
import discounts from '../../insurers/magma/assets/discounts.js';
import path from 'path';
import rtoList from '../../insurers/magma/assets/rto_names_list.js';
import {
  addCommentToTask,
  updateTaskDescription,
  updateTaskStatus
} from '../../../shared/clickUp.js';
import {
  checkFileExists,
  domClickElement,
  getCredentials,
  getElementValue,
  roundToDecimal,
  selectDropdownOptionByLabel,
  setElementValue
} from '../../../shared/functions.js';
import {
  createCustomerPageUrl,
  loginPageUrl,
  relationshipCode,
  vehicleType,
  kycDocumentFolderPath
} from './constants.js';
import selectors from './selectors.js';
// Constants
import {
  mobile,
  finalPremiumDetails,
  integromatSendBufferHook,
  odPremiumDetails,
  tpPremiumDetails
} from '../../../shared/constants.js';
import { TOO_MUCH_IDV_VARIATION } from '../../../shared/errors.js';
import process from 'process';

const deleteOldPolicyPdf = async () => {
  try {
    fs.unlinkSync('insurers/liberty/policies/Policy.pdf', (err) => {
      if (err) return console.error(err);
      console.error('File deleted successfully');
    });
  } catch (err) {
    // Do nothing
  }
};

const getCookies = async () => {
  const cookiesPath = path.resolve('insurers/magma/cookies.json');
  if (fs.existsSync(cookiesPath)) {
    const cookiesJSON = fs.readFileSync(cookiesPath, (err) => {
      if (err) console.error('Error getting cookies');
    });

    return JSON.parse(cookiesJSON);
  }
};

// Function to login 
const loginMagma = async (page, branch, pendingXHR) => {

  // Get cookies for magma login
  const authCookies = await getCookies();
  const currentTimestamp = Math.floor(dayjs().unix());
  const cookieExpiresAt = authCookies?.[2]?.expires;

  if (!authCookies || currentTimestamp > cookieExpiresAt) {
    const credentials = await getCredentials('magma', branch);
    // go to login page url
    await page.goto(loginPageUrl);
    // Enter username & password details
    await page.waitForSelector(selectors.usernameInput, { visible: true });
    await setElementValue(page, selectors.usernameInput, credentials.username);
    await setElementValue(page, selectors.passwordInput, credentials.password);

    // Click on login button
    await domClickElement(page, selectors.loginButton);
    await page.waitForNavigation();
    await pendingXHR.waitForAllXhrFinished();

    // Get cookies from page
    const cookies = await page.cookies();
    const cookiesFilePath = path.resolve('insurers/magma/cookies.json');
    // Set new cookies in cookies file
    fs.writeFileSync(cookiesFilePath, JSON.stringify(cookies), (err) => {
      if (err) console.error('Error setting cookies in file');
    });

  } else {
    // Set cookies to page
    await page.setCookie.apply(page, authCookies);
  }

  // Go to create customer page
  await page.goto(createCustomerPageUrl);
  // Click create customer button
  await domClickElement(page, selectors.createCustomerButton);
};

// Function to set customer details
const setCustomerDetails = async (page, request, customerDetails, insuranceDetails, kycDocumentsFileNames, pendingXHR) => {
  let ckycVerified;
  if (customerDetails.customerType === 'Individual') {

    downloadKycDocuments(request);
    const salutation = customerDetails.salutation.split('.')[0];
    const dob = dayjs(customerDetails.dob).format('DD/MM/YYYY');
    const aadhaarLastFour = (customerDetails.aadhaar).substring(((customerDetails.aadhaar).length - 4), (customerDetails.aadhaar).length);

    // KYC process
    const customerFullName = `${customerDetails.firstName} ${customerDetails.lastName.includes('.') ? '' : customerDetails.lastName}`;

    //! Option 1 - If Option 1 is completed then add details in mailing address
    await domClickElement(page, selectors.kycTypeRadio);
    await selectDropdownOptionByLabel(page, selectors.kycDocumentTypeDropdown, 'AADHAAR');
    await setElementValue(page, selectors.kycDocumentIdInput, customerDetails.aadhaar);
    await setElementValue(page, selectors.kycIdNameInput, customerFullName.trim());
    await setElementValue(page, selectors.kycIdDobInput, dayjs(customerDetails.dob).format('DD-MM-YYYY'));
    await pendingXHR.waitForAllXhrFinished();
    await domClickElement(page, selectors.kycVerifyButton);
    await pendingXHR.waitForAllXhrFinished();

    // Check here for error in ckyc
    const ckycMesssage = await page.evaluate((selector) => {
      return document.querySelector(selector).innerText;
    }, selectors.kycErrorSpan);

    ckycVerified = ckycMesssage.includes('Attention') ? true : false;

    //! Option 3 - Upload documents
    // Choose KYC option as kyc documents upload - In Case ckyc fails
    if (!ckycVerified) {
      await domClickElement(page, selectors.kycDocumentsRadio);
      await selectDropdownOptionByLabel(page, selectors.documentTypeDropdown, 'PAN');
      await selectDropdownOptionByLabel(page, selectors.supportingDocumentType, 'AADHAAR(SUPPORTING)');

      // Upload main file
      const uploadDocumentButton = await page.$(selectors.documentMainChooseFileButton);
      uploadDocumentButton.uploadFile(`${kycDocumentFolderPath}/${kycDocumentsFileNames.panFileName}`);
      await domClickElement(page, selectors.mainDocumentUploadFileButton);
      await pendingXHR.waitForAllXhrFinished();

      await page.waitForNavigation();

      // Upload supporting document
      const uploadSupportingDocumentButton = await page.$(selectors.supportingDocumentChooseFileButton);
      uploadSupportingDocumentButton.uploadFile(`${kycDocumentFolderPath}/${kycDocumentsFileNames.aadhaarFileName}`);
      await domClickElement(page, selectors.supportingDocumentUploadFileButton);

      await pendingXHR.waitForAllXhrFinished();
    }


    //! Option 2
    // Set kyc details for customer
    // await page.waitForSelector(selectors.aadhaarKycTypeRadio, {visible: true});
    // await domClickElement(page, selectors.aadhaarKycTypeRadio);
    // await page.waitForSelector(selectors.aadhaarLastFourInput, {visible: true});
    // await setElementValue(page, selectors.aadhaarLastFourInput, aadhaarLastFour);

    // set customer salutation
    await selectDropdownOptionByLabel(page, selectors.salutationDropdown, salutation);
    await pendingXHR.waitForAllXhrFinished();
    // Enter customer first & last name
    await setElementValue(page, selectors.firstNameInput, customerDetails.firstName);
    await setElementValue(page, selectors.lastNameInput, customerDetails.lastName);
    // Set customer martial status
    await selectDropdownOptionByLabel(page, selectors.martialStatusDropdown, 'Single');
    await pendingXHR.waitForAllXhrFinished();
    // Set customer DOB
    await setElementValue(page, selectors.dobInput, dob);
    // Set customer nationality
    await selectDropdownOptionByLabel(page, selectors.nationalityDropdown, 'Indian');
    await pendingXHR.waitForAllXhrFinished();
    // Set customer occupation
    await selectDropdownOptionByLabel(page, selectors.occupationDropdown, 'Others');
    await pendingXHR.waitForAllXhrFinished();
    // Set customer gender
    customerDetails.gender === 'Male'
      ? await domClickElement(page, selectors.genderMaleRadio)
      : await domClickElement(page, selectors.genderFemaleRadio);

    await domClickElement(page, selectors.nextPage1Button);
    await pendingXHR.waitForAllXhrFinished();
    if (!ckycVerified) {
      //! Set Address
      // Enter home/office address details
      await page.waitForSelector(selectors.addressLine1Input, { visible: true });
      await setElementValue(page, selectors.addressLine1Input, customerDetails.addressLine1);
      await setElementValue(page, selectors.addressLine2Input, customerDetails.addressLine2);
      customerDetails.addressLine3 ? await setElementValue(page, selectors.addressLine3Input) : null;
      // Enter pincode
      await setElementValue(page, selectors.pincodeInput, customerDetails.pincode);
      // Click search pincode details button
      await domClickElement(page, selectors.pincodeSearchButton);
      await pendingXHR.waitForAllXhrFinished();
      // Select area from dropdown
      try {
        await selectDropdownOptionByLabel(page, selectors.pincodeAreasDropdown, insuranceDetails.insurer.data.area.toUpperCase());
      } catch (error) {
        // error
        console.log('Error in Selecting Area');
      }
      // Enter customer mobile
      await setElementValue(page, selectors.mobileNumberInput, mobile);
      await pendingXHR.waitForAllXhrFinished();
      await domClickElement(page, selectors.nextPage2Button);
      await pendingXHR.waitForAllXhrFinished();
      await domClickElement(page, selectors.copyHomeAddressCheckbox);
    } else {
      await domClickElement(page, selectors.nextPage1Button);
      await pendingXHR.waitForAllXhrFinished();
      // Enter customer mobile
      await setElementValue(page, selectors.mobileNumberInput, mobile);
      await domClickElement(page, selectors.nextPage2Button);
      await pendingXHR.waitForAllXhrFinished();
      // Update Mailing address to card address
      await setElementValue(page, selectors.mailingAddresslineInput1, customerDetails.addressLine1);
      await setElementValue(page, selectors.mailingAddresslineInput2, customerDetails.addressLine2);
      await setElementValue(page, selectors.mailingMobileNumberInput, mobile);
      customerDetails.addressLine3 ? await setElementValue(page, selectors.mailingAddresslineInput3, customerDetails.addressLine3) : await setElementValue(page, selectors.mailingAddresslineInput3, '');
      // Enter pincode
      await setElementValue(page, selectors.mailingPincodeInput, customerDetails.pincode);
      await pendingXHR.waitForAllXhrFinished();
      // Click search pincode details button

      await domClickElement(page, selectors.mailingPincodeSearchButton);
      await pendingXHR.waitForAllXhrFinished();
      // Select area from dropdown
      try {
        await selectDropdownOptionByLabel(page, selectors.mailingPincodeAreasDropdown, insuranceDetails.insurer.data.area.toUpperCase());
      } catch (err) {
        // Nothing
        console.log('Error in selecting area.');
      }
    }
  } else {
    // select customer type
    await domClickElement(page, selectors.corporateRadio);

    // Corporate kyc process
    await selectDropdownOptionByLabel(page, selectors.corporateCkycDocumentIdType, 'CORPORATE PAN');
    await setElementValue(page, selectors.kycDocumentIdInput, customerDetails.pan);
    await setElementValue(page, selectors.corporateDateOfIncorporationInput, dayjs(customerDetails.doi).format('DD-MM-YYYY'));
    await domClickElement(page, selectors.kycVerifyButton);

    // Check here for error in ckyc
    const ckycMesssage = await page.evaluate((selector) => {
      return document.querySelector(selector).innerText;
    }, selectors.kycErrorSpan);

    ckycVerified = ckycMesssage.includes('Attention') ? true : false;
    
    if (!ckycVerified) {
      await downloadKycDocuments(request);
      await selectDropdownOptionByLabel(page, selectors.documentTypeDropdown, 'CORPORATE PAN');
      await selectDropdownOptionByLabel(page, selectors.supportingDocumentType, 'CIN(SUPPORTING)');

      // Upload main file
      const uploadDocumentButton = await page.$(selectors.documentMainChooseFileButton);
      uploadDocumentButton.uploadFile(`${kycDocumentFolderPath}/${kycDocumentsFileNames.panFileName}`);
      await domClickElement(page, selectors.mainDocumentUploadFileButton);
      await pendingXHR.waitForAllXhrFinished();

      await page.waitForNavigation();

      // Upload supporting document //! CIN
      // const uploadSupportingDocumentButton = await page.$(selectors.supportingDocumentChooseFileButton);
      // uploadSupportingDocumentButton.uploadFile(`${kycDocumentFolderPath}/${kycDocumentsFileNames.aadhaarFileName}`);
      // await domClickElement(page, selectors.supportingDocumentUploadFileButton);

      // await pendingXHR.waitForAllXhrFinished();


    }

    // Set company name
    await page.waitForSelector(selectors.companyNameInput, { visible: true });
    await setElementValue(page, selectors.companyNameInput, customerDetails.companyName);
  }

  // Click on next page button
  await domClickElement(page, selectors.nextPage3Button);
  await pendingXHR.waitForAllXhrFinished();
  await domClickElement(page, selectors.nextPage4Button);
  await pendingXHR.waitForAllXhrFinished();

  // If ckyc not verified
  if (!ckycVerified) {
    await setElementValue(page, selectors.documentIdInput, customerDetails.pan);
    await setElementValue(page, selectors.supportingDocumentId, customerDetails.aadhaar);
  }


  await domClickElement(page, selectors.saveDetailsButton);
  await pendingXHR.waitForAllXhrFinished();
  await domClickElement(page, selectors.createNewPolicyButton);
};

// Function to set productType
const setProductType = async (insuranceDetails) => {
  if (insuranceDetails.policyType === 'od1tp5') {
    return 'Two Wheeler Policy- Bundled- 5 year Act only and 1 year Own Damage';
  } else if (insuranceDetails.policyType === 'od1') {
    return 'Stand-Alone Own Damage Policy for Two Wheeler';
  } else {
    return 'Two Wheeler Package Policy- 1 year';
  }
};


// Function to set Insurance details
const setPolicyDetails = async (page, insuranceDetails, vehicleDetails, pendingXHR) => {
  const productType = await setProductType(insuranceDetails);
  // Select Vehicle Type
  await selectDropdownOptionByLabel(page, selectors.vehicleTypeDropdown, vehicleType);
  await pendingXHR.waitForAllXhrFinished();
  // Click on proceed button
  await domClickElement(page, selectors.proceedButton);
  await page.waitForNavigation();

  // Select policy type
  await selectDropdownOptionByLabel(page, selectors.productTypeDropdown, productType);
  await pendingXHR.waitForAllXhrFinished();

  // Select business type for renewal policies
  insuranceDetails.policyType !== 'od1tp5'
    ? await selectDropdownOptionByLabel(page, selectors.businessTypeDropdown, 'Roll Over')
    : null;

  // Set relationship code
  await selectDropdownOptionByLabel(page, selectors.relationshipCodeDropdown, relationshipCode);
  await pendingXHR.waitForAllXhrFinished();

  if (insuranceDetails.policyType !== 'od1tp5') {
    // Enter previous policy details
    await domClickElement(page, selectors.havePreviousPolicyCheckbox);
    await pendingXHR.waitForAllXhrFinished();
    // Wait for insurer dropdown to appear
    await page.waitForSelector(selectors.previousInsurerDropdown, { visible: true });

    // select previous policy type 
    insuranceDetails.policyType === 'od1'
      ? await selectDropdownOptionByLabel(page, selectors.previousPolicyTypeDropdown, 'Bundled Policy')
      : await selectDropdownOptionByLabel(page, selectors.previousPolicyTypeDropdown, 'Bundled Policy');
    await pendingXHR.waitForAllXhrFinished();
    // Select previous year ncb 
    await selectDropdownOptionByLabel(page, selectors.previousYearNCBDropdown, insuranceDetails.previousNcb);
    await pendingXHR.waitForAllXhrFinished();
    // Select previous insurer
    await selectDropdownOptionByLabel(page, selectors.previousInsurerDropdown, insuranceDetails.previousOdInsurer);
    await pendingXHR.waitForAllXhrFinished();
    // Enter previous policy number
    await setElementValue(page, selectors.previousPolicyNumberInput, insuranceDetails.previousOdPolicyNumber);
    await setElementValue(page, selectors.previousInsurerAddressInput, '.');

    // Enter previous od policy start and end date
    await setElementValue(page, selectors.previousOdPolicyStartDateInput, dayjs(insuranceDetails.previousOdEndDate).add(1, 'day').subtract(1, 'year').format('DD/MM/YYYY'));
    await setElementValue(page, selectors.previousOdPolicyEndDateInput, dayjs(insuranceDetails.previousOdEndDate).format('DD/MM/YYYY'));

    // Enter previous tp policy start and end date
    await setElementValue(page, selectors.previousTpPolicyStartDateInput, dayjs(insuranceDetails.previousTpEndDate).add(1, 'day').subtract(5, 'year').format('DD/MM/YYYY'));
    await setElementValue(page, selectors.previousTpPolicyEndDateInput, dayjs(insuranceDetails.previousTpEndDate).format('DD/MM/YYYY'));

    // Enter number of claims
    insuranceDetails.insurer.data.noOfClaimInPreviousPolicy ? insuranceDetails.insurer.data.noOfClaimInPreviousPolicy : '0';
    await setElementValue(page, selectors.noOfClaimsInput, insuranceDetails.insurer.data.noOfClaimInPreviousPolicy);

    // Enter past policy tenure
    insuranceDetails.policyType === 'od1'
      ? await selectDropdownOptionByLabel(page, selectors.pastPolicyTenureDropdown, '5')
      : await selectDropdownOptionByLabel(page, selectors.pastPolicyTenureDropdown, '1');

    // Subscribe event to dismiss successfully uploaded popup alert
    await page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
    await pendingXHR.waitForAllXhrFinished();

    // Add previous policy details
    await domClickElement(page, selectors.addPreviousPolicyDetailsButton);
    await pendingXHR.waitForAllXhrFinished();

    // Select previous policy details record
    await domClickElement(page, selectors.selectPreviousPolicyRecordCheckbox);
    await pendingXHR.waitForAllXhrFinished();
  }
};

const selectDropdownValues = async (page, selector, value, pendingXHR, include = true) => {
  await page.waitForSelector(`${selector} > li`);
  await page.evaluate(async (data, selector, include) => {
    const ulList = document.querySelector(selector);
    const listItems = ulList.querySelectorAll('li');
    for (let i in listItems) {
      const listItemsText = listItems[i].querySelector('a').innerText;
      if (include) {
        if (listItemsText.includes(data)) {
          return listItems[i].querySelector('a').click();
        }
      } else {
        if (listItemsText === data) {
          return listItems[i].querySelector('a').click();
        }
      }
    }
    return listItems[0].querySelector('a').click();
  }, value, selector, include);
};

const checkIdvVariation = async (page, selectors, value, taskId, pendingXHR) => {
  const higherIdvValue = await getElementValue(page, selectors.higherIdvValue, true);
  const lowerIdvValue = await getElementValue(page, selectors.lowerIdvValue, true);
  if (value > higherIdvValue || value < lowerIdvValue) {
    console.log('IDV Variation');
    await updateTaskStatus(taskId, 'IDV ERROR');
    throw new Error(TOO_MUCH_IDV_VARIATION);
  }
};

// Function to get rto location
const getRtoLocation = async (rto) => {
  for (let i in rtoList) {
    if (rtoList[i].rto_code === rto) {
      return rtoList[i].city;
    }
  }
};

// Function to select financer address first option
const selectFirstOptionDropdown = async (page, selector) => {
  const optionValue = await page.evaluate((selector) => {
    const options = document.querySelector(selector).options;
    for (let i in options) {
      if (i == 1) {
        return options[i].getAttribute('value');
      }
    }
  }, selector);

  await page.select(selector, optionValue);
};

// Function to get discount value as per body type & state
const getDiscountValue = async (bodyType, state, manufacturer, policyType, registrationDate, cc) => {
  state = state.toLowerCase();
  bodyType = bodyType.toLowerCase();
  manufacturer = manufacturer.toLowerCase();

  if (policyType === 'od1tp5') {
    const discountValue = discounts.od1tp5[state][bodyType];
    return discountValue;
  } else {
    const getVehicleAge = async (registrationDate) => {
      const todayDate = dayjs();
      const vehicleAge = todayDate.diff(registrationDate, 'year', true);
      return vehicleAge;
    };

    let discountValue;
    const vehicleAge = await getVehicleAge(registrationDate);
    const discountCc = cc <= 150 ? 150 : 151;
    if (vehicleAge <= 3) {
      discountValue = discounts.renewal.vehicleAge[3].state[state]['cc'][discountCc][bodyType];
    } else if (vehicleAge > 3 && vehicleAge <= 9) {
      discountValue = discounts.renewal.vehicleAge[9].state[state]['cc'][discountCc][bodyType];
    } else if (vehicleAge > 9 && vehicleAge <= 12) {
      discountValue = discounts.renewal.vehicleAge[12].state[state]['cc'][discountCc][bodyType];
    } else {
      throw new Error('Policy can\'t be created because VEHICLE AGE is over 12 years. Hence, DECLINED BY MAGMA INSURER');
    }

    return discountValue;
  }

};


// Function to get dynamic selector id for dropdowns
const getSelectorIdAndSelectDropdownValue = async (page, value, pendingXHR, include = false) => {
  await page.waitForTimeout(1000);
  const selectorId = await page.evaluate((value) => {
    const lists = document.querySelectorAll('ul');
    for (let list in lists) {
      try {
        const listId = lists[list].getAttribute('id') ? lists[list].getAttribute('id') : null;
        const valueFound = document.querySelector(`#${listId}`).innerText.includes(value);

        if (valueFound) {
          return `#${listId}`;
        }

      } catch (err) {
        // Nothing
      }
    }
  }, value);

  await pendingXHR.waitForAllXhrFinished();
  // Select value from Dropdown
  await selectDropdownValues(page, selectorId, value, pendingXHR, include);
  await pendingXHR.waitForAllXhrFinished();
};


// Function to set vehicle details
const setVehicleDetails = async (page, customerDetails, vehicleDetails, insuranceDetails, taskId, pendingXHR) => {

  //? Set required variables
  const {
    state
  } = customerDetails;

  const {
    bodyType,
    manufacturer,
    registrationDate,
  } = vehicleDetails;

  const {
    policyType
  } = insuranceDetails;


  // Enter registration date
  await page.waitForSelector(selectors.vehicleRegistrationDate);
  await setElementValue(page, selectors.vehicleRegistrationDate, dayjs(vehicleDetails.registrationDate).format('DD/MM/YYYY'));
  await pendingXHR.waitForAllXhrFinished();
  // Enter rto location
  const rtoLocation = await getRtoLocation(vehicleDetails.rto);
  await page.type(selectors.rtoLocationInput, rtoLocation, { delay: 50 });
  await pendingXHR.waitForAllXhrFinished();


  await getSelectorIdAndSelectDropdownValue(page, rtoLocation, pendingXHR, true);

  // Select month and year
  const year = dayjs(vehicleDetails.registrationDate).year().toString();
  const month = dayjs(vehicleDetails.registrationDate).month() + 1;
  // console.log(year, month);
  await selectDropdownOptionByLabel(page, selectors.monthDropdown, month.toString());
  await selectDropdownOptionByLabel(page, selectors.yearDropdown, year);
  // Enter manufacturer
  await page.type(selectors.manufacturerInput, vehicleDetails.manufacturer, { delay: 100 });

  await getSelectorIdAndSelectDropdownValue(page, vehicleDetails.manufacturer, pendingXHR, false);

  // Select model & variant
  await page.type(selectors.modelInput, vehicleDetails.model, { delay: 50 });
  const modelVariantName = `${vehicleDetails.model} ${vehicleDetails.variant}`;

  await getSelectorIdAndSelectDropdownValue(page, modelVariantName, pendingXHR, true);
  await getSelectorIdAndSelectDropdownValue(page, modelVariantName, pendingXHR, true);

  // check idv variation
  await checkIdvVariation(page, selectors, insuranceDetails.premiumDetails.idv.basic, taskId, pendingXHR);
  // Set vehicle idv
  await setElementValue(page, selectors.vehicleIdvInput, insuranceDetails.premiumDetails.idv.basic);

  // Enter chassis number
  await setElementValue(page, selectors.chassisNumberInput, vehicleDetails.chassisNumber);
  // Enter engine number
  await setElementValue(page, selectors.engineNumberInput, vehicleDetails.engineNumber);

  // Enter vehicle registred number
  if (insuranceDetails.policyType !== 'od1tp5') {
    await setElementValue(page, selectors.registrationNumberInput3, 'SF');
    await setElementValue(page, selectors.registrationNumberInput4, '9280');
  }

  // Enter discount value
  const vehicleCc = await getElementValue(page, selectors.ccInputValue);
  const discountPercent = await getDiscountValue(bodyType, state, manufacturer, policyType, registrationDate, vehicleCc);
  await setElementValue(page, selectors.discountInput, discountPercent);
  // Set tppd restriction value
  await selectDropdownOptionByLabel(page, selectors.tppdLimitDropdown, '6000');

  // Check for customer holds valid puc or fitness certificate
  insuranceDetails.policyType !== 'od1tp5'
    ? await domClickElement(page, selectors.validPucCheckbox)
    : null;

  // Set hypothecation
  if (vehicleDetails.hypothecated === 'Yes') {
    await domClickElement(page, selectors.financedYesCheckBox);
    await pendingXHR.waitForAllXhrFinished();
    await page.waitForSelector(selectors.financierNameInput, { visible: true });
    await setElementValue(page, selectors.serialNumberFinancerInput, '1');
    await pendingXHR.waitForAllXhrFinished();
    await page.type(selectors.financierNameInput, vehicleDetails.financerName, { delay: 50 });
    await getSelectorIdAndSelectDropdownValue(page, vehicleDetails.financerName, pendingXHR, false);

    await pendingXHR.waitForAllXhrFinished();

    await page.waitForSelector(`${selectors.financerAddressDropdown} > option:nth-child(2)`);

    await selectFirstOptionDropdown(page, selectors.financerAddressDropdown);
    await pendingXHR.waitForAllXhrFinished();
    await selectDropdownOptionByLabel(page, selectors.agreementTypeDropdown, 'Hypothecation');
    await pendingXHR.waitForAllXhrFinished();
    await domClickElement(page, selectors.addFinancerDetailsButton);
    await pendingXHR.waitForAllXhrFinished();
    await domClickElement(page, selectors.selectFinancerDetailsCheckbox);
    await pendingXHR.waitForAllXhrFinished();
  }
};

// Function to set addon plans and calculate premium
const setAddOnPlansAndCalculatePremium = async (page, insuranceDetails, pendingXHR) => {
  // Select zero dep if nil dep exists
  insuranceDetails.addonOdCoverages ? await selectDropdownOptionByLabel(page, selectors.addOnCoverPlanDropdown, 'BasicPlus') : null;
  await pendingXHR.waitForAllXhrFinished();

  // Check whether previous policy had addOn plans
  insuranceDetails.policyType !== 'od1tp5'
    ? await domClickElement(page, selectors.addOnInPreviousPolicyNoCheckbox)
    : null;

  if (insuranceDetails.policyType === 'od1tp5' || insuranceDetails.policyType === 'od1tp1') {
    // Uncheck compulsory pa for owner driver
    await domClickElement(page, selectors.compulsoryPaCoverCheckbox);
    await pendingXHR.waitForAllXhrFinished();
  }

  // Subscribe event to dismiss successfully uploaded popup alert
  if (insuranceDetails.policyType === 'od1tp5') {
    await page.on('dialog', async dialog => {
      await dialog.dismiss();
    });
    await pendingXHR.waitForAllXhrFinished();
  }

  // Uncheck individual personal accident checkbox
  await domClickElement(page, selectors.individualPersonalAccidentCheckbox);
  await pendingXHR.waitForAllXhrFinished();

  // Check existing pa cover checkbox
  if (insuranceDetails.policyType === 'od1tp5' || insuranceDetails.policyType === 'od1tp1') {
    await page.waitForTimeout(2000);
    const checkDisabled = async (page, selector) => {
      const isDisabled = await page.evaluate((selector) => {
        return document.querySelector(selector).getAttribute('disabled');
      }, selector);

      if (isDisabled === 'disabled') {
        await checkDisabled();
      } else {
        return true;
      }
    };
    await checkDisabled(page, selectors.existingPaCoverCheckbox);
    // Check existing pa cover button
    await domClickElement(page, selectors.existingPaCoverCheckbox);
    await pendingXHR.waitForAllXhrFinished();
  }

  // Click calculate premium button
  await domClickElement(page, selectors.calculatePremiumButton);
  // Click yes to continue if vehicle not found
  await page.waitForSelector(selectors.continuePolicyIssuanceNotFoundInVahaan);
  await domClickElement(page, selectors.continuePolicyIssuanceNotFoundInVahaan);
  await pendingXHR.waitForAllXhrFinished();
  // Click no for whatsapp notification
  await page.waitForSelector(selectors.chooseNoForWhatsappNotifications);
  await domClickElement(page, selectors.chooseNoForWhatsappNotifications);
  // Click close to close GST warning pop-up
  await page.waitForSelector(selectors.gstPopupClose);
  await domClickElement(page, selectors.gstPopupClose);

  // Click on save proposal button
  // await domClickElement(page, selectors.saveProposalButton);
  // await pendingXHR.waitForAllXhrFinished();

};

// Function to get od percent value as per zone
const zoneOdPercentValue = async (zone, state) => {
  if (state === 'DELHI' && zone === 'A') {
    return 1.708;
  } else if (zone === 'A') {
    return 1.767;
  } else {
    return 1.676;
  }
};

// Functon to get tp value as per cc
const tpValueAsPerVehicleCc = async (cc) => {
  cc = parseInt(cc);
  if (cc <= 150) {
    return 3851;
  } else {
    return 7365;
  }
};

const paymentAndDownloadPdf = async (page, pendingXHR) => {
  await domClickElement(page, selectors.proceedToPaymentButton);
  await pendingXHR.waitForAllXhrFinished();
  await page.waitForNavigation();
  await page.waitForSelector(selectors.paymentOptionDropdown, { visible: true });
  await selectDropdownOptionByLabel(page, selectors.paymentOptionDropdown, 'CD');
  await pendingXHR.waitForAllXhrFinished();
  await page.waitForSelector(selectors.proceedToPaymentButton2, { visible: true });
  await domClickElement(page, selectors.proceedToPaymentButton2);
  // Select payer as intermediatery
  await domClickElement(page, selectors.payerTypeIntermediary);
  // Save button
  // await domClickElement(page, selectors.savePolicyButton);
  // await pendingXHR.waitForAllXhrFinished();
};

// Function to set calculations for new vehicle
const setNewVehicleCalculationsAndUpdateClickUpTask = async (page, request, taskId, pendingXHR) => {

  //? Set required variables
  const {
    insuranceDetails,
    customerDetails,
    vehicleDetails
  } = request;

  //? Set required variables
  const {
    state
  } = customerDetails;

  const {
    bodyType,
    manufacturer,
    registrationDate
  } = vehicleDetails;

  const {
    policyType
  } = insuranceDetails;

  const idv = insuranceDetails.premiumDetails.idv.basic;

  // premium calculations template
  const caclulationsTemplate = {
    'od': {
      'basic': 0,
      'discountAmount': 0,
      'discountPercentage': 0,
      'odAfterDiscount': 0,
      'ncbAmount': 0,
      'ncbPercentage': 0,
      'loadingPercentage': 0,
      'loadingAmount': 0,
      'nilDepAmount': 0,
      'nilDepPercentage': 0,
      'consumables': 0,
      'engineProtect': 0,
      'rti': 0,
      'electricalAccessoriesPremium': 0,
      'nonElectricalAccessoriesPremium': 0,
      'otherCoveragesPremium': 0,
      'netPremium': 0,
      'gstOnPremium': 0,
      'grossPremium': 0
    },
    'tp': {
      'basic': 0,
      'tppdRestrictionAmount': 0,
      'basicPremiumAfterTppd': 0,
      'cpa': 0,
      'passenger': 0,
      'llpd': 0,
      'otherCoveragesPremium': 0,
      'netPremium': 0,
      'gstOnPremium': 0,
      'grossPremium': 0
    },
    'netPremium': 0,
    'gstOnPremium': 0,
    'grossPremium': 0
  };

  const {
    od,
    tp,
  } = caclulationsTemplate;


  const ccValue = await getElementValue(page, selectors.ccInputValue);
  // Get discount value
  const discountValue = await getDiscountValue(bodyType, state, manufacturer, policyType, registrationDate, ccValue);
  // Get pdf data from view worksheet pdf
  // Instance for new window pop up
  // Subscribe to 'popup' event
  const waitForWindow = new Promise(resolve => page.on('popup', resolve));

  // click on view worksheet button
  await domClickElement(page, selectors.viewWorksheetButton);
  await pendingXHR.waitForAllXhrFinished();

  const calculationsPdfWindow = await waitForWindow;
  const pdfUrl = await calculationsPdfWindow.evaluate(() => {
    return document.URL;
  });

  await calculationsPdfWindow.close();

  // Get pdf data and convert into text
  const caclulationsJson = await extractPDF(pdfUrl, policyType);
  // console.log(caclulationsJson);

  // Set calculations
  //? OD calculations
  const basicOd = parseFloat(caclulationsJson['Basic OD']);
  const basicNetPremium = policyType === 'od1tp5' || policyType === 'od1tp1' ? roundToDecimal(parseFloat(caclulationsJson['Total Own Damage Premium(A)'])) : roundToDecimal(parseFloat(caclulationsJson['Total Own Damage Premium']));
  const nilDepAmount = caclulationsJson['Add On Cover Basic Plus- ( DEPRECIATION RE-IMBURSEMENT )'] ? parseFloat(caclulationsJson['Add On Cover Basic Plus- ( DEPRECIATION RE-IMBURSEMENT )']) : 0;
  const nilDepPercentage = roundToDecimal((nilDepAmount / idv) * 100);
  const discountPercentage = -discountValue;
  const ncbPercentage = policyType === 'od1tp5' || insuranceDetails.previousNcb == '0' ? 0 : parseInt(insuranceDetails.previousNcb) + 5;
  const ncbAmount = policyType === 'od1tp5' ? 0 : roundToDecimal((basicOd - (basicOd * (discountValue / 100))) * (ncbPercentage / 100));
  const discountAmount = discountPercentage === 0 ? 0 : roundToDecimal(basicOd - (basicNetPremium - nilDepAmount + ncbAmount));
  const odGstAmount = roundToDecimal(basicNetPremium * 0.18);
  const odGrossAmount = roundToDecimal(basicNetPremium + odGstAmount);

  //? TP calculations
  const basicTp = policyType === 'od1tp5' || policyType === 'od1tp1' ? (caclulationsJson['Sub Total'] ? roundToDecimal(parseFloat(caclulationsJson['Sub Total'])) : 0) : 0;
  const tppd = policyType === 'od1tp5' || policyType === 'od1tp1' ? (caclulationsJson['Less:TPPD Discount'] ? -parseFloat(caclulationsJson['Less:TPPD Discount']) : 0) : 0;
  const tpNetPremium = caclulationsJson['Total Liability Premium(B)'] ? roundToDecimal(parseFloat(caclulationsJson['Total Liability Premium(B)'])) : 0;
  const tpGstAmount = roundToDecimal(tpNetPremium * 0.18);
  const tpGrossAmount = roundToDecimal(tpNetPremium + tpGstAmount);

  //? Final calculations
  let finalNetPremium;
  finalNetPremium = policyType === 'od1tp5' || policyType === 'od1tp1' ? roundToDecimal(parseFloat(caclulationsJson['Premium Computation Total Package Premium(A+B)'])) : roundToDecimal(parseFloat(caclulationsJson['Premium Computation Total Package Premium']));
  const finalGstPremium = roundToDecimal(parseFloat(caclulationsJson['GST']));
  const finalGrossPremium = roundToDecimal(parseFloat(caclulationsJson['TOTAL']));


  //! Request od calculations
  od.basic = basicOd;
  od.odAfterDiscount = discountPercentage === 0 ? 0 : policyType === 'od1tp5' ? roundToDecimal(basicNetPremium - nilDepAmount) : roundToDecimal(basicOd - discountAmount);
  od.discountAmount = discountAmount;
  od.discountPercentage = discountPercentage;
  od.nilDepAmount = nilDepAmount;
  od.nilDepPercentage = nilDepPercentage;
  od.netPremium = basicNetPremium;
  od.gstOnPremium = odGstAmount;
  od.grossPremium = odGrossAmount;
  od.ncbAmount = ncbAmount;
  od.ncbPercentage = ncbPercentage;

  //! Request tp calculations
  tp.basic = basicTp;
  tp.tppdRestrictionAmount = tppd;
  tp.basicPremiumAfterTppd = basicTp + tppd;
  tp.netPremium = tpNetPremium;
  tp.gstOnPremium = tpGstAmount;
  tp.grossPremium = tpGrossAmount;

  //! Request final calculations
  caclulationsTemplate.netPremium = finalNetPremium;
  caclulationsTemplate.gstOnPremium = finalGstPremium;
  caclulationsTemplate.grossPremium = Math.ceil(finalGrossPremium);

  // Set calculations in request
  request.insuranceDetails.premiumDetails = {
    ...request.insuranceDetails.premiumDetails,
    ...caclulationsTemplate
  };

  // Update clickup data & status
  await updateTaskDescription(taskId, request);

  // Add run script comment
  const formUrl = `https://docs.google.com/forms/d/e/1FAIpQLSdQ9_fiAFbBvkJCrEQNFEnTkq0O5nDbAz8alJMYs3UQwOOMNw/viewform?usp=pp_url&entry.300425011=${taskId}&entry.626719933=${request.vehicleDetails.chassisNumber}`;
  const formLinkComment = `Please Upload Policy PDF to this Form : ${formUrl}`;
  await addCommentToTask(taskId, formLinkComment);

  // Return updated request
  return request;

};

// Function to download file from google drive
const downloadDocumentFileGoogleDrive = async (requestId, fileId, documentType) => {
  // Authentication for google drive
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json',
    scopes: 'https://www.googleapis.com/auth/drive'
  });

  const service = google.drive({ version: 'v3', auth });

  try {
    // Returns file buffer data in {{fileData.data}}
    const fileData = await service.files.get({
      fileId,
      alt: 'media'
    });
    const fileExtension = fileData.headers['content-type'].split('/')[1];
    const destination = fs.createWriteStream(`${kycDocumentFolderPath}/${requestId}${documentType}.${fileExtension}`);

    // Create write stream into the file
    service.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' },
      (err, { data }) => {
        if (err) {
          console.log('err');
          return;
        }
        data.on('end', () => {
          return true;
        })
          .on('error', (error) => {
            console.log('Error in creating the file. Please upload the KYC document file manually.');
            return process.exit();
          })
          .pipe(destination);
      });
    return `${requestId}${documentType}.${fileExtension}`;

  } catch (error) {
    console.log(error.message);
  }
};

// Function to download kyc documents
const downloadKycDocuments = async (request) => {

  //? Set Required Variables
  const {
    customerDetails,
    requestId
  } = request;

  const {
    aadhaarFileId,
    panFileId
  } = customerDetails;

  let aadhaarFileName = '';
  let gstinFileName = '';

  // Download aadhaar file or gstin file
  if (request.customerDetails.customerType === 'Individual') {
    aadhaarFileName = await downloadDocumentFileGoogleDrive(requestId, aadhaarFileId, 'aadhaar');
    await checkFileExists(`${kycDocumentFolderPath}/${aadhaarFileName}`);
  }
  // else {
  //   gstinFileName = await downloadDocumentFileGoogleDrive(requestId, customerDetails.gstinFileId, 'gstin');
  //   await checkFileExists(`${kycDocumentFolderPath}/${gstinFileName}`);
  // }

  // Download pan file
  const panFileName = await downloadDocumentFileGoogleDrive(requestId, panFileId, 'pan');
  await checkFileExists(`${kycDocumentFolderPath}/${panFileName}`);

  return {
    panFileName,
    aadhaarFileName,
    gstinFileName
  };


};

// Function to delete kyc documents
const deleteKycDocuments = async () => {
  const files = fs.readdirSync(kycDocumentFolderPath, (err) => {
    if (err) console.log('Error Occurred');
  });

  for (let file in files) {
    if (files[file] !== '.gitkeep') {
      fs.unlinkSync(`${kycDocumentFolderPath}/${files[file]}`);
    }
  }
};



export {
  deleteOldPolicyPdf,
  loginMagma,
  setCustomerDetails,
  setPolicyDetails,
  setVehicleDetails,
  setAddOnPlansAndCalculatePremium,
  paymentAndDownloadPdf,
  downloadKycDocuments,
  setNewVehicleCalculationsAndUpdateClickUpTask,
  deleteKycDocuments
};