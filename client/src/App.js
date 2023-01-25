import { useContext, useEffect } from "react";
import { UserContext } from "./context/UserContext";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./Login/Login";
import SignUp from "./pages/SignUp/SignUp";

function App() {
  const [userData, setUserData] = useContext(UserContext);
  const checkLoggedIn = async () => {
    //check if token alerady exists in localStorage
    let token = localStorage.getItem("auth-token");
    if (token === null) {
      //token not in localStorage then set auth token empty
      localStorage.setItem("auth-token", "");
      token = "";
    } else {
      //if token exists in localStorage then use auth to verify token and get user info
      const userRes = await axios.get("http://localhost:4000/api/users", {
        headers: { "x-auth-token": token },
      });

      setUserData({
        token,
        user: {
          id: userRes.data.data.user_id,
          display_name: userRes.data.data.user_name,
        },
      });
    }
  };
  const logout = () => {
    //set global state to undefined will logout the user
    setUserData({
      token: undefined,
      user: undefined,
    });

    //resetting localStorage
    localStorage.setItem("auth-token", "");
  };

  useEffect(() => {
    checkLoggedIn();//check if the user is logged in
  }, []);
  return (
    <Router>
      <div>
      <h1>Hi</h1>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          passing logout function as props to Home page
          <Route path="/" element={<Home logout={logout} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
