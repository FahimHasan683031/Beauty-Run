import cron from 'node-cron';
import { Order } from '../app/modules/order/order.model';
import { Product } from '../app/modules/product/product.model';
import { logger } from '../shared/logger';

/**
 * Cleanup Job: Runs every hour.
 * Finds all 'pending' orders older than 1 hour, restores their product stock,
 * and permanently deletes them.
 */
export const startPendingOrderCleanupJob = () => {
    cron.schedule('0 * * * *', async () => {
        logger.info('[CleanupJob] Running pending order cleanup...');

        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

            // Find all stale pending orders
            const stalePendingOrders = await Order.find({
                status: 'pending',
                createdAt: { $lt: oneHourAgo },
            });

            if (stalePendingOrders.length === 0) {
                logger.info('[CleanupJob] No stale pending orders found.');
                return;
            }

            logger.info(`[CleanupJob] Found ${stalePendingOrders.length} stale pending order(s). Processing...`);

            // Restore stock for each stale order
            for (const order of stalePendingOrders) {
                await Product.findByIdAndUpdate(order.product, {
                    $inc: { quantity: order.quantity || 1, totalOrder: -1 },
                });
                logger.info(`[CleanupJob] Stock restored for product: ${order.product} (Order: ${order._id})`);
            }

            // Permanently delete all stale orders at once
            const ids = stalePendingOrders.map((o) => o._id);
            await Order.deleteMany({ _id: { $in: ids } });

            logger.info(`[CleanupJob] ✅ Deleted ${stalePendingOrders.length} stale pending order(s).`);
        } catch (error) {
            logger.error('[CleanupJob] ❌ Error during cleanup:', error);
        }
    });

    logger.info('[CleanupJob] Pending order cleanup job scheduled (every hour).');
};
