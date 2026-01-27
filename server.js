const express = require('express');
const cors = require('cors');
require('dotenv').config('./env');

require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const UserRoutes = require('./routes/user-routes.js');
app.use(UserRoutes);

const ProductRoutes = require('./routes/product-route.js');
app.use('/products', ProductRoutes);

const ImageRoutes = require('./routes/image-route.js');
app.use(ImageRoutes);

const CartRoutes = require('./routes/cart-route.js');
app.use(CartRoutes);

const WishlistRoutes = require('./routes/wishlist-route.js');
app.use(WishlistRoutes);


const orderRoutes = require("./routes/order-route.js");
app.use(orderRoutes);


app.listen(8000, () => {
  console.log('app is running');
});
