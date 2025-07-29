const TelegramBot = require('node-telegram-bot-api');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Gallery = require('../models/Gallery');
const Product = require('../models/Product');
const Order = require('../models/Order');
const PaymentMethod = require('../models/PaymentMethod');
const Coupon = require('../models/Coupon');
const Agent = require('../models/Agent');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// User states for conversation flow
const userStates = new Map();

// Main menu keyboard
const mainMenuKeyboard = {
  reply_markup: {
    keyboard: [
      ['📋 Register', '💎 Subscriptions'],
      ['🖼️ Gallery', '🛍️ Products'],
      ['🛒 My Cart', '📦 My Orders'],
      ['👥 Refer Friends', '💰 Payment Methods'],
      ['ℹ️ Help', '📞 Contact']
    ],
    resize_keyboard: true
  }
};

// Start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const username = msg.from.username;
  const firstName = msg.from.first_name;
  const lastName = msg.from.last_name || '';
  const fullName = `${firstName} ${lastName}`.trim();

  try {
    // Check if user exists
    let user = await User.findOne({ telegramId });
    
    if (!user) {
      // Create new user
      user = new User({
        telegramId,
        fullName,
        username,
        phone: '', // Will be collected during registration
        isRegistered: false
      });
      await user.save();
    }

    // Update last activity
    await user.updateActivity();

    const welcomeMessage = `
🎉 Welcome to Fetan Design Bot!

${user.isRegistered ? 
  `Hello ${user.fullName}! You're already registered.` : 
  'Please register to access all features.'
}

Choose an option from the menu below:
    `;

    bot.sendMessage(chatId, welcomeMessage, mainMenuKeyboard);
  } catch (error) {
    console.error('Start command error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle registration
bot.onText(/📋 Register/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findOne({ telegramId });
    
    if (user && user.isRegistered) {
      bot.sendMessage(chatId, 'You are already registered!', mainMenuKeyboard);
      return;
    }

    // Set user state to registration
    userStates.set(telegramId, { state: 'registration', step: 'phone' });
    
    bot.sendMessage(chatId, 
      'Please share your phone number to complete registration.\n\n' +
      'Click the button below to share your phone number:',
      {
        reply_markup: {
          keyboard: [[{
            text: '📱 Share Phone Number',
            request_contact: true
          }]],
          resize_keyboard: true
        }
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle contact sharing
bot.on('contact', async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const contact = msg.contact;

  try {
    const userState = userStates.get(telegramId);
    
    if (userState && userState.state === 'registration') {
      const user = await User.findOne({ telegramId });
      
      if (user) {
        user.phone = contact.phone_number;
        user.isRegistered = true;
        user.referralCode = user.generateReferralCode();
        await user.save();

        // Clear user state
        userStates.delete(telegramId);

        bot.sendMessage(chatId, 
          `✅ Registration successful!\n\n` +
          `Name: ${user.fullName}\n` +
          `Phone: ${user.phone}\n` +
          `Referral Code: ${user.referralCode}\n\n` +
          `You can now access all features!`,
          mainMenuKeyboard
        );
      }
    }
  } catch (error) {
    console.error('Contact handling error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle subscriptions
bot.onText(/💎 Subscriptions/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findOne({ telegramId }).populate('subscription');
    const subscriptions = await Subscription.find({ isActive: true });

    if (!user || !user.isRegistered) {
      bot.sendMessage(chatId, 'Please register first to view subscriptions.');
      return;
    }

    let message = '💎 Available Subscriptions:\n\n';
    
    subscriptions.forEach((sub, index) => {
      const discountedPrice = sub.getDiscountedPrice();
      const discountText = sub.discountPercentage > 0 ? 
        `\n💥 ${sub.discountPercentage}% OFF!` : '';
      
      message += `${index + 1}. ${sub.name}\n` +
                 `💰 Price: $${sub.price}` +
                 (discountedPrice !== sub.price ? ` → $${discountedPrice}` : '') +
                 `${discountText}\n` +
                 `📅 Duration: ${sub.duration} days\n` +
                 `📝 ${sub.description}\n\n`;
    });

    if (user.subscription) {
      const expiryDate = user.subscriptionExpiry ? 
        new Date(user.subscriptionExpiry).toLocaleDateString() : 'N/A';
      
      message += `\n🎯 Your Current Subscription:\n` +
                 `Plan: ${user.subscription.name}\n` +
                 `Status: ${user.subscriptionStatus}\n` +
                 `Expires: ${expiryDate}`;
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: subscriptions.map((sub, index) => [{
          text: `Subscribe to ${sub.name}`,
          callback_data: `subscribe_${sub._id}`
        }])
      }
    };

    bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Subscriptions error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle gallery
bot.onText(/🖼️ Gallery/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findOne({ telegramId });
    
    if (!user || !user.isRegistered) {
      bot.sendMessage(chatId, 'Please register first to view gallery.');
      return;
    }

    const galleries = await Gallery.find({ isActive: true }).limit(10);
    
    if (galleries.length === 0) {
      bot.sendMessage(chatId, 'No gallery items available at the moment.');
      return;
    }

    // Send first gallery item
    const firstItem = galleries[0];
    const caption = `🖼️ ${firstItem.title}\n\n${firstItem.description}`;
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⬅️ Previous', callback_data: 'gallery_prev_0' },
            { text: 'Next ➡️', callback_data: 'gallery_next_0' }
          ],
          [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
        ]
      }
    };

    bot.sendPhoto(chatId, firstItem.image.url, { caption, ...keyboard });
  } catch (error) {
    console.error('Gallery error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle products
bot.onText(/🛍️ Products/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findOne({ telegramId }).populate('subscription');
    
    if (!user || !user.isRegistered) {
      bot.sendMessage(chatId, 'Please register first to view products.');
      return;
    }

    const products = await Product.find({ isActive: true }).limit(10);
    
    if (products.length === 0) {
      bot.sendMessage(chatId, 'No products available at the moment.');
      return;
    }

    // Send first product
    const firstProduct = products[0];
    const price = user.subscription ? 
      firstProduct.getPriceWithDiscount(user.subscription._id) : 
      firstProduct.price;
    
    const caption = `🛍️ ${firstProduct.name}\n\n` +
                   `📝 ${firstProduct.description}\n` +
                   `💰 Price: $${price}\n` +
                   `📦 Stock: ${firstProduct.stock}\n` +
                   `⭐ Rating: ${firstProduct.rating.average}/5 (${firstProduct.rating.count} reviews)`;
    
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '⬅️ Previous', callback_data: 'product_prev_0' },
            { text: 'Next ➡️', callback_data: 'product_next_0' }
          ],
          [
            { text: '🛒 Add to Cart', callback_data: `add_to_cart_${firstProduct._id}` },
            { text: '👁️ View Details', callback_data: `product_details_${firstProduct._id}` }
          ],
          [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
        ]
      }
    };

    const primaryImage = firstProduct.images.find(img => img.isPrimary) || firstProduct.images[0];
    bot.sendPhoto(chatId, primaryImage.url, { caption, ...keyboard });
  } catch (error) {
    console.error('Products error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle cart
bot.onText(/🛒 My Cart/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findOne({ telegramId }).populate('cart.product');
    
    if (!user || !user.isRegistered) {
      bot.sendMessage(chatId, 'Please register first to view your cart.');
      return;
    }

    if (user.cart.length === 0) {
      bot.sendMessage(chatId, 'Your cart is empty. Add some products!');
      return;
    }

    let total = 0;
    let message = '🛒 Your Cart:\n\n';
    
    user.cart.forEach((item, index) => {
      const price = user.subscription ? 
        item.product.getPriceWithDiscount(user.subscription._id) : 
        item.product.price;
      const itemTotal = price * item.quantity;
      total += itemTotal;
      
      message += `${index + 1}. ${item.product.name}\n` +
                 `   Quantity: ${item.quantity}\n` +
                 `   Price: $${price} x ${item.quantity} = $${itemTotal}\n\n`;
    });

    message += `💰 Total: $${total}`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '💳 Checkout', callback_data: 'checkout' }],
          [{ text: '🗑️ Clear Cart', callback_data: 'clear_cart' }],
          [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
        ]
      }
    };

    bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Cart error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle orders
bot.onText(/📦 My Orders/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();

  try {
    const user = await User.findOne({ telegramId }).populate('orders');
    
    if (!user || !user.isRegistered) {
      bot.sendMessage(chatId, 'Please register first to view your orders.');
      return;
    }

    if (user.orders.length === 0) {
      bot.sendMessage(chatId, 'You have no orders yet.');
      return;
    }

    let message = '📦 Your Orders:\n\n';
    
    user.orders.slice(-5).forEach((order, index) => {
      message += `${index + 1}. Order #${order.orderNumber}\n` +
                 `   Status: ${order.status}\n` +
                 `   Total: $${order.total}\n` +
                 `   Date: ${new Date(order.createdAt).toLocaleDateString()}\n\n`;
    });

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔙 Back to Menu', callback_data: 'back_to_menu' }]
        ]
      }
    };

    bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Orders error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
  }
});

// Handle callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const telegramId = query.from.id.toString();
  const data = query.data;

  try {
    if (data === 'back_to_menu') {
      bot.editMessageReplyMarkup(mainMenuKeyboard.reply_markup, {
        chat_id: chatId,
        message_id: query.message.message_id
      });
      return;
    }

    if (data.startsWith('subscribe_')) {
      const subscriptionId = data.split('_')[1];
      await handleSubscription(chatId, telegramId, subscriptionId);
    }

    if (data.startsWith('add_to_cart_')) {
      const productId = data.split('_')[3];
      await handleAddToCart(chatId, telegramId, productId);
    }

    if (data === 'checkout') {
      await handleCheckout(chatId, telegramId);
    }

    if (data === 'clear_cart') {
      await handleClearCart(chatId, telegramId);
    }

    // Answer callback query
    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Callback query error:', error);
    bot.answerCallbackQuery(query.id, { text: 'Something went wrong!' });
  }
});

// Handle subscription
async function handleSubscription(chatId, telegramId, subscriptionId) {
  try {
    const user = await User.findOne({ telegramId });
    const subscription = await Subscription.findById(subscriptionId);
    const paymentMethods = await PaymentMethod.find({ isActive: true });

    if (!user || !subscription) {
      bot.sendMessage(chatId, 'Invalid subscription or user not found.');
      return;
    }

    const discountedPrice = subscription.getDiscountedPrice();
    
    let message = `💎 Subscribe to ${subscription.name}\n\n` +
                  `💰 Price: $${subscription.price}` +
                  (discountedPrice !== subscription.price ? ` → $${discountedPrice}` : '') +
                  `\n📅 Duration: ${subscription.duration} days\n` +
                  `📝 ${subscription.description}\n\n` +
                  `Please upload a payment screenshot:`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📸 Upload Screenshot', callback_data: `upload_screenshot_${subscriptionId}` }],
          [{ text: '🔙 Back', callback_data: 'back_to_menu' }]
        ]
      }
    };

    bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Subscription handling error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong.');
  }
}

// Handle add to cart
async function handleAddToCart(chatId, telegramId, productId) {
  try {
    const user = await User.findOne({ telegramId });
    const product = await Product.findById(productId);

    if (!user || !product) {
      bot.sendMessage(chatId, 'Invalid product or user not found.');
      return;
    }

    // Check if product already in cart
    const existingItem = user.cart.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: productId, quantity: 1 });
    }

    await user.save();
    bot.sendMessage(chatId, `✅ ${product.name} added to cart!`);
  } catch (error) {
    console.error('Add to cart error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong.');
  }
}

// Handle checkout
async function handleCheckout(chatId, telegramId) {
  try {
    const user = await User.findOne({ telegramId }).populate('cart.product');
    const paymentMethods = await PaymentMethod.find({ isActive: true });

    if (!user || user.cart.length === 0) {
      bot.sendMessage(chatId, 'Your cart is empty.');
      return;
    }

    let total = 0;
    let message = '💳 Checkout\n\n';
    
    user.cart.forEach(item => {
      const price = user.subscription ? 
        item.product.getPriceWithDiscount(user.subscription._id) : 
        item.product.price;
      const itemTotal = price * item.quantity;
      total += itemTotal;
      
      message += `• ${item.product.name} x${item.quantity} = $${itemTotal}\n`;
    });

    message += `\n💰 Total: $${total}\n\n` +
               `Please upload a payment screenshot:`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [{ text: '📸 Upload Screenshot', callback_data: 'upload_order_screenshot' }],
          [{ text: '🔙 Back', callback_data: 'back_to_menu' }]
        ]
      }
    };

    bot.sendMessage(chatId, message, keyboard);
  } catch (error) {
    console.error('Checkout error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong.');
  }
}

// Handle clear cart
async function handleClearCart(chatId, telegramId) {
  try {
    const user = await User.findOne({ telegramId });
    
    if (user) {
      user.cart = [];
      await user.save();
      bot.sendMessage(chatId, '✅ Cart cleared!');
    }
  } catch (error) {
    console.error('Clear cart error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong.');
  }
}

// Handle photo uploads (payment screenshots)
bot.on('photo', async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const photo = msg.photo[msg.photo.length - 1]; // Get highest quality photo

  try {
    const user = await User.findOne({ telegramId });
    
    if (!user || !user.isRegistered) {
      bot.sendMessage(chatId, 'Please register first to upload screenshots.');
      return;
    }

    // Get file info
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    // Add screenshot to user
    user.paymentScreenshots.push({
      url: fileUrl,
      status: 'pending'
    });
    await user.save();

    bot.sendMessage(chatId, 
      '✅ Payment screenshot uploaded successfully!\n\n' +
      'We will review your payment and update your status soon.',
      mainMenuKeyboard
    );
  } catch (error) {
    console.error('Photo upload error:', error);
    bot.sendMessage(chatId, 'Sorry, something went wrong while uploading the screenshot.');
  }
});

// Handle help
bot.onText(/ℹ️ Help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
ℹ️ Fetan Design Bot Help

📋 Register - Complete your registration with phone number
💎 Subscriptions - View and purchase subscription plans
🖼️ Gallery - Browse our design gallery
🛍️ Products - Shop our products with subscription discounts
🛒 My Cart - View and manage your shopping cart
📦 My Orders - Check your order status
👥 Refer Friends - Share your referral code
💰 Payment Methods - View available payment options

For support, contact our admin team.
  `;
  
  bot.sendMessage(chatId, helpMessage, mainMenuKeyboard);
});

// Handle contact
bot.onText(/📞 Contact/, (msg) => {
  const chatId = msg.chat.id;
  
  const contactMessage = `
📞 Contact Information

For support and inquiries:
• Email: support@fetan.com
• Phone: +1234567890
• Website: www.fetan.com

Business hours: Monday - Friday, 9 AM - 6 PM
  `;
  
  bot.sendMessage(chatId, contactMessage, mainMenuKeyboard);
});

// Export bot for webhook handling
module.exports = {
  bot,
  handleUpdate: (update) => {
    bot.handleUpdate(update);
  }
}; 