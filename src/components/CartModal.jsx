import React, { useState } from "react";
import { calcTotals } from "../../shared/pricing";
import WePay4UButton from "./WePay4UButton";

const DEFAULT_DEMO_PRODUCT = {
  id: 1,
  name: "Premium Wireless Headphone",
  category: "Electronics",
  price: 2499,
  oldPrice: 2999,
  image: "🎧",
  quantity: 1,
};

export default function CartModal({ isOpen, onClose, cartItems, setCartItems }) {
  // If cart is completely empty when modal opens, option to add demo product
  const items = cartItems.length > 0 ? cartItems : [DEFAULT_DEMO_PRODUCT];

  // Customer & Payment Form State
  const [customer, setCustomer] = useState({
    name: "Zahid Hasan",
    email: "zahid@example.com",
    phone: "+880 1712-345678",
    address: "House 12, Road 5, Dhanmondi",
    city: "Dhaka",
    zip: "1205",
  });

  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'bkash' | 'nagad' | 'cod' | 'wepay4u'

  const [cardDetails, setCardDetails] = useState({
    number: "4242 •••• •••• 4242",
    holder: "Zahid Hasan",
    expiry: "12/28",
    cvv: "123",
  });

  const [mobileBanking, setMobileBanking] = useState({
    accountNumber: "01712345678",
    trxId: "TRX98765432",
  });

  // API Config State for testing custom endpoints
  const [showApiConfig, setShowApiConfig] = useState(true);
  const [apiUrl, setApiUrl] = useState("https://jsonplaceholder.typicode.com/posts");
  const [apiMethod, setApiMethod] = useState("POST");
  const [customHeaders, setCustomHeaders] = useState('{\n  "Content-Type": "application/json"\n}');

  // API Response & Loading State
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [activeTab, setActiveTab] = useState("checkout"); // 'checkout' | 'api-response'

  // Cart helper functions
  const updateQuantity = (id, delta) => {
    const updated = items
      .map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean);

    setCartItems(updated);
  };

  const removeItem = (id) => {
    setCartItems(items.filter((item) => item.id !== id));
  };

  const addDemoProduct = () => {
    const existing = items.find((item) => item.id === DEFAULT_DEMO_PRODUCT.id);
    if (existing) {
      updateQuantity(DEFAULT_DEMO_PRODUCT.id, 1);
    } else {
      setCartItems([...items, DEFAULT_DEMO_PRODUCT]);
    }
  };

  // Calculate totals
  const { subtotal, shipping, vat, total } = calcTotals(items);

  // Fill sample dummy data for fast testing
  const handleFillDemoData = () => {
    setCustomer({
      name: "Rahim Ahmed",
      email: "rahim.test@example.com",
      phone: "+880 1819-998877",
      address: "Flat 4B, Green Road",
      city: "Dhaka",
      zip: "1209",
    });
    setCardDetails({
      number: "4532 1122 3344 5566",
      holder: "Rahim Ahmed",
      expiry: "08/29",
      cvv: "999",
    });
    setMobileBanking({
      accountNumber: "01819998877",
      trxId: "BKASH" + Math.floor(100000 + Math.random() * 900000),
    });
  };

  // Generate payload that will be sent in API request
  const getPayload = () => ({
    orderId: "ORD-" + Math.floor(100000 + Math.random() * 900000),
    timestamp: new Date().toISOString(),
    customer,
    cartItems: items.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      itemTotal: i.price * i.quantity,
    })),
    pricing: {
      subtotal,
      shipping,
      vat,
      total,
      currency: "BDT (৳)",
    },
    payment: {
      method: paymentMethod,
      details:
        paymentMethod === "card"
          ? { cardNumber: cardDetails.number, cardHolder: cardDetails.holder, expiry: cardDetails.expiry }
          : paymentMethod === "bkash" || paymentMethod === "nagad"
          ? { mobileNumber: mobileBanking.accountNumber, trxId: mobileBanking.trxId }
          : { status: "Pay on Delivery" },
    },
  });

  // Handle Form Submission / API Call
  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiResponse(null);

    const payload = getPayload();
    const startTime = performance.now();

    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(customHeaders);
      } catch (err) {
        parsedHeaders = { "Content-Type": "application/json" };
      }

      const options = {
        method: apiMethod,
        headers: parsedHeaders,
      };

      if (apiMethod !== "GET" && apiMethod !== "HEAD") {
        options.body = JSON.stringify(payload);
      }

      const res = await fetch(apiUrl, options);
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      let responseData;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      setApiResponse({
        status: res.status,
        statusText: res.statusText || (res.ok ? "OK" : "Error"),
        ok: res.ok,
        timeMs: duration,
        headers: Array.from(res.headers.entries()),
        data: responseData,
        sentPayload: payload,
        requestUrl: apiUrl,
        requestMethod: apiMethod,
      });

      setActiveTab("api-response");
    } catch (err) {
      const endTime = performance.now();
      setApiResponse({
        status: "ERROR",
        statusText: err.message,
        ok: false,
        timeMs: Math.round(endTime - startTime),
        error: err.toString(),
        sentPayload: payload,
        requestUrl: apiUrl,
        requestMethod: apiMethod,
      });
      setActiveTab("api-response");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div className="header-title">
            <h2>🛒 Payment & Order Checkout</h2>
            <span className="api-badge">API Test Ready</span>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="modal-tabs">
          <button
            className={`tab-btn ${activeTab === "checkout" ? "active" : ""}`}
            onClick={() => setActiveTab("checkout")}
          >
            📋 Checkout Form
          </button>
          <button
            className={`tab-btn ${activeTab === "api-response" ? "active" : ""}`}
            onClick={() => setActiveTab("api-response")}
          >
            ⚡ API Response {apiResponse && <span className={apiResponse.ok ? "dot-success" : "dot-error"}></span>}
          </button>
        </div>

        {/* Tab Content */}
        <div className="modal-body">
          {activeTab === "checkout" && (
            <div className="checkout-grid">
              
              {/* Left Side: Cart Items & Pricing Summary */}
              <div className="cart-summary-section">
                <div className="section-title-row">
                  <h3>📦 Product Items ({items.length})</h3>
                  <button className="add-demo-btn" onClick={addDemoProduct}>
                    + Add Demo Item
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="empty-cart-msg">
                    <p>Your cart is empty.</p>
                    <button className="primary-btn" onClick={addDemoProduct}>
                      Add Demo Product
                    </button>
                  </div>
                ) : (
                  <div className="cart-items-list">
                    {items.map((item) => (
                      <div className="cart-item-card" key={item.id}>
                        <div className="item-icon">{item.image}</div>
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <p className="item-category">{item.category}</p>
                          <p className="item-price">৳{item.price.toLocaleString()}</p>
                        </div>
                        <div className="item-quantity-controls">
                          <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                        </div>
                        <button className="remove-item-btn" onClick={() => removeItem(item.id)} title="Remove item">
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Calculation Breakdown */}
                <div className="price-breakdown">
                  <div className="price-row">
                    <span>Subtotal</span>
                    <span>৳{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="price-row">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="free-badge">FREE</span> : `৳${shipping}`}</span>
                  </div>
                  <div className="price-row">
                    <span>VAT (5%)</span>
                    <span>৳{vat.toLocaleString()}</span>
                  </div>
                  <div className="price-row total-row">
                    <span>Total Amount</span>
                    <span>৳{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* API Configuration Drawer Toggle */}
                <div className="api-config-toggle-box">
                  <button
                    type="button"
                    className="toggle-api-btn"
                    onClick={() => setShowApiConfig(!showApiConfig)}
                  >
                    <span>⚙️ API Testing Endpoint Settings</span>
                    <span>{showApiConfig ? "▲ Hide" : "▼ Show Config"}</span>
                  </button>

                  {showApiConfig && (
                    <div className="api-config-fields">
                      <div className="form-group">
                        <label>Target API Endpoint URL:</label>
                        <input
                          type="url"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                          placeholder="http://localhost:5000/api/checkout"
                        />
                      </div>
                      <div className="form-row-2">
                        <div className="form-group">
                          <label>HTTP Method:</label>
                          <select value={apiMethod} onChange={(e) => setApiMethod(e.target.value)}>
                            <option value="POST">POST</option>
                            <option value="PUT">PUT</option>
                            <option value="GET">GET</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Headers (JSON):</label>
                          <textarea
                            rows={2}
                            value={customHeaders}
                            onChange={(e) => setCustomHeaders(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Side: Payment & Order Form */}
              <div className="payment-form-section">
                <div className="section-title-row">
                  <h3>💳 Payment Form</h3>
                  <button type="button" className="fill-demo-btn" onClick={handleFillDemoData}>
                    ⚡ Fill Demo Data
                  </button>
                </div>

                <form onSubmit={handleCheckoutSubmit}>
                  
                  {/* Customer Information */}
                  <div className="form-block">
                    <h4>1. Customer Details</h4>
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div className="form-row-2">
                      <div className="form-group">
                        <label>Email *</label>
                        <input
                          type="email"
                          required
                          value={customer.email}
                          onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          required
                          value={customer.phone}
                          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                          placeholder="+880 1700-000000"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Shipping Address *</label>
                      <input
                        type="text"
                        required
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        placeholder="House no, Street, Area"
                      />
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="form-block">
                    <h4>2. Select Payment Method</h4>
                    <div className="payment-options-grid">
                      <label className={`payment-option ${paymentMethod === "card" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={paymentMethod === "card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>💳 Card</span>
                      </label>

                      <label className={`payment-option ${paymentMethod === "bkash" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="bkash"
                          checked={paymentMethod === "bkash"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>📱 bKash</span>
                      </label>

                      <label className={`payment-option ${paymentMethod === "nagad" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="nagad"
                          checked={paymentMethod === "nagad"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>🟠 Nagad</span>
                      </label>

                      <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={paymentMethod === "cod"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>💵 Cash on Delivery</span>
                      </label>

                      <label className={`payment-option wepay4u-option ${paymentMethod === "wepay4u" ? "selected" : ""}`}>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="wepay4u"
                          checked={paymentMethod === "wepay4u"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <span>🟢 WePay4U — Pay in 4 instalments</span>
                      </label>
                    </div>

                    {/* Conditional Payment Method Inputs */}
                    {paymentMethod === "card" && (
                      <div className="method-details-box">
                        <div className="form-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            value={cardDetails.number}
                            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                            placeholder="4242 4242 4242 4242"
                          />
                        </div>
                        <div className="form-row-2">
                          <div className="form-group">
                            <label>Expiry Date</label>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              placeholder="MM/YY"
                            />
                          </div>
                          <div className="form-group">
                            <label>CVV / CVC</label>
                            <input
                              type="password"
                              maxLength={4}
                              value={cardDetails.cvv}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                              placeholder="123"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(paymentMethod === "bkash" || paymentMethod === "nagad") && (
                      <div className="method-details-box">
                        <div className="form-group">
                          <label>{paymentMethod === "bkash" ? "bKash" : "Nagad"} Account Number</label>
                          <input
                            type="tel"
                            value={mobileBanking.accountNumber}
                            onChange={(e) =>
                              setMobileBanking({ ...mobileBanking, accountNumber: e.target.value })
                            }
                            placeholder="017XXXXXXXX"
                          />
                        </div>
                        <div className="form-group">
                          <label>Transaction ID (TrxID)</label>
                          <input
                            type="text"
                            value={mobileBanking.trxId}
                            onChange={(e) => setMobileBanking({ ...mobileBanking, trxId: e.target.value })}
                            placeholder="TRX12345678"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === "cod" && (
                      <div className="method-details-box info-box">
                        <p>ℹ️ You will pay cash to the courier upon product delivery.</p>
                      </div>
                    )}

                    {paymentMethod === "wepay4u" && (
                      <div className="method-details-box info-box">
                        <p>
                          ℹ️ Pay 25% today (৳{Math.ceil(total / 4).toLocaleString()}), the rest in 3 instalments.
                          You will sign in to WePay4U to finish. Minimum order ৳500.
                        </p>
                      </div>
                    )}

                  </div>

                  {/* Submit Button */}
                  {paymentMethod === "wepay4u" ? (
                    items.length > 0 && <WePay4UButton items={items} />
                  ) : (
                    <button type="submit" className="submit-payment-btn" disabled={isLoading || items.length === 0}>
                      {isLoading ? (
                        <span className="spinner-wrap">
                          <span className="spinner"></span> Processing API Request...
                        </span>
                      ) : (
                        `🚀 Pay ৳${total.toLocaleString()} & Send API Request`
                      )}
                    </button>
                  )}

                </form>

              </div>

            </div>
          )}

          {/* API Response Tab View */}
          {activeTab === "api-response" && (
            <div className="api-response-view">
              {!apiResponse ? (
                <div className="empty-response-state">
                  <div className="icon">📡</div>
                  <h3>No API Request Sent Yet</h3>
                  <p>Submit the payment form to view live HTTP response code, headers, and body here.</p>
                  <button className="primary-btn" onClick={() => setActiveTab("checkout")}>
                    Go to Checkout Form
                  </button>
                </div>
              ) : (
                <div className="response-details">
                  
                  {/* Status Banner */}
                  <div className={`status-banner ${apiResponse.ok ? "banner-success" : "banner-error"}`}>
                    <div className="status-main">
                      <span className="status-code">
                        {apiResponse.status} {apiResponse.statusText}
                      </span>
                      <span className="time-taken">⏱️ {apiResponse.timeMs} ms</span>
                    </div>
                    <div className="request-meta">
                      <strong>Method:</strong> {apiResponse.requestMethod} | <strong>URL:</strong> {apiResponse.requestUrl}
                    </div>
                  </div>

                  {/* Sent Payload JSON */}
                  <div className="json-box-wrapper">
                    <div className="json-header">
                      <span>📤 Sent JSON Payload (Request Body)</span>
                    </div>
                    <pre className="json-content">{JSON.stringify(apiResponse.sentPayload, null, 2)}</pre>
                  </div>

                  {/* Received Response JSON */}
                  <div className="json-box-wrapper">
                    <div className="json-header">
                      <span>📥 API Server Response Data</span>
                    </div>
                    <pre className="json-content">
                      {typeof apiResponse.data === "object"
                        ? JSON.stringify(apiResponse.data, null, 2)
                        : String(apiResponse.data)}
                    </pre>
                  </div>

                  {/* Action row */}
                  <div className="response-actions">
                    <button className="secondary-btn" onClick={() => setActiveTab("checkout")}>
                      ← Back to Form
                    </button>
                    <button
                      className="primary-btn"
                      onClick={() => {
                        alert("API Test Completed Successfully!");
                        onClose();
                      }}
                    >
                      Done / Close
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
