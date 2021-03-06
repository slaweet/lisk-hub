/* eslint-disable */
import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps';
import networks from '../../../constants/networks';
import ss from '../../../constants/selectors';
import urls from '../../../constants/urls';
import accounts from '../../../constants/accounts';
import compareBalances from '../../utils/compareBalances';

const transactionFee = 0.1;

const getRandomAddress = () => `23495548666${Math.floor((Math.random() * 8990000) + 1000000)}L`;
const getRandomAmount = () => Math.floor((Math.random() * 10) + 1);
const getRandomReference = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
const errorMessage = 'Test error';

let randomAddress;
let randomAmount;
let randomReference;

Then(/^I fill random recipient$/, function () {
  this.randomAddress = getRandomAddress();
  cy.get(ss.recipientInput).type(this.randomAddress);
});

Then(/^I fill random amount$/, function () {
  randomAmount = getRandomAmount();
  cy.get(ss.amountInput).click().type(randomAmount);
});

Then(/^I fill random message$/, function () {
  randomReference = getRandomReference();
  cy.get(ss.sendReferenceText).click().type(randomReference);
});

Then(/^I follow the launch protokol link$/, function () {
  cy.visit(`${urls.send}/?recipient=4995063339468361088L&amount=5&reference=test`);
});

Then(/^I follow the launch protokol link$/, function () {
  cy.visit(`${urls.send}/?recipient=4995063339468361088L&amount=5&reference=test`);
});

Then(/^Send form fields are prefilled$/, function () {
  cy.get(ss.recipientInput).should('have.value', '4995063339468361088L');
  cy.get(ss.amountInput).should('have.value', '5');
  cy.get(ss.sendReferenceText).should('have.value', 'test');
});

Then(/^I mock api \/transactions$/, function () {
  cy.server({ status: 409 });
  cy.route('POST', '/api/transactions', { message: errorMessage });
});

Then(/^I see error message$/, function () {
  cy.get(ss.submittedTransactionMessage).contains(errorMessage);
});

Given(/^I remember my balance$/, function () {
  cy.get(ss.headerBalance).invoke('text').as('balanceBefore');
});

Then(/^The balance is subtracted$/, function () {
  cy.get(ss.headerBalance).invoke('text').as('balanceAfter').then(function () {
    compareBalances(this.balanceBefore, this.balanceAfter, randomAmount + transactionFee);
  });
});





