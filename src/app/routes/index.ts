import express from 'express';
import { UserRoutes } from '../modules/user/user.route';
import { AuthRoutes } from '../modules/auth/auth.route';
import { CategoryRoutes } from '../modules/category/category.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { PublicRoutes } from '../modules/public/public.route';
import { TokenRoutes } from '../modules/token/token.route';
import { ChatRoutes } from '../modules/chat/chat.routes';
import { MessageRoutes } from '../modules/message/message.routes';
import { NotificationRoutes } from '../modules/notification/notification.routes';
import { ProductRoutes } from '../modules/product/product.route';
import { OrderRoutes } from '../modules/order/order.route';
import { WishlistRoutes } from '../modules/wishlist/wishlist.route';
import { SupportRoutes } from '../modules/support/support.route';
import { SettingsRoutes } from '../modules/settings/settings.route';
import { DashboardRoutes } from '../modules/dashboard/dashboard.route';

const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/category", route: CategoryRoutes },
    { path: "/payment", route: PaymentRoutes },
    { path: "/public", route: PublicRoutes },
    { path: "/token", route: TokenRoutes },
    { path: "/chat", route: ChatRoutes },
    { path: "/message", route: MessageRoutes },
    { path: "/notification", route: NotificationRoutes },
    { path: "/product", route: ProductRoutes },
    { path: "/order", route: OrderRoutes },
    { path: "/wishlist", route: WishlistRoutes },
    { path: "/support", route: SupportRoutes },
    { path: "/settings", route: SettingsRoutes },
    { path: "/dashboard", route: DashboardRoutes },
]


apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;
