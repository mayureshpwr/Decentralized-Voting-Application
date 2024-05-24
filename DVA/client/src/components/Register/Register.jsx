import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./Register.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = (props) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [connectAddress, setConnectAddress] = useState(
    "You are not Connected!"
  );
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [showRegisterButton, setShowRegisterButton] = useState(false); // New state
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const detectProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      window.alert("No Ethereum browser detected! Please check out MetaMask.");
    }
    return provider;
  };

  const handleRegister = async () => {
    if (
      email.trim() !== "" &&
      username.trim() !== "" &&
      connectAddress !== ""
    ) {
      try {
        const response = await fetch("http://localhost:5000/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            username: username,
            connectAddress: connectAddress.toLowerCase(),
          }),
        });
        const data = await response.json();
        // console.log(data, "response ss");
        if (data.status === true) {
          alert("User registered successfully");
          toast("hiiii")
          navigate("/login");
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error("Error registering user:", error);
        alert("An error occurred while registering. Please try again later.");
      }
    } else {
      alert("Please fill in all fields and connect your wallet.");
    }
  };

  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      if (accounts.length > 0) {
        setConnectAddress(accounts[0]);
        setIsWalletConnected(true);
        setShowRegisterButton(true); // Show register button after wallet is connected
      } else {
        setConnectAddress("");
        setIsWalletConnected(false);
        setShowRegisterButton(false); // Hide register button if wallet is disconnected
      }
    };

    const provider = detectProvider();
    if (provider) {
      provider.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (provider) {
        provider.off("accountsChanged", handleAccountsChanged);
      }
    };
  }, []);
  const notify = () => toast("Wow so easy!");
  // switch network
  const networkId = 11155111; //testnet
  const networkData = [
    {
      chainId: ethers.utils.hexlify(networkId),
      rpcUrls: ["https://rpc.sepolia.org"],
      chainName: "sepolia Testnet",
      nativeCurrency: {
        name: "sepolia",
        symbol: "sepolia", // 2-6 characters long
        decimals: 18,
      },
      blockExplorerUrls: ["https://sepolia.etherscan.io/"],
    },
  ];
  const switchNetworks = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ethers.utils.hexlify(networkId) }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          const switching = await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: networkData,
          });
          await switching.wait();
        } catch (addError) {
          // handle "add" error
        }
      }
    }
  };

  const connectWallet = async () => {
    // setLoader(true)
    const provider = detectProvider();
    if (provider) {
      if (provider !== window.ethereum) {
        console.error(
          "Not window.ethereum . Do you have multiple wallets installed ?"
        );
      }
      await provider.request({
        method: "eth_requestAccounts",
      });
      const newProvider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = newProvider.getSigner();
      const account = await signer.getAddress();
      const network = await newProvider.getNetwork();
      // console.log(signer, "signer");
      // console.log(network, "newtwor");
      // console.log(account, "account");
      setConnectAddress(account);
      // setConnectAddress(account);
      setIsWalletConnected(true);
      setShowRegisterButton(true);
      if (network.chainId !== networkId) {
        await switchNetworks();
      }
      const changedProvider = new ethers.providers.Web3Provider(
        window.ethereum
      );
      const changedSigner = changedProvider.getSigner();
      const { chainId } = await changedProvider.getNetwork();
      // console.log(chainId);
    }
  };
  return (
    <div className="registerContainer">
      <div className="registerBox">
        <div className="mainDiv">
          <img src="./logo.png" alt="" className="mainLobo" />
          <h1 className="welcomemessage">
            WELCOME TO DECENTRALIZED VOTING APPLICATION
          </h1>
        </div>
        <div className="Formuinput">
          <form>
            <div className="inputDiv">
              <label>Email: </label>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter Email"
              />
            </div>
            <div className="inputDiv">
              <label>Username: </label>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="Enter username"
              />
            </div>
          </form>
          <p className="ConnetWalletAddress">
            Connected Address:{" "}
            <span className="connectAddressText">
              {" "}
              {connectAddress.toLocaleLowerCase()}
            </span>
          </p>
          {!isWalletConnected && (
            <button onClick={connectWallet} className="ConnectButtonRegister">
              Connect Wallet
            </button>
          )}
          {showRegisterButton && (
            <button className="registerButton" onClick={handleRegister}>
              Register
            </button>
          )}
          <NavLink to={"/login"}>
            <p className="AlreadyRegistered">Already regsitered!</p>
          </NavLink>
        </div>
        <ToastContainer />
      </div>
      
    </div>
  );
};

export default Register;
