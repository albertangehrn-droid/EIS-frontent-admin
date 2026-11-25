// src/services/apiService.js

import makeRequest from "./apiRequest";

const loginUser = async (payload = {}, config = {}) => {
  try {
    const response = await makeRequest(
      "POST",
      "/admin/admin-login",
      payload,
      config
    );

    if (response.data.status === 200) {
    }
    return response.data;
  } catch (error) {
    console.error(error);
  }
};



const getAllPageConfigs = async (config = {}) => {
  return await makeRequest("GET", "/page-config", null, config);
};

const getPageConfig = async (pageId, config = {}) => {
  return await makeRequest("GET", `/page-config/${pageId}`, null, config);
};

const updatePageConfig = async (pageId, payload, config = {}) => {
  return await makeRequest("PUT", `/page-config/${pageId}`, payload, config);
};

export const controller = {
  auth: {
    loginUser,
    uploadImage: (formData) => makeRequest("POST", "/admin/upload-image", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  },
  pageConfig: {
    getAllPageConfigs,
    getPageConfig,
    updatePageConfig,
  },
};
