import { useEffect, useState } from "react";
import "./App.css";
import CartModal from "./components/CartModal";

const categories = [
  {
    id: 1,
    name: "Electronics",
    icon: "💻",
    items: "120+ Products",
  },
  {
    id: 2,
    name: "Fashion",
    icon: "👕",
    items: "250+ Products",
  },
  {
    id: 3,
    name: "Accessories",
    icon: "👜",
    items: "180+ Products",
  },
  {
    id: 4,
    name: "Home & Living",
    icon: "🏠",
    items: "150+ Products",
  },
];

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphone",
    category: "Electronics",
    price: 2499,
    oldPrice: 2999,
    image: "🎧",
    rating: 4.8,
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    category: "Electronics",
    price: 3999,
    oldPrice: 4999,
    image: "⌚",
    rating: 4.7,
  },
  {
    id: 3,
    name: "Classic Sneakers",
    category: "Fashion",
    price: 2899,
    oldPrice: 3499,
    image: "👟",
    rating: 4.6,
  },
  {
    id: 4,
    name: "Leather Backpack",
    category: "Accessories",
    price: 2199,
    oldPrice: 2699,
    image: "🎒",
    rating: 4.9,
  },
];

const DEFAULT_CART = [
  {
    id: 1,
    name: "Premium Wireless Headphone",
    category: "Electronics",
    price: 2499,
    oldPrice: 2999,
    image: "🎧",
    quantity: 1,
  },
];

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem("cartItems")) || DEFAULT_CART;
  } catch {
    return DEFAULT_CART;
  }
}

function App() {
  // WePay4U cancel_url is /cart — reopen the checkout when the customer comes back
  const [isCartOpen, setIsCartOpen] = useState(window.location.pathname === "/cart");
  const [cartItems, setCartItems] = useState(loadCart);

  // Keep the cart across the redirect to WePay4U and back
  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="app">
      {/* Navbar */}
      <header className="navbar">
        <div className="container nav-content">
          <div className="logo">
            Shop<span>Now</span>
          </div>

          <nav>
            <a href="#home">Home</a>
            <a href="#categories">Categories</a>
            <a href="#products">Products</a>
            <a href="#about">About</a>
          </nav>

          <div className="nav-actions">
            <button className="search-btn">⌕</button>
            <button className="cart-btn" onClick={() => setIsCartOpen(true)} title="Open Cart & Payment Checkout">
              🛒 <span>{totalCartCount}</span>
            </button>
            <button className="login-btn">Login</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="home">
        <div className="container hero-content">
          <div className="hero-text">
            <p className="small-title">✨ NEW COLLECTION 2026</p>

            <h1>
              Discover Your
              <span> Perfect Style</span>
            </h1>

            <p className="hero-description">
              Explore premium products, amazing deals and everything you need — all in one place.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn" onClick={() => setIsCartOpen(true)}>
                Shop Now →
              </button>

              <a href="#products" className="secondary-btn" style={{ display: 'inline-block', textAlign: 'center' }}>
                Explore Collection
              </a>
            </div>

            <div className="hero-stats">
              <div>
                <strong>10K+</strong>
                <small>Products</small>
              </div>

              <div>
                <strong>25K+</strong>
                <small>Customers</small>
              </div>

              <div>
                <strong>4.9</strong>
                <small>Rating</small>
              </div>
            </div>
          </div>

          <div className="hero-image">
            <div className="discount-badge">
              <strong>50%</strong>
              <small>OFF</small>
            </div>

            <div className="product-showcase">
              <div className="floating-card card-one">🎧</div>

              <div className="main-product">👟</div>

              <div className="floating-card card-two">⌚</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section" id="categories">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">SHOP BY CATEGORY</p>
              <h2>Explore Categories</h2>
            </div>

            <a href="#products" className="view-all">
              View All →
            </a>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <div className="category-card" key={category.id}>
                <div className="category-icon">{category.icon}</div>

                <div>
                  <h3>{category.name}</h3>
                  <p>{category.items}</p>
                </div>

                <span className="arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="section products-section" id="products">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label">OUR PRODUCTS</p>
              <h2>Featured Products</h2>
            </div>

            <a href="#products" className="view-all">
              View All →
            </a>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <div className="product-card" key={product.id}>
                <div className="product-image">
                  <span className="sale-badge">SALE</span>

                  <button className="wishlist">♡</button>

                  <div className="product-emoji">{product.image}</div>
                </div>

                <div className="product-info">
                  <p className="product-category">{product.category}</p>

                  <h3>{product.name}</h3>

                  <div className="rating">⭐ {product.rating}</div>

                  <div className="price-row">
                    <div>
                      <strong>৳{product.price.toLocaleString()}</strong>

                      <del>৳{product.oldPrice.toLocaleString()}</del>
                    </div>

                    <button
                      className="add-cart"
                      onClick={() => handleAddToCart(product)}
                      title="Add to Cart & Checkout"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-section">
        <div className="container">
          <div className="promo-banner">
            <div>
              <p className="promo-label">LIMITED TIME OFFER</p>

              <h2>Get up to 50% OFF</h2>

              <p>Don't miss our biggest sale of the season.</p>

              <button className="promo-btn" onClick={() => setIsCartOpen(true)}>
                Shop Sale →
              </button>
            </div>

            <div className="promo-icon">🛍️</div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section" id="about">
        <div className="container">
          <div className="center-header">
            <p className="section-label">WHY SHOP WITH US</p>

            <h2>We Make Shopping Easy</h2>

            <p>Everything you need for a simple, secure and enjoyable shopping experience.</p>
          </div>

          <div className="features">
            <div className="feature-card">
              <div>🚚</div>
              <h3>Fast Delivery</h3>
              <p>Get your products delivered quickly and safely to your doorstep.</p>
            </div>

            <div className="feature-card">
              <div>🔒</div>
              <h3>Secure Payment</h3>
              <p>Your payment information is protected with secure technology.</p>
            </div>

            <div className="feature-card">
              <div>↩️</div>
              <h3>Easy Returns</h3>
              <p>Not satisfied? Return your product with our easy return policy.</p>
            </div>

            <div className="feature-card">
              <div>💬</div>
              <h3>24/7 Support</h3>
              <p>Our support team is always ready to help you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter">
        <div className="container newsletter-content">
          <div>
            <p className="section-label">STAY UPDATED</p>

            <h2>Get the latest deals</h2>

            <p>Subscribe to receive special offers and new product updates.</p>
          </div>

          <div className="subscribe-form">
            <input type="email" placeholder="Enter your email address" />

            <button>Subscribe</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="logo">
              Shop<span>Now</span>
            </div>

            <p>
              Your destination for quality products, great prices and an amazing shopping experience.
            </p>
          </div>

          <div>
            <h3>Quick Links</h3>
            <a href="#home">Home</a>
            <a href="#categories">Categories</a>
            <a href="#products">Products</a>
            <a href="#about">About Us</a>
          </div>

          <div>
            <h3>Customer Care</h3>
            <a href="#help">Help Center</a>
            <a href="#shipping">Shipping Info</a>
            <a href="#returns">Returns</a>
            <a href="#contact">Contact Us</a>
          </div>

          <div>
            <h3>Contact</h3>
            <p>📍 Dhaka, Bangladesh</p>
            <p>📞 +880 1234-567890</p>
            <p>✉️ hello@shopnow.com</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 ShopNow. All rights reserved.</p>
        </div>
      </footer>

      {/* Cart & Payment Checkout Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        setCartItems={setCartItems}
      />
    </div>
  );
}

export default App;