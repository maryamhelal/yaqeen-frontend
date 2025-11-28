# Modest Boutique Frontend

A modern React e-commerce frontend for a modest fashion boutique, inspired by popular modest fashion websites.

## Features

- **Landing Page**: Category grid with beautiful product categories
- **Category Pages**: Browse products by category (Dresses, Skirts, Abayas, etc.)
- **Product Cards**: Display products with images, prices, and add-to-cart functionality
- **Shopping Cart**: Add, remove, and update quantities of items
- **Checkout Process**: Simple checkout form with order summary
- **Responsive Design**: Mobile-friendly interface using Tailwind CSS
- **State Management**: React Context for cart management

## Tech Stack

- **React 19** - Frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Context** - State management for cart

## Project Structure

```
src/
├── components/
│   ├── Navbar.jsx          # Navigation bar with categories and cart
│   ├── Footer.jsx          # Footer with links and contact info
│   ├── ProductCard.jsx     # Individual product display
│   └── CategoryCard.jsx    # Category display for landing page
├── pages/
│   ├── LandingPage.jsx     # Home page with category grid
│   ├── CategoryPage.jsx    # Products listing by category
│   ├── CartPage.jsx        # Shopping cart management
│   └── CheckoutPage.jsx    # Checkout form and order placement
├── context/
│   └── CartContext.jsx     # Cart state management
├── api/
│   ├── products.js         # Product API service
│   └── orders.js           # Order API service
└── App.js                  # Main app component with routing
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (not recommended)

## Backend Integration

The frontend is prepared for backend integration with the following API endpoints:

### Products API

- `GET /api/products` - Get all products
- `GET /api/products?category={category}` - Get products by category
- `GET /api/products/{id}` - Get single product

### Orders API

- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get order by ID
- `GET /api/orders?user={userId}` - Get user orders

Update the `API_BASE_URL` in the API service files to match your backend URL.

## Features in Detail

### Shopping Cart

- Add products with quantity selection
- Update quantities in cart
- Remove items from cart
- Real-time cart count in navbar
- Persistent cart state during session

### Product Categories

- Dresses
- Skirts
- Abayas
- Cardigans
- Blouses
- Sets
- Coats

### Responsive Design

- Mobile-first approach
- Grid layouts that adapt to screen size
- Touch-friendly interface
- Optimized for all device sizes

## Customization

### Styling

The app uses Tailwind CSS for styling. You can customize:

- Colors in `tailwind.config.js`
- Component styles in individual files
- Global styles in `src/index.css`

### Adding New Categories

1. Add category name to the `categories` array in `Navbar.jsx`
2. Add category name to the `categories` array in `LandingPage.jsx`
3. Add products for the category in `CategoryPage.jsx`

### Adding New Products

1. Add product data to the `allProducts` array in `CategoryPage.jsx`
2. Ensure the `category` field matches the category name (lowercase)
3. Add appropriate image URL or placeholder

## Future Enhancements

- User authentication and accounts
- Product search and filtering
- Product details page
- Wishlist functionality
- Payment gateway integration
- Order tracking
- Product reviews and ratings
- Admin dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
