const express = require("express");
const router = express.Router();

const {
  output,
  varifybytoken,
  varifybytiken,
  login,
  profile,
  updateUserData,
  CreateActivity,
  AllDetails,
  Register,
  postsdata,
  fetchPostsInArea,
  endorsePost,
  GoogleLogin,
  verify,
  forgetpassword,
  verifyPin,
  updatePassword,
  resendVerification
} = require("../controllers/LoginController");
const { upload } = require("../utils/util");
// Express route 
router.get("/output", output);  
router.post("/resendVerification", resendVerification)
router.post("/updatePassword",updatePassword)
router.post("/forgetpassword",forgetpassword)
router.post("/verifyPin",verifyPin)
router.get("/verify/:token", verify);
router.post('/GoogleLogin', GoogleLogin);
router.get("/varifybytoken", varifybytoken);
router.post("/login", login);
router.post("/varifybytiken", varifybytiken);
router.get("/profile", profile);
router.post("/profile", profile);
router.post("/updateUserData", updateUserData);
router.get("/AllDetails/:id", AllDetails);
router.post("/AllDetails/:id", AllDetails);
router.get("/postsdata/:id", postsdata);
router.post("/postsdata/:id", postsdata);
// router.post('/CreateActivity', upload, CreateActivity);
router.get("/CreateActivity", upload, CreateActivity);
router.post("/CreateActivity", upload, CreateActivity);
router.post("/Register", upload, Register);
router.post("/fetchPostsInArea", fetchPostsInArea);
router.post("/endorsePost/:id", endorsePost);

module.exports = router;
