// PDF errors
const UNABLE_TO_DOWNLOAD_FILE =
  'Unable to download file. Please download PDF manually and upload.';
const SEND_PDF_TO_SERVER_FAILED =
  'Sending PDF to server failed. Please download PDF manually and upload.';

// Aut errors
const CREDS_NOT_FOUND = 'Creds not found for insurer / branch.';

// RTO errors
const RTO_NOT_FOUND = 'RTO not found.';

// Script errors
const QUOTE_ALREADY_GENERATED = 'Quote already generated.';
const CHASSIS_TASK_MISMATCH = 'Chassis number does not match the card.';
const TOO_MUCH_IDV_VARIATION = 'IDV variation more than allowed';
const LOADING_ERROR = 'Positive loading in premium. Unable to issue policy';
const INSURER_NOT_FOUND = 'Invalid request. Unable to find insurer.';
const INSURER_DOES_NOT_SUPPORT_POLICY_TYPE =
  'Invalid request. Insurer does not support this policy type.';

// ClickUp errors
const UNABLE_TO_GET_CLICKUP_TASK = 'Unable to get task from ClickUp';
const UNABLE_TO_UPDATE_CLICKUP_TASK = 'Unable to update task in ClickUp';
const UNABLE_TO_UPDATE_CLICKUP_TASK_STATUS =
  'Unable to update task status in ClickUp';
const UNABLE_TO_ADD_CLICKUP_COMMENT =
  'Unable to add comment to task in ClickUp';

// Export errors
export {
  UNABLE_TO_DOWNLOAD_FILE,
  CREDS_NOT_FOUND,
  RTO_NOT_FOUND,
  QUOTE_ALREADY_GENERATED,
  CHASSIS_TASK_MISMATCH,
  TOO_MUCH_IDV_VARIATION,
  SEND_PDF_TO_SERVER_FAILED,
  LOADING_ERROR,
  INSURER_NOT_FOUND,
  INSURER_DOES_NOT_SUPPORT_POLICY_TYPE,
  UNABLE_TO_GET_CLICKUP_TASK,
  UNABLE_TO_UPDATE_CLICKUP_TASK,
  UNABLE_TO_UPDATE_CLICKUP_TASK_STATUS,
  UNABLE_TO_ADD_CLICKUP_COMMENT
};
