import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;
const USER_CHAT_ID = process.env.USER_CHAT_ID;

app.use(express.json());

app.post('/submit', async (req, res) => {
	if (!BOT_TOKEN || !ADMIN_CHAT_ID || !USER_CHAT_ID) {
		console.warn('BOT_TOKEN or ADMIN_CHAT_ID or USER_CHAT_ID not set');
		return res.status(503).json({ ok: false, error: 'Server not configured' });
	}

	const { user, data } = req.body || {};
	if (!data || typeof data !== 'object') {
		return res.status(400).json({ ok: false, error: 'Missing data' });
	}

	if (user?.id.toString() !== USER_CHAT_ID.toString()) {
		return res.status(400).json({ ok: false, error: 'User is not allowed to submit' });
	}

	const morning = (data.morning || []).join(', ') || '—';
	const day = (data.day || []).join(', ') || '—';
	const evening = (data.evening || []).join(', ') || '—';

	const userName = user
		? [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || `ID ${user.id}`
		: 'Неизвестный пользователь';
	const userLine = user
		? `👤 ${userName} (id: ${user.id}${user.username ? `, @${user.username}` : ''})`
		: '👤 Аноним';

	const text = [
		'🌸 Новый выбор на 8 марта',
		'',
		userLine,
		'',
		'☀️ Утро: ' + morning,
		'🌤 День: ' + day,
		'🌙 Вечер: ' + evening,
	].join('\n');

	try {
		const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				chat_id: ADMIN_CHAT_ID,
				text,
				parse_mode: 'HTML',
			}),
		});
		const result = await tgRes.json();

		if (!result.ok) {
			console.error('Telegram API error:', result);
			return res.status(502).json({ ok: false, error: result.description || 'Telegram error' });
		}

		res.json({ ok: true });
	} catch (err) {
		console.error('Submit error:', err);
		res.status(500).json({ ok: false, error: String(err.message) });
	}
});

app.listen(PORT, 'localhost', () => {
	console.log(`Bot server listening on http://localhost:${PORT}`);
});
