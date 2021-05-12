import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: '2020-08-27'
});

// Can create dynamic serverless API endpoint pages with
// the [name].js same as with pages in nextjs

export default async function handler(req, res) {
	// Is this a query parameter?
	const id = req.query.id;
	try {
		if (!id.startsWith('cs_')) {
			throw Error('Incorrect CheckoutSession ID.');
		}
		const checkout_session = await stripe.checkout.sessions.retrieve(id, {
			expand: ['payment_intent']
		});

		res.status(200).json(checkout_session);
	} catch (error) {
		res.status(500).json({ statusCode: 500, message: err.message });
	}
}
