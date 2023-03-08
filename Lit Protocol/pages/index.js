import LitJsSdk from "@lit-protocol/sdk-browser";
import { useState } from 'react';

// -- init litNodeClient
const litNodeClient = new LitJsSdk.LitNodeClient();
litNodeClient.connect();

function App() {

  const [text, settext] = useState('')


  const go = async () => {
    const projectId = ''; // <---------- your Infura Project ID
    const projectSecret = '0d806871c46b46e98428170aba39443f'; // <---------- your Infura Secret
    const messageToEncrypt = text;

    const chain = 'ethereum';

    const authSig = await LitJsSdk.checkAndSignAuthMessage({chain})

    const accessControlConditions = [
      {
        contractAddress: 'https://mainnet.infura.io/v3/0d806871c46b46e98428170aba39443f',
        standardContractType: '',
        chain: 'ethereum',
        method: 'eth_getBalance',
        parameters: [':userAddress', 'latest'],
        returnValueTest: {
          comparator: '>=',
          value: '0',  // 0 ETH, so anyone can open
        },
      },
    ];

    // 1. Encryption
    // <Blob> encryptedString
    // <Uint8Array(32)> symmetricKey 
    const { encryptedString, symmetricKey } = await LitJsSdk.encryptString(messageToEncrypt);

    console.log("🚨 Contenido Encriptado", symmetricKey);
    
    // 2. Saving the Encrypted Content to the Lit Nodes
    // <Unit8Array> encryptedSymmetricKey
    const encryptedSymmetricKey = await litNodeClient.saveEncryptionKey({
      accessControlConditions,
      symmetricKey,
      authSig,
      chain,
    });
    
    console.log("encryptedSymmetricKey:", encryptedSymmetricKey);
    console.log("🚨 String encriptado:", encryptedString);

    // 3. Decrypt it
    // <String> toDecrypt
    const toDecrypt = LitJsSdk.uint8arrayToString(encryptedSymmetricKey, 'base16');
    console.log("🚨toDecrypt:", toDecrypt);

    // <Uint8Array(32)> _symmetricKey 
    const _symmetricKey = await litNodeClient.getEncryptionKey({
      accessControlConditions,
      toDecrypt,
      chain,
      authSig
    })

    console.log("🚨 _symmetricKey:", _symmetricKey);

    // <String> decryptedString
    const decryptedString = await LitJsSdk.decryptString(
      encryptedString,
      symmetricKey
    );

    console.log("🚨 decryptedString:", decryptedString);
    
  }



  return (
    <div className="App">
      <header className="App-header">
        <input placeholder='Text' onChange={(e) => settext(e.target.value)}></input>
        <button onClick={() => go()}>🔥 Encriptar</button>
        <span>Text: {text}</span>
      </header>
    </div>
  );
}

export default App;