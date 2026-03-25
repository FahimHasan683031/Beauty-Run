import stripe from "../config/stripe";
import config from "../config";

/**
 * Create a Stripe Connect Express account for a vendor.
 */
export const createConnectAccount = async (email: string) => {
    const account = await stripe.accounts.create({
        type: 'express',
        email: email,
        capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
        },
    });
    return account;
};

/**
 * Generate an onboarding URL for a Stripe Connect account.
 */
export const createOnboardingUrl = async (accountId: string) => {
    const accountLink = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${config.stripe.frontendUrl}/stripe-onboarding/refresh`,
        return_url: `${config.stripe.frontendUrl}/stripe-onboarding/return`,
        type: 'account_onboarding',
    });
    return accountLink.url;
};

/**
 * Check the status of a Stripe Connect account.
 */
export const getAccountStatus = async (accountId: string) => {
    const account = await stripe.accounts.retrieve(accountId);
    return {
        detailsSubmitted: account.details_submitted,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
        onboardingCompleted: account.details_submitted && account.payouts_enabled,
    };
};
