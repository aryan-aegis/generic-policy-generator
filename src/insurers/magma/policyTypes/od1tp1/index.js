// import puppeteer from 'puppeteer';
import { PendingXHR } from 'pending-xhr-puppeteer';
import puppeteer from 'puppeteer-core';
import { domClickElement } from '../../../../shared/functions.js';

// Shared libraries
import sparticuzConfig from '../../../../sparticuzConfig/index.js';

import {
  downloadKycDocuments,
  loginMagma,
  setAddOnPlansAndCalculatePremium,
  // setCalculationsAndUpdateClickupTask,
  setCustomerDetails,
  setNewVehicleCalculationsAndUpdateClickUpTask,
  setPolicyDetails,
  setVehicleDetails
} from '../../libraries/functions.js';
import selectors from '../../libraries/selectors.js';

const od1tp1 = async (request) => {
  //? Get details from request
  const {
    customerDetails,
    vehicleDetails,
    insuranceDetails,
    clickupTaskId: taskId
  } = request;

  // Initiate puppeteer
  const browser = await puppeteer.launch(sparticuzConfig);

  const [page] = await browser.pages();

  // Initiate pending XHR
  const pendingXHR = new PendingXHR(page);

  // Remove wait timeout limit
  page.setDefaultTimeout(0);

  // Login into magma portal
  await loginMagma(page, insuranceDetails.insurer.branch, pendingXHR);

  // Download kyc documents
  const kycDocumentsFileNames = downloadKycDocuments(request);

  // Emter customer details
  await setCustomerDetails(
    page,
    request,
    customerDetails,
    insuranceDetails,
    kycDocumentsFileNames,
    pendingXHR
  );

  // Enter policy details
  await setPolicyDetails(page, insuranceDetails, vehicleDetails, pendingXHR);

  // Enter vehicle details
  await setVehicleDetails(
    page,
    customerDetails,
    vehicleDetails,
    insuranceDetails,
    taskId,
    pendingXHR
  );

  // Set addon plans details and calculate premium
  await setAddOnPlansAndCalculatePremium(page, insuranceDetails, pendingXHR);

  // Set calculations for quote and update status to quote generated
  await setNewVehicleCalculationsAndUpdateClickUpTask(
    page,
    request,
    taskId,
    pendingXHR
  );

  await domClickElement(page, selectors.saveProposalButton);
  await pendingXHR.waitForAllXhrFinished();

  // proceed to payment and download pdf
  //   await paymentAndDownloadPdf(page, pendingXHR);
};

export default od1tp1;
