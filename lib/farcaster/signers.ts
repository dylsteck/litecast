import { secp256k1 } from '@noble/curves/secp256k1.js';
import { keccak_256 } from '@noble/hashes/sha3.js';
import { HDKey } from '@scure/bip32';
import { mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { bytesToHex, utf8 } from './bytes';

const CUSTODY_PATH = "m/44'/60'/0'/0/0";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export function getInjectedWallet(): EthereumProvider | undefined {
  const ethereum = (globalThis as { ethereum?: EthereumProvider }).ethereum;
  return ethereum?.request ? ethereum : undefined;
}

export async function connectWallet(): Promise<string> {
  const wallet = getInjectedWallet();
  if (!wallet) throw new Error('No Ethereum wallet found. Use a recovery phrase or install a browser wallet.');
  const accounts = (await wallet.request({ method: 'eth_requestAccounts' })) as string[];
  const address = accounts[0];
  if (!address) throw new Error('Wallet did not return an account');
  return address.toLowerCase();
}

export async function walletSignMessage(message: string, address: string): Promise<string> {
  const wallet = getInjectedWallet();
  if (!wallet) throw new Error('Wallet disconnected');
  const signature = await wallet.request({
    method: 'personal_sign',
    params: [`0x${bytesToHex(utf8(message))}`, address],
  });
  if (typeof signature !== 'string' || !signature.startsWith('0x')) {
    throw new Error('Wallet returned an invalid signature');
  }
  return signature;
}

export function parseMnemonic(value: string): string {
  const phrase = value.trim().toLowerCase().split(/\s+/).join(' ');
  const count = phrase.split(' ').length;
  if ((count !== 12 && count !== 24) || !validateMnemonic(phrase, wordlist)) {
    throw new Error('Enter a valid 12 or 24 word recovery phrase');
  }
  return phrase;
}

export function custodyFromMnemonic(phrase: string) {
  const seed = mnemonicToSeedSync(parseMnemonic(phrase));
  const key = HDKey.fromMasterSeed(seed).derive(CUSTODY_PATH);
  if (!key.privateKey) throw new Error('Could not derive a custody key');
  return {
    address: addressFromPrivateKey(key.privateKey),
    privateKey: key.privateKey,
  };
}

export function addressFromPrivateKey(privateKey: Uint8Array): string {
  const publicKey = secp256k1.getPublicKey(privateKey, false).slice(1);
  return `0x${bytesToHex(keccak_256(publicKey).slice(-20))}`;
}

export function localSignMessage(message: string, privateKey: Uint8Array): string {
  const prefix = `\x19Ethereum Signed Message:\n${utf8(message).length}`;
  const hash = keccak_256(utf8(prefix + message));
  const signature = secp256k1.sign(hash, privateKey, { prehash: false, lowS: true, format: 'recovered' });
  signature[64] = (signature[64] ?? 0) + 27;
  return `0x${bytesToHex(signature)}`;
}

