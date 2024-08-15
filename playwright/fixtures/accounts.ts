/* eslint-disable import/no-extraneous-dependencies */
import dotenv from 'dotenv'
import { Account, Address, bytesToHex, TestClient } from 'viem'
import { mnemonicToAccount, nonceManager } from 'viem/accounts';
import { privateKeyToAccount } from 'viem/accounts'

dotenv.config()

const DEFAULT_MNEMONIC = 'test test test test test test test test test test test junk'

const shortenAddress = (address = '', maxLength = 10, leftSlice = 5, rightSlice = 5) => {
  if (address.length < maxLength) {
    return address
  }

  return `${address.slice(0, leftSlice)}...${address.slice(-rightSlice)}`
}

export type Dependencies = {
  provider: TestClient<'anvil'>
}

export type Accounts = ReturnType<typeof createAccounts>

export type User = 'user' | 'user2' | 'user3'

export const createAccounts = (stateful = false) => {
  const mnemonic = stateful ? process.env.SECRET_WORDS || DEFAULT_MNEMONIC : DEFAULT_MNEMONIC

  const users: User[] = ['user', 'user2', 'user3']

  const { accounts, privateKeys} = users.reduce<{ accounts: Account[], privateKeys: Uint8Array[]}>((acc, _, index) => {
    const { getHdKey } = mnemonicToAccount(mnemonic, { addressIndex: index })
    const privateKey = getHdKey().privateKey!
    const account = privateKeyToAccount(bytesToHex(privateKey), { nonceManager }) 
    return {
      accounts: [...acc.accounts, account],
      privateKeys: [...acc.privateKeys, privateKey]
    }
  }, {accounts: [], privateKeys: []})

  // const accounts = [0, 1, 2].map((index: number) => {
  //   const { getHdKey } = mnemonicToAccount(mnemonic, { addressIndex: index })
  //   const privateKey = getHdKey().privateKey!
  //   const account = privateKeyToAccount(privateKey, { nonceManager })

  //   return {
  //     user: `user${index ? index + 1 : ''}` as User,
  //     address: address as `0x${string}`,
  //     privateKey: bytesToHex(privateKey) as `0x${string}`,
  //   }
 return {
    getAccountForUser: (user: User) => {
      const index = users.indexOf(user)
      if (index < 0) throw new Error(`User not found: ${user}`)
      return accounts[index]
    },
    getAllPrivateKeys: () => privateKeys,
    getAddress: (user: User, length?: number): Address | string => {
      const index = users.indexOf(user)
      if ( index < 0) throw new Error(`User not found: ${user}`)
      const address = accounts[index].address
      if (!address) throw new Error(`Address not found: ${user}`)
      if (length) return shortenAddress(address, length) as string
      return address as Address
    },
    getPrivateKey: (user: User) => {
      const index = users.indexOf(user)
      if (index < 0) throw new Error(`User not found: ${user}`)
      return privateKeys[index]
    }
  }
}
