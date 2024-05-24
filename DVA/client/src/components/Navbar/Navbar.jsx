import React, { useState, useEffect } from "react";
import "./Navbar.css";
import { FaUser } from "react-icons/fa";
import { FaWallet } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const [shortenedAccount, setShortenedAccount] = useState("");
  const [username, setUsername] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const accountAddress = localStorage.getItem("accountAddress");
    const user = localStorage.getItem("username");
    const auth = localStorage.getItem("auth");

    if (user) {
      setUsername(user);
    }
    if (accountAddress) {
      const shortenedAddress = `${accountAddress.slice(
        0,
        10
      )}...${accountAddress.slice(-10)}`;
      setShortenedAccount(shortenedAddress);
    }
    if (auth === "true") {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
    }
  }, []);

  // Function to handle logout
  const disconnect = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(data, "dat nav a");
      if (data.status === true) {
        // Remove token from localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("accountAddress");

        localStorage.setItem("auth", false);
        alert("User logout successfully");
        navigate("/login");
        setAuthenticated(false); // Update state
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="navbar">
      <div className="Container">
        <div className="logoAndName">
          <img src="./logo.png" alt="" />
          <p>DVA</p>
        </div>
        <div className="navbarAuth">
          {authenticated ? (
            <>
              <div className="username">
                <FaUser className="usericon" />
                <span>{username}</span>
              </div>
              <div className="metamaskWallet">
                <FaWallet className="walletIcon" />
                <span>{shortenedAccount}</span>
              </div>
              <div className="disconnectbuttondiv">
                <button className="disconnectbutton" onClick={disconnect}>
                  Disconnect
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="navbarLoginBVutton"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
