import axios from "axios";
import { useNavigate } from "react-router-dom";
const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });
let domain = window.location.origin;
const formDataURL = [
  "/admin/category/add-category",
  "/admin/category/change-category-image",
  "/admin/mood-meter/add",
  "/admin/mood-meter/update-image",
  "/mood-master/create",
  "/mood-master/image-update",
  "/admin-blog-manage/add",
  "/admin/mood-equelizer/create",
  "goodmood/awarness/image-upload",
  "goodmood/post/image",
  "goodmood/equalizer/upload",
  "goodmood/equalizer/banner/update",
  "goodmood/support/category/image",
];
api.interceptors.request.use((req) => {
  let userTokenData;
  try {
    userTokenData = JSON.parse(sessionStorage.getItem("user_token"));
    // console.log("UserTokenData", userTokenData);
  } catch (error) {
    userTokenData = null;
  }
  let token = userTokenData && userTokenData.token ? userTokenData.token : null;
  // console.log("Req: ", req.url);
  req.headers["Content-Type"] = "application/json";
  // if (formDataURL.includes(req.url)) {
  //   req.headers['Content-Type'] = 'multipart/form-data';
  // }
  if (formDataURL.some((url) => req.url.startsWith(url))) {
    req.headers["Content-Type"] = "multipart/form-data";
  }
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  // if (domain) {
  //   req.headers["Domain"] = domain;
  // }
  return req;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && [401].includes(error.response.status)) {
      sessionStorage.removeItem("user_token");
    }
    return Promise.reject(error);
  },
);

export default api;
