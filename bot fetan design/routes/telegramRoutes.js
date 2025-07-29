
const express = require('express');
const router = express.Router();
const TelegramBot = require('node-telegram-bot-api');

// Test telegram bot connection
router.get('/test', async (req, res) => {
  try {
    const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);
    const me = await bot.getMe();
    
    res.json({
      success: true,
      bot: {
        id: me.id,
        username: me.username,
        first_name: me.first_name
      },
      message: 'Telegram bot is working!'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
