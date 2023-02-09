import fetch from 'node-fetch';
import dayjs from 'dayjs';
import {
  CHASSIS_TASK_MISMATCH,
  QUOTE_ALREADY_GENERATED,
  UNABLE_TO_ADD_CLICKUP_COMMENT,
  UNABLE_TO_GET_CLICKUP_TASK,
  UNABLE_TO_UPDATE_CLICKUP_TASK,
  UNABLE_TO_UPDATE_CLICKUP_TASK_STATUS
} from './errors.js';

// Required variables
const apiUrl = 'https://api.clickup.com/api/v2/';
const taskUrl = apiUrl + 'task/';
const token = 'pk_49358634_3M4JI8EAJXI8O9SXSILGXW2U736UBKNG';
const headerWithAuth = {
  'Content-Type': 'application/json',
  'Authorization': token
};

// Function to get ClickUp task details
const getTask = async (taskId, chassisNumber) => {
  // Prepare request
  const requestUrl = taskUrl + taskId;
  const options = {
    method: 'GET',
    headers: headerWithAuth
  };

  return await fetch(requestUrl, options)
    .then(async response => {
      const task = await response.json();
      if (task.name.includes(chassisNumber)) {
        const allowedStatus = ['retry request', 'pending'];

        if (allowedStatus.includes(task.status.status)) {
          const taskContent = JSON.parse(task.text_content);
          const riskStartDate = dayjs(taskContent.riskStartDate).date();
          const riskStartMonth = dayjs(taskContent.riskStartDate).month();

          if (riskStartDate >= dayjs().date() || riskStartMonth > dayjs().month()){
            taskContent.clickupTaskId = taskId;
            return {
              request: taskContent
            };
          } else {
            throw new Error('Policy Risk Start Date is not from Today');
          }
        } else {
          throw new Error(QUOTE_ALREADY_GENERATED);
        }
      } else {
        throw new Error(CHASSIS_TASK_MISMATCH);
      }
    })
    .catch(err => {
      console.error(err);
      throw new Error(UNABLE_TO_GET_CLICKUP_TASK);
    });
};

// Function to update ClickUp task description
const updateTaskDescription = async (taskId, description) => {
  // Prepare request
  const requestUrl = taskUrl + taskId;
  const body = JSON.stringify({
    text_content: JSON.stringify(description, null, 2),
    status: 'quote generated',
  });
  const options = {
    method: 'PUT',
    headers: headerWithAuth,
    body
  };

  // Execute request
  await fetch(requestUrl, options)
    .catch(err => {
      console.error(err);
      throw new Error(UNABLE_TO_UPDATE_CLICKUP_TASK);
    });
};

// Function to update ClickUp task status
const updateTaskStatus = async (taskId, status) => {
  // Prepare request
  const requestUrl = taskUrl + taskId;
  const body = JSON.stringify({
    status: status.toLowerCase()
  });
  const options = {
    method: 'PUT',
    headers: headerWithAuth,
    body
  };

  // Execute request
  await fetch(requestUrl, options)
    .catch(err => {
      console.error(err);
      throw new Error(UNABLE_TO_UPDATE_CLICKUP_TASK_STATUS);
    });
};

// Function to add cooments to a task
const addCommentToTask = async (taskId, comment) => {
  // Prepare request
  const requestUrl = taskUrl + taskId + '/comment';
  const body = JSON.stringify({
    comment_text: comment
  });
  const options = {
    method: 'POST',
    body,
    headers: headerWithAuth,
  };

  // Execute request
  await fetch(requestUrl, options)
    .catch(err => {
      console.error(err);
      throw new Error(UNABLE_TO_ADD_CLICKUP_COMMENT);
    });
};

// Export modules
export {
  getTask,
  updateTaskDescription,
  updateTaskStatus,
  addCommentToTask,
};
