import accounts from '../../constants/accounts';
import compareBalances from '../utils/compareBalances';
import networks from '../../constants/networks';
import urls from '../../constants/urls';
import ss from '../../constants/selectors';

const txConfirmationTimeout = 12000;
const msg = {
  transferTxSuccess: "You'll find it in your Wallet and it will be confirmed in a matter of minutes.",
  accountInitializatoinAddress: 'Account initialization',
};
const getRandomAddress = () => `23495548666${Math.floor((Math.random() * 8990000) + 1000000)}L`;
const getRandomAmount = () => Math.floor((Math.random() * 10) + 1);
const getRandomReference = () => Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
const transactionFee = 0.1;

describe('Hw Wallet Send', () => {
  let randomAddress;
  let randomAmount;
  let randomReference;

  beforeEach(() => {
    randomAddress = getRandomAddress();
    randomAmount = getRandomAmount();
    randomReference = getRandomReference();
  });

  /**
   * Make a transfer with reference
   * @expect successfully go through transfer process
   * @expect transaction appears in the activity list as pending
   * @expect transaction appears in the activity list with correct data
   * @expect transaction appears in the activity list as confirmed
   */
  it('Transfer tx with ref appears in dashboard activity pending -> approved', () => {
    cy.visit(urls.hwWalletLogin);
    cy.hwWalletAutoLogin(accounts.genesis, networks.devnet.node);
    cy.get('.hw-device-button').eq(0).click();
    cy.get('.hw-device-buttond').eq(0).click();
    cy.visit(urls.send);
    cy.get(ss.recipientInput).type(randomAddress);
    cy.get(ss.sendReferenceText).click().type(randomReference);
    cy.get(ss.amountInput).click().type(randomAmount);
    cy.get(ss.nextTransferBtn).click();
    cy.get(ss.recipientConfirmLabel).last().contains(randomAddress);
    cy.get(ss.referenceConfirmLabel).contains(randomReference);
    cy.get(ss.sendBtn).click();
    cy.get(ss.submittedTransactionMessage).should('have.text', msg.transferTxSuccess);
    cy.visit(urls.dashboard);
    cy.get(`${ss.transactionRow} ${ss.spinner}`).should('be.visible');
    cy.get(`${ss.transactionRow} ${ss.transactionAddress}`).eq(0).should('have.text', randomAddress);
    cy.get(`${ss.transactionRow} ${ss.transactionAmount}`).eq(0).should('have.text', `-${randomAmount}`);
    cy.get(`${ss.transactionRow} ${ss.spinner}`, { timeout: txConfirmationTimeout }).should('be.not.visible');
    cy.get(ss.headerBalance).invoke('text').as('balanceAfter').then(function () {
      compareBalances(this.balanceBefore, this.balanceAfter, randomAmount + transactionFee);
    });
  });
});
