// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
import networks from '../../constants/networks';

before(() => {
  // Check if lisk core is running
  cy.request(`${networks.devnet.node}/api/node/constants`).then(resp => expect(resp.status).to.eq(200));
});

beforeEach(() => {
  window.localStorage.setItem('settings', '{"areTermsOfUseAccepted": true}');
});

Cypress.Commands.add('addToLocalStorage', (item, value) => {
  window.localStorage.setItem(item, value);
});

Cypress.Commands.add('addObjectToLocalStorage', (item, key, value) => {
  const itemString = window.localStorage.getItem(item);
  const itemObject = itemString ? JSON.parse(itemString) : {};
  itemObject[key] = value;
  window.localStorage.setItem(item, JSON.stringify(itemObject));
});

Cypress.Commands.add('autologin', (passphrase, network) => {
  localStorage.setItem('liskCoreUrl', network);
  localStorage.setItem('loginKey', passphrase);
});

Cypress.Commands.add('hwWalletAutoLogin', (account, network) => {
  localStorage.setItem('liskCoreUrl', network);
  // localStorage.setItem('hwWalletAutoLogin', true);

  cy.window().its('hwWalletUtils').then((hwWalletUtils) => {
    console.log('ipcD', hwWalletUtils);
    cy.stub(hwWalletUtils.TransportU2F, 'create', () => {
      console.log('CY created');
      return 'hehe';
    });

    class DposLedger {
      // eslint-disable-next-line class-methods-use-this
      getPubKey() {
        console.log('CY getPubKey');
        return new Promise(resolve => resolve(account));
      }
    }
    cy.stub(hwWalletUtils, 'DposLedger', DposLedger);

    class LedgerAccount {
      // eslint-disable-next-line class-methods-use-this
      coinIndex() {
        console.log('CY coinIndex');
      }
      // eslint-disable-next-line class-methods-use-this
      account() {
        console.log('CY accoun');
      }
    }
    cy.stub(hwWalletUtils, 'LedgerAccount', LedgerAccount);
  });
});
