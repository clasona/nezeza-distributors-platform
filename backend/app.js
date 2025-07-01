require('dotenv').config();
require('express-async-errors');
// express

const express = require('express');
const app = express();
// rest of the packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

// database
const connectDB = require('./db/connect');

//  routers
const adminRouter = require('./routes/adminRoutes');
const adminStoreRouter = require('./routes/adminStoreRoutes');
const adminNotificationRouter = require('./routes/adminNotificationRoutes');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const storeRouter = require('./routes/storeRoutes');
const storeApplicationRouter = require('./routes/storeApplicationRoutes');
const productRouter = require('./routes/productRoutes');
const wholesalerRouter = require('./routes/wholesalerRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');
const paymentRouter = require('./routes/paymentRoutes');
const inventoryRouter = require('./routes/inventoryRoutes');
const emailTestRouter = require('./routes/emailTestRoutes');
const notificationRouter = require('./routes/notificationRoutes');
const cartRouter = require('./routes/cartRoutes');
const favoritesRouter = require('./routes/favoritesRoutes');
const shippingRouter = require('./routes/shippingRoutes');
const supportRouter = require('./routes/supportRoutes');
const adminSupportRouter = require('./routes/admin/adminSupportRoutes');
const amdinAnalyticsRoutes = require('./routes/admin/adminAnalyticsRoutes');
const amdinFinancialRoutes = require('./routes/admin/adminFinancialRoutes');
const amdinMonitoringRoutes = require('./routes/admin/adminMonitoringRoutes');
const verificationRouter = require('./routes/verificationRoutes');
const newsletterRouter = require('./routes/newsletterRoutes');
const gabeRouter = require('./routes/gabeRoute');
// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
// app.use(cors());
//app.use(cors());

// app.use(express.static('client'));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    // allowedHeaders: [
    //   'Content-Type',
    //   'Authorization',
    //   'Origin',
    // ]
  })
);
app.use(xss());
app.use(mongoSanitize());

app.use(morgan('dev'));
// app.use(express.json());
// Must exclude converting object to json for the payment webhook since it requires raw
app.use(
  express.json({
    verify: (req, res, buf) => {
      if (req.originalUrl === '/api/v1/payment/webhook') {
        req.rawBody = buf; // Store raw body in req.rawBody
      }
    },
  })
);
app.use(cookieParser(process.env.JWT_SECRET));

app.use(express.static('./public'));
app.use(fileUpload());

//app.use('/api/v1/admin/users', authRouter);
// admin routes
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/admin/stores', adminStoreRouter);
app.use('/api/v1/admin/notifications', adminNotificationRouter);
// user routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/store', storeRouter);
app.use('/api/v1/store-application', storeApplicationRouter);
app.use('/api/v1/manufacturers', productRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/marketplace/products', wholesalerRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/suborders', orderRouter);
app.use('/api/v1/payment', paymentRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/favorites', favoritesRouter);
app.use('/api/v1/shipping', shippingRouter);
app.use('/api/v1/support', supportRouter);
app.use('/api/v1/admin/support', adminSupportRouter);
app.use('/api/v1/gabee', gabeRouter);
app.use('/api/v1/wholesaler/inventory-items', inventoryRouter);
app.use('/api/v1/admin/analytics', amdinAnalyticsRoutes);
app.use('/api/v1/admin/financial', amdinFinancialRoutes);
app.use('/api/v1/admin/monitoring', amdinMonitoringRoutes);
// email test routes
app.use('/api/v1/email-test', emailTestRouter);
// verification routes
app.use('/api/v1/verification', verificationRouter);
// newsletter routes
app.use('/api', newsletterRouter);
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
