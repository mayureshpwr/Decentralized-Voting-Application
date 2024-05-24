import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NavLink } from "react-router-dom";
import MyContractABI from "../../constant/MyContractABI.json";
import { ContractAddress } from "../../constant/ContractAddress";
import { useNavigate } from "react-router-dom";
import "./Voting.css";
import Loading from "../Loading/Loading";

const Voting = () => {
  const [status, setStatus] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);
  const [Candidate, setCandidate] = useState(null);
  const [auth, setAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [number, setNumber] = useState("");
  const [votingByAddress, setVotingByAddress] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState("");
  const [registeredAddress, setRegisteredAddress] = useState(""); // State to store registered address from localStorage
  const [winner, setWinner] = useState(null); // State to store winner information
  const navigate = useNavigate();

  useEffect(() => {
    const storedAddress = localStorage.getItem("accountAddress");
    if (storedAddress) {
      setRegisteredAddress(storedAddress);
    }
  }, []);

  
  async function getCurrentStatus() {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const account = await signer.getAddress(); // Get the connected account address
      setConnectedAccount(account); // Set the connected account address
      const contract = new ethers.Contract(
        ContractAddress,
        MyContractABI,
        signer
      );
      const status = await contract.getVotingStatus();
      setStatus(status);
      if (status === true) {
        const candidateMember = await contract.getAllVotesOfCandidates();
        setCandidate(candidateMember);
      }
    } catch (error) {
      console.error("Error while getting voting status:", error);
    }
  }

  const getRemainingTime = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        ContractAddress,
        MyContractABI,
        provider.getSigner()
      );
      const time = await contract.getRemainingTime();
      setRemainingTime(parseInt(time, 10));
    } catch (error) {
      console.error("Error while getting remaining time:", error);
    }
  };

  useEffect(() => {
    getCurrentStatus();
    getRemainingTime();
    const getLocalStorageToken = localStorage.getItem("token");
    if (getLocalStorageToken) {
      setAuth(true);
    }
  }, []);

  useEffect(() => {
    const main = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(
          ContractAddress,
          MyContractABI,
          signer
        );
        const votingByAddress = await contract.voters(connectedAccount);
        setVotingByAddress(votingByAddress);
      } catch (error) {
        console.error("Error while getting voting status:", error);
      }
    };
    main();
  }, [connectedAccount]);

  const voteFunction = async (number) => {
    setIsButtonClicked(true);
    setLoading(true); 
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        ContractAddress,
        MyContractABI,
        provider.getSigner()
      );
      const userIndex = parseFloat(number - 1);
      const vote = await contract.vote(userIndex);
      const news = await vote.wait();
      console.log(vote, "Vote done");
      console.log(news, "news");
      setLoading(false); 
      setIsButtonClicked(false); 
      window.location.reload();
    } catch (error) {
      console.error(error, "errr");
      if (error.code === "ACTION_REJECTED") {
        alert("User cancelled Transition");
      } else if (
        error.error.message === "execution reverted: You have already voted."
      ) {
        alert("You already Voted");
      } else {
        alert("Something Went Wrong");
      }
      setLoading(false);
      setIsButtonClicked(false);
      window.location.reload();
    }
  };

  const handleVerify = async (number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token not found");
      }
      const response = await fetch("http://localhost:5000/voting", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to verify token");
      }

      const data = await response.json();
      console.log(data, "Token verified:");

      if (data.isVerified === true) {
        await voteFunction(number); 
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      navigate("/login");
    }
  };

  useEffect(() => {
    const getWinnerOfVoing = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(
          ContractAddress,
          MyContractABI,
          provider.getSigner()
        );
        const [winnerName, winnerVotes] = await contract.showWinner();
        // console.log(winnerName, "contract winner");
        setWinner({ name: winnerName, voteCount: winnerVotes });
      } catch (error) {
        console.error("Error while getting winner:", error);
      }
    };
    getWinnerOfVoing();
  }, []);

  return (
    <div className="votingContainer">
      {winner && (
        <div className="winnercard">
          Winner🎇: {winner.name ? winner.name : "No winner"}, Votes: 
          {winner.voteCount.toString()}
        </div>
      )}
      <div className="votingBox">
        <h1>Voting Is your Choice</h1>

        {loading ? (
          <Loading />
        ) : (
          <div className="votingContent">
            <p className="remaningTime">
              Remaining Time: <span>{remainingTime}</span>
            </p>
            {/* Voting Input  */}
            <div className="VotingInput">
              <label htmlFor="" className="candidateNamelabel">
                Select candidate Number
              </label>
              <input
                type="number"
                placeholder="Select Candidate Id here"
                value={number}
                onChange={(e) => {
                  const inputNumber = parseInt(e.target.value);
                  if (
                    !isNaN(inputNumber) &&
                    inputNumber >= 1 &&
                    inputNumber <= 4
                  ) {
                    setNumber(inputNumber);
                  }
                }}
                className="candidateInputBox"
              />
            </div>
            <div className="buttonGroup">
              {/* auth  */}
            {auth ? (
              status ? (
                registeredAddress === connectedAccount.toLocaleLowerCase() ? ( 
                  <button
                    className={`VoteButton ${
                      status && votingByAddress ? "disabled" : "voteButtons"
                    }`} 
                    disabled={isButtonClicked || !status || votingByAddress} 
                    onClick={() => handleVerify(number)} 
                  >
                    {loading ? "Loading..." : "Vote"}
                  </button>
                ) : (
                  <p>Please use registered address to vote</p> 
                )
              ) : (
                <p>Voting has not started yet</p>
              )
            ) : (
              <button className="loginToVoteButton">

                <NavLink to="/login">Login to vote</NavLink>
              </button>
            )}
            </div>
          </div>
        )}
      </div>

      <div className="candidateBox">
        {Candidate && Candidate.length > 0 ? (
          <table id="myTable" className="candidates-table">
            <thead>
              <tr>
                <th>Index</th>
                <th>Candidate Party</th>
                <th>Candidate Votes</th>
              </tr>
            </thead>
            <tbody>
              {Candidate.map((candidate, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{candidate.name}</td>
                  <td>{candidate.voteCount.toNumber()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No candidates available</p>
        )}
      </div>
      
    </div>
  );
};

export default Voting;
