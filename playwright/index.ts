/* eslint-disable import/no-extraneous-dependencies */
import { test as base } from '@playwright/test'
import { Web3ProviderBackend, injectHeadlessWeb3Provider } from 'headless-web3-provider'

import { Accounts, createAccounts } from './fixtures/accounts'
import { createContracts } from './fixtures/contracts'
import { Login } from './fixtures/login'
import { createMakeNames } from './fixtures/makeName/index'
import { Provider, createProvider } from './fixtures/provider'
import { createSubgraph } from './fixtures/subgraph'
import { createTime } from './fixtures/time'
import { createPageObjectMaker } from './pageObjects'

type Fixtures = {
  accounts: Accounts
  wallet: Web3ProviderBackend
  provider: Provider
  login: InstanceType<typeof Login>
  getContract: (contract: string) => any
  makeName: ReturnType<typeof createMakeNames>
  makePageObject: ReturnType<typeof createPageObjectMaker>
  subgraph: ReturnType<typeof createSubgraph>
  time: ReturnType<typeof createTime>
  contracts: ReturnType<typeof createContracts>
}

export const test = base.extend<Fixtures>({
  // signers - the private keys that are to be used in the tests
  accounts: createAccounts(),
  contracts: async ({ accounts, provider }, use) => {
    await use(createContracts({ accounts, provider }))
  },
  wallet: async ({ page, accounts }, use) => {
    const privateKeys = accounts.getAllPrivateKeys()
    const wallet = await injectHeadlessWeb3Provider(
      page,
      privateKeys,
      1337,
      'http://localhost:8545',
    )
    await use(wallet)
  },
  // eslint-disable-next-line no-empty-pattern
  provider: async ({}, use) => {
    const provider = createProvider()
    await use(provider)
  },
  login: async ({ page, wallet, accounts }, use) => {
    const login = new Login(page, wallet, accounts)
    await use(login)
  },
  makeName: async ({ accounts, provider, time }, use) => {
    const makeNames = createMakeNames({ accounts, provider, time })
    await use(makeNames)
  },
  makePageObject: async ({ page, wallet }, use) => {
    await use(createPageObjectMaker({ page, wallet }))
  },
  subgraph: async ({ provider }, use) => {
    const subgraph = createSubgraph({ provider })
    await use(subgraph)
  },
  time: async ({ provider, page }, use) => {
    await use(createTime({ provider, page }))
  },
})
