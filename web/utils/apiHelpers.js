// API routes/code for next only runs serverside and is powered by serverless functions
// Normally the web fetch API is not available in Node but is it polyfilled automatically by Nextjs

export async function fetchGetJSON(url) {
	try {
		const data = await fetch(url).then((res) => res.json());
		return data;
	} catch (error) {
		throw new Error(err.message);
	}
}

export async function fetchPostJSON(url, data) {
	try {
		// Enable cors so this data is only accessible by our domain
		// keeping client payment credentials secure
		const response = await fetch(url, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: {
				'Content-Type': 'application/json'
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			redirect: 'follow',
			referrerPolicy: 'no-referrer',
			body: JSON.stringify(data || {})
		});
		return await response.json();
	} catch (error) {
		throw new Error(err.message);
	}
}
