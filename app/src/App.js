import { ethers } from "ethers";
import { useEffect, useState } from "react";
import deploy from "./deploy";
import Escrow from "./Escrow";

const provider = new ethers.providers.Web3Provider(window.ethereum);

export async function approve(escrowContract, signer) {
  const approveTxn = await escrowContract.connect(signer).approve();
  await approveTxn.wait();
}

async function saveEscrow(escrow) {
  const reqBody = JSON.stringify(escrow);
  console.log(`Saving escrow ${reqBody}...`);
  const response = await fetch("http://localhost:3003/api/escrows", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: reqBody,
  });

  if (response.ok) {
    console.log(await response.json());
  } else {
    throw new Error("Something went wrong");
  }
}

async function getEscrows() {
  const response = await fetch("http://localhost:3003/api/escrows");

  if (response.ok) {
    const escrows = await response.json();
    console.log(escrows);
    escrows.forEach((escrow) => {
      escrow.key = escrow.contract;
    });
    return escrows;
  } else {
    throw new Error("Something went wrong");
  }
}

function App() {
  const [escrows, setEscrows] = useState([]);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();

  useEffect(() => {
    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    getAccounts();
  }, [account]);

  useEffect(() => {
    getEscrows().then((res) => setEscrows(res));
  }, []);

  async function newContract() {
    const beneficiary = document.getElementById("beneficiary").value;
    const arbiter = document.getElementById("arbiter").value;
    const value = ethers.BigNumber.from(document.getElementById("wei").value);
    const escrowContract = await deploy(signer, arbiter, beneficiary, value);
    console.log(`Contract deployed to ${escrowContract.address}!`);

    const escrow = {
      address: escrowContract.address,
      key: escrowContract.address,
      arbiter,
      beneficiary,
      value: value.toString(),
      handleApprove: async () => {
        escrowContract.on("Approved", () => {
          document.getElementById(escrowContract.address).className =
            "complete";
          document.getElementById(escrowContract.address).innerText =
            "✓ It's been approved!";
        });

        await approve(escrowContract, signer);

        saveEscrow({
          signer: await signer.getAddress(),
          contract: escrowContract.address,
          arbiter,
          beneficiary,
          value: value.toString(),
        });
      },
    };

    setEscrows([...escrows, escrow]);
  }

  return (
    <>
      <div className="contract">
        <h1> New Contract </h1>
        <label>
          Arbiter Address
          <input type="text" id="arbiter" />
        </label>

        <label>
          Beneficiary Address
          <input type="text" id="beneficiary" />
        </label>

        <label>
          Deposit Amount (in Wei)
          <input type="text" id="wei" />
        </label>

        <div
          className="button"
          id="deploy"
          onClick={(e) => {
            e.preventDefault();

            newContract();
          }}
        >
          Deploy
        </div>
      </div>

      <div className="existing-contracts">
        <h1> Existing Contracts </h1>

        <div id="container">
          {escrows.map((escrow) => {
            return <Escrow key={escrow.address} {...escrow} />;
          })}
        </div>
      </div>
    </>
  );
}

export default App;
