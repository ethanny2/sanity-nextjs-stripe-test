import { validateCartItems } from 'use-shopping-cart/src/serverUtil';
import Stripe from 'stripe';
import { client } from '../../../lib/sanity/client';
import { merchQuery } from '../../../lib/sanity/merchQuery';

// The actual server-side implementation of stripe; loadStripe is from
// a stripe library to use it as an ESmodule; just loads in the script tag?
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27'
});

export default async function handler(req, res) {
	if (req.method === 'POST') {
		try {
			// Cart details are sent via POST body; validate the items price with the
			// source of truth (our Sanity backend ) to ensure the customer didn't
			// manipulate the price or anything else client-side
			const cartItems = req.body;
			let sanityProductData = await client.fetch(merchQuery);
			// perform the validation
			const line_items = validateCartItems(sanityProductData, cartItems);
			// Create Checkout Session from the cartItems that were validated
			// assuming an error is thrown if something goes wrong

			// Structed based on stripe object needed
			// https://stripe.com/docs/js/checkout/redirect_to_checkout
			const params = {
				submit_type: 'pay',
				mode: 'payment',
				payment_method_types: ['card'],
				billing_address_collection: 'auto',
				shipping_address_collection: {
					allowed_countries: ['US', 'CA']
				},
				//The validated cart items are inserted.
				line_items,
				success_url: `${req.headers.origin}/result?session_id={CHECKOUT_SESSION_ID}`,
				cancel_url: `${req.headers.origin}`
			};
			// Should create a new session each time a user/customer needs to checkout
			const checkoutSession = await stripe.checkout.sessions.create(params);
			res.status(200).json(checkoutSession);
		} catch (error) {
			console.error(error);
			res.status(500).json({ statusCode: 500, message: error.message });
		}
	} else {
		// Only post requests allowed to this end point, send back status
		// 405 method not allowed
		res.setHeader('Allow', 'POST');
		res.status(405).end('Method Not Allowed');
	}
}
