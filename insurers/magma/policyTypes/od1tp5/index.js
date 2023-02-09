// Puppeteer
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
import { PendingXHR } from 'pending-xhr-puppeteer';

// Shared libraries
import {
  domClickElement,
  getChromePath,
} from '../../../../shared/functions.js';

import {
  deleteKycDocuments,
  deleteOldPolicyPdf,
  downloadKycDocuments,
  loginMagma,
  paymentAndDownloadPdf,
  setAddOnPlansAndCalculatePremium,
  // setCalculationsAndUpdateClickupTask,
  setCustomerDetails,
  setNewVehicleCalculationsAndUpdateClickUpTask,
  setPolicyDetails,
  setVehicleDetails
} from '../../libraries/functions.js';
import selectors from '../../libraries/selectors.js';

// Function to handle od1tp5 policies
const od1tp5 = async (request) => {
  //? Get details from request
  const {
    customerDetails,
    vehicleDetails,
    insuranceDetails,
    clickupTaskId: taskId,
  } = request;

  // Delete old policy PDF
  await deleteOldPolicyPdf();

  // Get chrome executable path
  const chromePath = await getChromePath();

  // Initiate puppeteer
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: false,
    // devtools: true,
  });
  const [page] = await browser.pages();

  // Initiate pending XHR
  const pendingXHR = new PendingXHR(page);

  // Remove wait timeout limit
  page.setDefaultTimeout(0);

  // Delete previous downloaded kyc documents
  deleteKycDocuments();
  
  // Login into magma portal
  await loginMagma(page, insuranceDetails.insurer.branch, pendingXHR);
  
  // Download kyc documents
  const kycDocumentsFileNames = downloadKycDocuments(request);

  // Emter customer details
  await setCustomerDetails(page, request, customerDetails, insuranceDetails, kycDocumentsFileNames, pendingXHR);

  // Enter policy details
  await setPolicyDetails(page, insuranceDetails, vehicleDetails, pendingXHR);

  // Enter vehicle details
  await setVehicleDetails(page, customerDetails, vehicleDetails, insuranceDetails, taskId, pendingXHR);

  // Set addon plans and calculate premium
  await setAddOnPlansAndCalculatePremium(page, insuranceDetails, pendingXHR);

  // Set calculations and update clickup data & status
  await setNewVehicleCalculationsAndUpdateClickUpTask(page, request, taskId, pendingXHR);

  await domClickElement(page, selectors.saveProposalButton);
  await pendingXHR.waitForAllXhrFinished();

  // proceed to payment and download pdf
  await paymentAndDownloadPdf(page, pendingXHR);

};

export default od1tp5;
