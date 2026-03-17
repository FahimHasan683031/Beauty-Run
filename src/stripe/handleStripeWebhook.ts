import { Request, Response } from 'express'
import Stripe from 'stripe'
import { StatusCodes } from 'http-status-codes'
import config from '../config'
import stripe from '../config/stripe'
import ApiError from '../errors/ApiError'
import { logger } from '../shared/logger'
import { Payment } from '../app/modules/payment/payment.model'
import { Order } from '../app/modules/order/order.model'
import { NotificationService } from '../app/modules/notification/notification.service'

const handleStripeWebhook = async (req: Request, res: Response) => {
    console.log('hit stripe webhook')
    const signature = req.headers['stripe-signature'] as string
    const webhookSecret = config.stripe.webhookSecret as string
    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
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
                logger.info('✅ Checkout completed:', session.id)

                if (session.mode === 'payment') {
                    // Handle one-time payment
                    await Payment.create({
                        email: session.customer_details?.email,
                        amount: (session.amount_total || 0) / 100,
                        transactionId: session.payment_intent as string || session.id,
                        dateTime: new Date(),
                        customerName: session.customer_details?.name,
                        referenceId: session.metadata?.referenceId,
                    });

                    // Update corresponding Order payment status and notify users
                    if (session.metadata?.referenceId) {
                        const updatedOrder = await Order.findByIdAndUpdate(
                            session.metadata.referenceId,
                            { 
                                paymentStatus: 'paid',
                                transactionId: session.payment_intent as string || session.id
                            },
                            { new: true }
                        ).populate('product');

                        if (updatedOrder) {
                            // Notify Customer
                            await NotificationService.insertNotification({
                                receiver: updatedOrder.user,
                                title: 'Payment Successful',
                                message: `Your payment for the order has been successfully processed.`,
                                type: 'USER',
                                referenceId: updatedOrder._id,
                                screen: 'ORDER_DETAILS'
                            });

                            // Notify Vendor
                            const product: any = updatedOrder.product;
                            if (product && product.createdBy) {
                                await NotificationService.insertNotification({
                                    receiver: product.createdBy,
                                    title: 'Payment Received',
                                    message: `Payment for your product has been received and securely transferred via Escrow.`,
                                    type: 'USER',
                                    referenceId: updatedOrder._id,
                                    screen: 'ORDER_DETAILS'
                                });
                            }
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
