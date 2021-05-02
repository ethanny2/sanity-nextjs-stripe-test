// components/CartSummary.js
import { useState, useEffect } from 'react';
import { useShoppingCart } from 'use-shopping-cart';
import { fetchPostJSON } from '../utils/apiHelpers';

export default function CartSummary() {
	const [loading, setLoading] = useState(false);
	const [cartEmpty, setCartEmpty] = useState(true);
	const {
		formattedTotalPrice,
		cartCount,
		clearCart,
		cartDetails,
		redirectToCheckout
	} = useShoppingCart();

	useEffect(() => {
		// If count number is 0 its falsey. Recall
		// negative nums are truthy but the library ensures
		// that won't happen.
		setCartEmpty(!cartCount);
	}, [cartCount]);

	const handleCheckout = async (event) => {
		event.preventDefault();
		setLoading(true);
		// Send cart data to our nextjs serverless functions / API
		const response = await fetchPostJSON(
			'/api/checkout_session/cart',
			cartDetails
		);
		if (response.statusCode === 500) {
			console.error(response.message);
			return;
		}
		// Otherwise response is good, send them to checkout
		// TODO: write the API endpoint to handle this response
		redirectToCheckout({ sessionId: response.id });
	};

	return (
		<form onSubmit={handleCheckout}>
			<h2>Cart Summary</h2>
			{/* This is where we'll render our cart;
			The item count changes quickly and may
			be mismatched between client and server.
			To avoid annoying error messages,
			we use 'supressHydrationWarning'.
			https://reactjs.org/docs/dom-elements.html#suppresshydrationwarning*/}
			<p suppressHydrationWarning>
				<strong>Number of Items:</strong> {cartCount}
			</p>
			<p suppressHydrationWarning>
				<strong>Total:</strong> {formattedTotalPrice}
			</p>
			{/* Stripe test mode*/}
			<p>Use 4242 4242 4242 4242 as the card number.</p>
			<button
				type='submit'
				className='cart-style-background'
				disabled={cartEmpty || loading}
			>
				Checkout <div className='card-number'></div>
			</button>
			<button
				className='cart-style-background'
				type='button'
				onClick={clearCart}
			>
				Clear Cart
			</button>
		</form>
	);
}
