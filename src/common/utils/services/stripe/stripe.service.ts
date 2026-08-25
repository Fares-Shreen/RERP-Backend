import { Injectable } from '@nestjs/common';
import Stripe from "stripe"
@Injectable()
export class StripeService {
    private readonly stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    constructor() { }

    cheackOutSession = async ({
        customer_email,
        metadata,
        line_items,
        discounts
    }: {
        customer_email: string,
        metadata: {},
        line_items: [],
        discounts: []
    }) => {
        console.log(line_items, customer_email, metadata);

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            customer_email,
            metadata,
            line_items,
            discounts,
            success_url: "http://localhost:3000/order/success",
            cancel_url: "http://localhost:3000/order/cancel"
        })
        return session
    }


    createCoupon = async (percent_off: number) => {
        console.log(percent_off);

        const coupon = await this.stripe.coupons.create({
            duration: "once",
            percent_off
        })
        return coupon
    }

    createRefundPayment = async (payment_intent: string) => {
        return await this.stripe.refunds.create({ payment_intent, reason: "requested_by_customer" })
    }
}
