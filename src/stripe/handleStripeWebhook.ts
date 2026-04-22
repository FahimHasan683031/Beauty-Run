import { Request, Response } from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import config from '../config'
import stripe from '../config/stripe'
import ApiError from '../errors/ApiError'
import { logger } from '../shared/logger'
import { Payment } from '../app/modules/payment/payment.model'
import { Order } from '../app/modules/order/order.model'
import { Settings } from '../app/modules/settings/settings.model'
import { Product } from '../app/modules/product/product.model'
import { User } from '../app/modules/user/user.model'
import { USER_ROLES } from '../enum/user'
import { emailHelper } from '../helpers/emailHelper'
import { emailTemplate } from '../shared/emailTemplate'

const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log('hit stripe webhook')
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = config.stripe.webhookSecret as string
    let event: Stripe.Event

    try {
        const body = (req as any).rawBody || req.body;
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (error) {
        throw new ApiError(
            StatusCodes.BAD_REQUEST,
            `Webhook verification failed: ${error}`,
        )
    }

    const data = event.data.object as any
    const eventType = event.type

    try {
        switch (eventType) {
            case 'checkout.session.completed': {
                const session = data as Stripe.Checkout.Session
                if (session.mode === 'payment' && session.metadata?.referenceId) {
                    const order = await Order.findById(session.metadata.referenceId);
                    const settings = await Settings.findOne();
                    const commissionRate = settings?.commissionRate || 0;

                    if (order) {
                        const productPrice = order.price;
                        const finalPrice = order.finalPrice;
                        const discount = productPrice - finalPrice;
                        const customerPaymentAmount = (session.amount_total || 0) / 100;
                        
                        // Approximate Stripe fee (2.9% + 0.30)
                        const stripeGatewayFee = (customerPaymentAmount * 0.029) + 0.30;
                        
                        const productModel = await Product.findById(order.product);
                        const vendorUser = productModel ? await User.findById(productModel.createdBy) : null;
                        
                        let platformCommission = 0;
                        let vendorPayoutAmount = finalPrice;

                        // If the vendor is not an Admin, calculate the commission
                        if (vendorUser && vendorUser.role !== USER_ROLES.ADMIN) {
                            platformCommission = (finalPrice * commissionRate) / 100;
                            vendorPayoutAmount = finalPrice - platformCommission;
                        } else if (vendorUser && vendorUser.role === USER_ROLES.ADMIN) {
                            platformCommission = 0;
                            vendorPayoutAmount = 0;
                            logger.info(`[Webhook] Admin product purchased. Platform Commission set to 0. Vendor Payout = 0`);
                        }

                        // Retrieve session with expansion to get charge ID
                        const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
                            expand: ['payment_intent.latest_charge'],
                        });
                        const latestCharge = (fullSession.payment_intent as any)?.latest_charge;
                        const chargeId = typeof latestCharge === 'object' ? latestCharge.id : latestCharge;

                        await Payment.create({
                            email: session.customer_details?.email,
                            dateTime: new Date(),
                            referenceId: order._id,
                            amount: customerPaymentAmount,
                            transactionId: session.payment_intent as string || session.id,
                            chargeId: chargeId as string,
                            customerName: session.customer_details?.name,
                            stripeGatewayFee,
                            platformCommission,
                            vendorPayoutAmount,
                            status: 'customer_paid'
                        });

                        await Order.findByIdAndUpdate(order._id, {
                            status: 'confirmed',
                            paymentStatus: 'paid',
                            transactionId: session.payment_intent as string || session.id
                        });
                        
                        logger.info(`✅ Payment processed for Order: ${order._id}`);

                        // Send Invoice Email
                        const invoiceData = {
                            orderId: order.id || order._id.toString(),
                            transactionId: session.payment_intent as string || session.id,
                            date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
                            customerName: session.customer_details?.name || 'Customer',
                            customerEmail: session.customer_details?.email || '',
                            shippingAddress: order.address,
                            productName: productModel?.productName || 'Product',
                            productPrice: order.price / order.quantity,
                            quantity: order.quantity,
                            deliveryCharge: order.deliveryCharge,
                            discount: order.discount,
                            totalAmount: order.finalPrice
                        };

                        if (invoiceData.customerEmail) {
                            setTimeout(() => {
                                emailHelper.sendEmail(emailTemplate.orderInvoice(invoiceData));
                            }, 0);
                            logger.info(`📧 Invoice sent to: ${invoiceData.customerEmail}`);
                        }
                    }
                }
                break
            }

            default:
                logger.info(`⚠️ Unhandled event type: ${eventType}`)
        }
    } catch (error) {
        logger.error('Webhook error:', error)
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, `${error}`)
    }

    res.sendStatus(200)
}

export default handleStripeWebhook
