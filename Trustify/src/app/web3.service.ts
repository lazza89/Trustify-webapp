import { Injectable, Provider } from '@angular/core';
import { WalletService } from './wallet.service';
import Web3 from 'web3';
import { provider } from 'web3-core';

@Injectable({
  providedIn: 'root',
})
export class Web3Service {
  private contractAddress = "0xE45855601095597163f2081d8d1bc26cc283d202"; //address del contratto
  //https://sepolia.etherscan.io/address/0xE45855601095597163f2081d8d1bc26cc283d202
  private contractAddressTC = "0xDE3160A2B9feE2a47DF91Ce47DA53065EEfa25b1";
  //https://sepolia.etherscan.io/address/0xDE3160A2B9feE2a47DF91Ce47DA53065EEfa25b1

  private provider!: provider;
  private address!: string[];
  private web3WalletProvider: Web3;
  private m_wallet: WalletService;
  private readonly infuraHTTPProvider: string =
    'https://sepolia.infura.io/v3/1caadfe504ce4531b041de4bc8927ceb';
  private walletConnected: boolean = false;
  private abi = require('../../contracts/Trustify.json')
  private abiTC = require('../../contracts/TCoin.json');


  constructor() {
    this.m_wallet = new WalletService();
    this.web3WalletProvider = new Web3(
      new Web3.providers.HttpProvider(this.infuraHTTPProvider)
    );

    this.IsWalletConnected();
  }

  public getAddress() {
    return this.address[0];
  }

  public async getBalance() {
    const balance = await this.web3WalletProvider.eth.getBalance(this.address[0]);
    return Web3.utils.fromWei(balance);
  }

  async IsWalletConnected() {
    this.walletConnected = await this.m_wallet.isConnected();
    if (this.walletConnected) {
      this.ConnectWallet();
    }
  }

  async ConnectWallet() {
    this.provider = await this.m_wallet.Connect();
    if (this.provider) {
      this.web3WalletProvider = new Web3(this.provider);
      this.address = await this.web3WalletProvider.eth.getAccounts();
      console.log(this.address[0]);

      const balance = await this.web3WalletProvider.eth.getBalance(
        this.address[0]
      );

      this.walletConnected = true;
      console.log(Web3.utils.fromWei(balance));
    }
  }

  async pullTCoin() {
    const contract = new this.web3WalletProvider.eth.Contract(
      this.abiTC.abi, this.contractAddressTC
    );
    this.ConnectWallet();
    await contract.methods.drip().send({ from: this.address[0] });
  }
  async ApproveTokens(amount: number) {
    if (this.walletConnected) {
      const contract = new this.web3WalletProvider.eth.Contract(this.abiTC.abi, this.contractAddressTC);
      await contract.methods.approve(this.contractAddress, Web3.utils.toWei(amount.toString(), "ether")).send({ from: this.address[0] });
    } else console.log("wallet not connected");
  }

  async getTokenBalance(): Promise<number> {
    const contract = new this.web3WalletProvider.eth.Contract(this.abiTC.abi, this.contractAddressTC);
    let balance = await contract.methods.balanceOf(this.getAddress()).call({ from: this.getAddress() });
    balance = Web3.utils.fromWei(balance);
    return balance;
  }

  async DepositTokens(address: string, amount: number) {
    if (this.walletConnected) {
      ///        await coin.approve(holder.address, ethers.parseEther("100"));

      const contract = new this.web3WalletProvider.eth.Contract(this.abi.abi, this.contractAddress);

      await contract.methods.DepositTokens(
        address,
        Web3.utils.toWei(amount.toString(), "ether")
      ).send({ from: this.address[0] })
        .on('transactionHash', function (hash: any) {
          console.log(hash);
        })
        .on('receipt', function (receipt: any) {
          console.log(receipt + "Done!");
        })
        .on('error', console.error)
    } else console.log("wallet not connected");

  }

  async WriteAReview(address: string, review: string, stars: number) {
    console.log("Scriviamo");
    if (this.walletConnected) {
      const contract = new this.web3WalletProvider.eth.Contract(this.abi.abi, this.contractAddress);
      await contract.methods.WriteAReview(
        address,
        review,
        stars
      ).send({ from: this.address[0] })
        .on('transactionHash', function (hash: any) {
          console.log(hash);
        })
        .on('receipt', function (receipt: any) {
          console.log(receipt + "Done!");
        })
        .on('error', console.error)
    } else console.log("wallet not connected");

  }

  async GetNCompanyReview(from: number, to: number, address: string) {
    console.log("Roma");

    const contract = new this.web3WalletProvider.eth.Contract(
      this.abi.abi,
      this.contractAddress
    );
    let output, dio;
    output = await contract.methods.GetNCompanyReview(from, to, address).call();
    console.log(output);
    console.log(output[0][0], output[0][1]);
    return [output, dio];
  }

  async GetSpecificReview(address: string) {
    const contract = new this.web3WalletProvider.eth.Contract(
      this.abi.abi,
      this.contractAddress
    );
    let review: string;
    let star: number;
    [review, star] = await contract.methods.GetSpecificReview(address).call();
    return [review, star];
  }

  async GetNMyReview(from: number, to: number) {
    if (this.walletConnected) {
      const contract = new this.web3WalletProvider.eth.Contract(
        this.abi.abi,
        this.contractAddress
      );

      let output = await contract.methods.GetNMyReview(from, to).call({ from: this.address[0] });
      return output;
    }
    return;
  }

  //Ritorna un array con tutte le "stars"
  async GetAverageStarsArray(address: string) {
    const contract = new this.web3WalletProvider.eth.Contract(
      this.abi.abi,
      this.contractAddress
    );
    let stars: number[];
    stars = await contract.methods.GetAverageStars(address).call();
    return stars;
  }

  //Ritorna la media effettiva di tutte le "stars"
  async GetAverageStars(address: string) {
    let array: number[];
    array = await this.GetAverageStarsArray(address);
    /*let sum=0;
    for(let i=0;i<array.length;i++){
      sum+=array[i];
    }
    return sum/array.length;*/
    return array.reduce((a, b) => a + b, 0) / array.length; //dovrebbe calcolare la media direttamente così
  }
}