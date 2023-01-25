const {
  register,
  getAllUsers,
  userById,
  getUserByEmail,
  profile,
} = require("./user.service");
//Importing database structure 
const pool = require("../../config/database");

//Importing bcryptJs module to use password encryption
const bcrypt = require("bcryptjs");

//jsonwebtoken help to create a token
const jwt = require("jsonwebtoken");

//exporting all methods
module.exports = {
  //to create a method
  createUser: (req, res) => {
    const { userName, firstName, lastName, email, password } = req.body; //this data comes from front end
    console.log(req.body);
    //validation
    if (!userName || !firstName || !lastName || !email || !password)
      return res.status(400).json({ msg: "Not all fildes have been provided" });
    if (password.length < 8)
      return res
        .status(400)
        .json({ msg: "Password must be at least 8 characters!" });
    pool.query(
      "SELECT * FROM registration WHERE user_email = ?",
      [email],
      (err, results) => {
        if (err) {
          return res.status(err).json({ msg: "database connection err" });
        }
        if (results.length > 0) {
          return res
            .status(400)
            .json({ msg: "An account with this email alerady exists!" });
        } else {
          const salt = bcrypt.genSaltSync();
          req.body.password = bcrypt.hashSync(password, salt); //update the passwords

          register(req.body, (err, results) => {
            if (err) {
              //to check the connection is err
              console.log(err);
              return res.status(500).json({ msg: "k database connection err" });
            }
            pool.query(
              "SELECT * FROM registration WHERE user_email = ?",
              [email],
              (err, results) => {
                if (err) {
                  return res
                    .status(err)
                    .json({ msg: "database connection err" });
                }

                req.body.userId = results[0].user_id;
                console.log(req.body);
                profile(req.body, (err, results) => {
                  if (err) {
                    console.log(err);
                    return res
                      .status(500)
                      .json({ msg: "database connection err" });
                  }
                  return res.status(200).json({
                    msg: "New user added successfully",
                    data: results,
                  });
                });
              }
            );
          });
        }
      }
    );
  },
  getUsers: (req, res) => {
    getAllUsers((err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "database connection err" });
      }
      return res.status(200).json({ data: results });
    });
  },
  getUserById: (req, res) => {
    //const id = req.params.id;
    //const.log("id===>",id,"user===>",req.id);
    userById(req.id, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ msg: "database connection err" });
      }
      if (!results) {
        return res.status(404).json({ msg: "Record not found" });
      }
      return res.status(200).json({ data: results });
    });
  },
  login: (req, res) => {
    const { email, password } = req.body;
    //validation
    if (!email || !password)
      return res.status(400)
      .json({ msg: "Not all filds have been provided!" });

    getUserByEmail(email, (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).json({ msg: " database connection err " });
      }
      if (!results) {
        return res
          .status(404)
          .json({ msg: "No account with this email has been registered" });
      }
       //creating token for the signed user that expires in 1 hour and 
// using our secret key for creation
const token = jwt.sign({ id: results.user_id }, process.env.
JWT_SECRET, { expiresIn: "1h" });

            //returning token and user-info
      return res.json({
        token,
        user: {
          id: results.user_id,
          display_name: results.user_name,
        },
      });
    });
  },
};
