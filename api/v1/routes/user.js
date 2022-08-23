const router = require('express').Router();
const {Reg,Login,GetAllUser,GetUserById,RecoverPass,ConfirmRecover}=require("../controller/user");

//נגדיר נקודת קצה end point
//עבור הרשמה והתחברות
router.post("/reg",Reg);
router.post("/login",Login);

router.get("/",GetAllUser);
router.get("/:UId",GetUserById);
router.post("/rec",RecoverPass);
router.post("/con",ConfirmRecover);

module.exports=router;