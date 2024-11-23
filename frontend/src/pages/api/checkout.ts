import { NextApiRequest, NextApiResponse } from 'next';
import { StoreProduct } from "../../../type";


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { items, email } = req.body;
    const modifiedItems = items.map((item:StoreProduct) => ({
        quantity: item.quantity,
        price_data: {
            currency: 'usd',
            unit_amount: item.price * 100 * 10,
            product_data: {
                name: item.title,
                description: item.description,
                images: [item.image],
            },
        },
    }));

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        shipping_address_collection: {
            allowed_countries: ['US', 'CA'], //you can add more countries
        },
        line_items: modifiedItems,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/success`,
        cancel_url: `${process.env.CLIENT_URL}/checkout`,
        metadata: {
            email,
            images: JSON.stringify(items.map((item: any) => item.image)),
            
        }
    })

    res.status(200).json({ id: session.id });
    
}