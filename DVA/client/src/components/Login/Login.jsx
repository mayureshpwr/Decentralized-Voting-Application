import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./login.css";

const Login = () => {
  const navigate = useNavigate();
  const loginWithAddress = async (address) => {
    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountAddress: address }),
      });

      const data = await response.json();
      // console.log(data, "Data data");
      if (data.status === true) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("accountAddress", data.data.connectAddress);
        localStorage.setItem("username", data.data.username);
        localStorage.setItem("auth", true);
        alert("User login successfully");
        navigate("/");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleClick = async () => {
    if (window.ethereum) {
      try {
        if (window.ethereum.selectedAddress) {
          const address = window.ethereum.selectedAddress;
          // Make API call to login
          // console.log(address, "address", "current Account Address");
          await loginWithAddress(address);
        } else {
          // User needs to select an address in MetaMask
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          const address = accounts[0];
          await loginWithAddress(address);
        }
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("Please install MetaMask to proceed.");
    }
  };

  useEffect(() => {

  },[navigate])
  return (
    <div className="loginContainer">
      <div className="loginBox">
        <div className="mainDiv">
          <img src="./logo.png" alt="" className="mainLobo" />
        </div>

        <div className="loginContent">
          <p>EMBRACE THE POWER OF DEMOCRACY</p>
          <div className="loginLinkGroup">
            <button onClick={handleClick} className="Loginbutton">
              Connect to MetaMask
            </button>
            <NavLink to={"/register"}>
              <p className="registerlinkInLogin">Create Account!</p>
            </NavLink>
          </div>
          
        </div>
      </div>
      <footer
        style={{
          textAlign: "center",
          position: "absolute",
          bottom: "-20px",
          left: "50%",
          transform: "translateX(-50%)",
          color: "white",
          fontSize: "13px",
        }}
      >
        &copy; 2024 Mayuresh Pawar. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
