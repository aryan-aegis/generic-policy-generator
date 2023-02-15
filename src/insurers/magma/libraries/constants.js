import path from 'path';
const loginPageUrl = 'https://agents.magmahdi.com/_layouts/Portal/Login.aspx';
const createCustomerPageUrl =
  'https://agents.magmahdi.com/SitePages/AgentAction.aspx';
const relationshipCode = '10000050603';
const vehicleType = 'TwoWheeler';
const kycDocumentFolderPath = path.resolve('insurers/magma/kycDocuments');

export {
  loginPageUrl,
  createCustomerPageUrl,
  relationshipCode,
  vehicleType,
  kycDocumentFolderPath
};
