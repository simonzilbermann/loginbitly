const User = require("../models/user");
const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const jwt = require("jsonwebtoken");
const randomId = require('random-id');
function GetRandomString(length){
    let str="";
    const chars="abcdefghijklmnopqrstuvwxyz0123456789";
    let index;
    for(let i=0;i<length;i++)
    {
        index=Math.floor(Math.random() * chars.length);
        str+=chars[index];
    }
    return str;

}
////my API:!!!!!!!!!!!!!
module.exports={
    
    GetAllUser:(req,res)=>{
        User.find().then((data)=>{
            if(data.length > 0)
            {
               return res.render('AllUsers',{userarr:data});
            }
            else
            {
               return res.render('notfound');
            }
        });
    },

    GetUserById:(req,res)=>{
        const UId = req.params.UId;
        User.find({UId:UId}).then((data)=>{
            if(data.length > 0)
            {
               return res.render('user',data[0]);
            }
            else
            {
               return res.render('notfound');
            }
        });
    },

    Login:(req,res)=>{
        const {email,password}=req.body;

        User.find({email}).then((rows)=>{
            if(rows.length == 0)//במידה והמשתצש לא נמצא
                return res.status(409).json({msg:"User Not Found"})
            //הפונקציה מקבלת מחרוזת ואת המחרוזת המוצפנת,
            //ומחזירה אמת במידה והן תואמות, אחרת תחזיר שקר
            bcrypt.compare(password,rows[0].password).then((status)=>{
                if(!status)//במידה והסיסמה אינה תואמת נחזיר שגיאה
                    return res.status(409).json({msg:"Email Or Password Are Wrong"});
                else
                {
                    //הפונקציה מקבלת מחרוזת ליצירת, קוד מפתח שהמצאנו, זמן תפוגה
                    //const token = jwt.sign({email},process.env.SECRET_KEY,{expiresIn:"1H"});
                    return res.status(200).json({msg:"Login seccessfull"});
                }             
            });
        });
    },

    Reg:(req,res)=>{
        const {uid,name,password,email,phone}=req.body;
        User.find({email}).then((rows)=>{
            if(rows.length > 0)//במידה ונמצא משתמש עם אותו שם משתמש
                return res.status(409).json({msg:"UserAlready Exist Please Choiose Another"})
            
                var len = 10;
                var pattern = '0123456789'
                var id = randomId(len, pattern)
                      //יצירת האובייקט מסוג משתמש
                    bcrypt.hash(password,12).then((hashPass)=>{
                        const users =new User({
                            _id:new mongoose.Types.ObjectId(),
                            uid:id,
                            name:name,
                            password:hashPass,
                            email:email,
                            phone:phone
                        });
                        users.save().then((user)=>{
                            return res.status(200).json({msg:"User Registed succesfully",user});
                        }).catch((error)=>{
                            return res.status(505).json({error});
                        });
                    });               
        });
    }, 
    
    
    
    RecoverPass:(req,res)=>{
        const email=req.body;
        User.find({email:email.email}).then((rows)=>{
            if(rows.length==0){
                    return res.status(409).json({msg:"Email Not Found"})
            }
            else{
                const token=GetRandomString(9);   
                subj="reset password mod";
                body=`<h1> hello from nodemailer's simon your temporary pass: <br> ${token}</h1>`;
                require('../../../EmailSend').emailsend(email.email,subj,body);
                User.updateOne({email:email.email},{$set:{password:token}}, null).then((data)=>{
                  if(data.modifiedCount==1){
                    return res.status(200).json({msg:`Email Send seccessfully`});
                  }
                });
               
            }
        })
    },
    ConfirmRecover:(req,res)=>{
            const {tok,email,newpass}=req.body;
            User.find({password:tok,email}).then((rows)=>{
                if(rows.length==0){
                    res.status(409).json({msg:"temp pass or email not right"});
                }
                else{
                    bcrypt.hash(newpass,12).then((hashpass)=>{
                        User.updateOne({email:email},{$set:{password:hashpass}}).then((data)=>{
                            if(data.modifiedCount==1){
                                return res.status(200).json({msg:`Password updateed seccessfully`});
                            }
                            else{
                                return res.status(409).json({msg:"cant find  "});
                            }
                        });
                    });
               
                  
                   
                }
            })
        }


}