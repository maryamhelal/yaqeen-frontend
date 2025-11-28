import { useContext, useState, useEffect } from "react";
import { CartContext } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ordersAPI } from "../../api/orders";
import { authAPI } from "../../api/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { promocodesAPI } from "../../api/promocodes";

export default function CheckoutPage() {
  const { cart, clearCart } = useContext(CartContext);
  const { user, token, login } = useAuth();
  // Dynamic city/area state
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [instapayUsername, setInstapayUsername] = useState("");

  // Fetch cities on mount
  useEffect(() => {
    import("../../api/cities").then(({ citiesAPI }) => {
      citiesAPI.getCities().then((data) => {
        setCities(data);
        if (data.length > 0) {
          setSelectedCity(data[0]._id);
          setSelectedCityName(data[0].name);
        }
      });
    });
  }, []);

  // Fetch areas when selectedCity changes
  useEffect(() => {
    if (selectedCity) {
      import("../../api/cities").then(({ citiesAPI }) => {
        citiesAPI.getCityAreas(selectedCity).then((data) => {
          setAreas(data);
          setSelectedArea(data[0] || "");
        });
      });
    } else {
      setAreas([]);
      setSelectedArea("");
    }
  }, [selectedCity]);

  const [residenceType, setResidenceType] = useState("");
  const [form, setForm] = useState({
    name: "",
    street: "",
    landmarks: "",
    phone: "",
    email: "",
    building: "",
    floor: "",
    apartment: "",
    companyName: "",
  });
  const [saveInfo, setSaveInfo] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Promocode state
  const [promocode, setPromocode] = useState("");
  const [promoError, setPromoError] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoInfo, setPromoInfo] = useState(null);
  const [promoValidating, setPromoValidating] = useState(false);

  // Validate promocode on apply
  const handleApplyPromocode = async () => {
    setPromoError("");
    setPromoDiscount(0);
    setPromoInfo(null);
    setPromoValidating(true);
    if (!promocode) {
      setPromoValidating(false);
      return;
    }
    try {
      const previewOrder = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          categoryId: item.categoryId,
          collectionId: item.collectionId,
        })),
        totalPrice: subtotal,
        promocode: { code: promocode },
      };
      const res = await promocodesAPI.previewPromocode(previewOrder);
      if (res && res.valid) {
        setPromoDiscount(res.discountAmount);
        setPromoInfo(res.promocode);
      } else {
        setPromoError(res.error || "Invalid promocode");
      }
    } catch (err) {
      setPromoError(err?.message || "Error validating promocode");
    } finally {
      setPromoValidating(false);
    }
  };
  // Only keep one backend-driven shippingPrice declaration
  const selectedCityObj = cities.find((c) => c._id === selectedCity);
  const shippingPrice = selectedCityObj ? selectedCityObj.price : 0;
  const totalWithShipping = subtotal + shippingPrice;

  useEffect(() => {
    if (cart.length === 0 && location.pathname === "/checkout") {
      navigate("/", { replace: true });
    }
    if (user) {
      setForm({
        name: user.name || "",
        street: user.address?.street || "",
        landmarks: user.address?.landmarks || "",
        phone: user.phone || "",
        email: user.email || "",
        building: user.address?.building || "",
        floor: user.address?.floor || "",
        apartment: user.address?.apartment || "",
        companyName: user.address?.companyName || "",
      });
      if (cities.length > 0) {
        const userCity = cities.find(
          (c) => c.name === user.address?.city || c._id === user.address?.city
        );
        setSelectedCity(userCity ? userCity._id : cities[0]._id);
        setSelectedCityName(userCity ? userCity.name : cities[0].name);
      }
      setResidenceType(user.address?.residenceType || "");
    }
  }, [cart, navigate, user, location, cities]);

  // Autofill area after areas are loaded and user has area
  useEffect(() => {
    if (user && user.address?.area && areas.length > 0) {
      if (areas.includes(user.address.area)) {
        setSelectedArea(user.address.area);
      }
    }
  }, [areas, user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");

    if (!form.phone || !form.email) {
      setError("Phone and email are required.");
      setSubmitting(false);
      return;
    }

    try {
      if (!user && saveInfo) {
        if (!password || !confirmPassword) {
          throw new Error("Password and confirm password are required.");
        }
        if (password.length < 5) {
          throw new Error("Password must be at least 5 characters.");
        }
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }
      }

      let authToken = token;
      let loginRes = null;

      // If guest checkout with save info checked, then register + login
      if (!user && saveInfo) {
        const registerRes = await authAPI.register({
          name: form.name,
          email: form.email,
          password,
          phone: form.phone,
          address: {
            cityId: selectedCity,
            city: selectedCityName,
            area: selectedArea,
            street: form.street,
            landmarks: form.landmarks,
            building: form.building,
            residenceType,
            floor: residenceType === "apartment" ? form.floor : undefined,
            apartment:
              residenceType === "apartment" ? form.apartment : undefined,
            companyName:
              residenceType === "work" ? form.companyName : undefined,
          },
        });
        if (!registerRes || !registerRes.user || !registerRes.token) {
          throw new Error(registerRes.error || "Registration failed");
        }

        loginRes = await authAPI.login({
          email: form.email,
          password,
        });
        if (!loginRes || !loginRes.user || !loginRes.token) {
          throw new Error(loginRes.error || "Login after registration failed");
        }
        await login({ email: form.email, password });

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const orderData = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          categoryId: item.categoryId,
          collectionId: item.collectionId,
        })),
        totalPrice: totalWithShipping - promoDiscount,
        promocode: promoInfo
          ? { code: promoInfo.code }
          : promocode
          ? { code: promocode }
          : undefined,
        shippingAddress: {
          name: form.name,
          cityId: selectedCity,
          city: selectedCityName,
          area: selectedArea,
          street: form.street,
          landmarks: form.landmarks,
          building: residenceType === "work" ? form.building : undefined,
          residenceType,
          floor: residenceType === "apartment" ? form.floor : undefined,
          apartment: residenceType === "apartment" ? form.apartment : undefined,
          companyName: residenceType === "work" ? form.companyName : undefined,
          phone: form.phone,
        },
        orderer: {
          name: form.name,
          email: form.email,
          phone: form.phone,
          userId: user ? user.userId : loginRes?.user ? loginRes.userId : null,
          userMongoId: user
            ? user._id
            : loginRes?.user
            ? loginRes.user._id
            : null,
        },
        paymentMethod,
        instapayUsername: paymentMethod === "Instapay" && instapayUsername,
      };

      const result = await ordersAPI.createOrder(orderData, authToken || null);

      if (result && result.order) {
        clearCart();
        navigate("/thank-you", { state: { order: result.order } });
      } else {
        setError(
          "Order was placed but no confirmation was received. Please contact support."
        );
      }
    } catch (err) {
      setError(
        err?.message ||
          "There was an error placing your order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Checkout
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Shipping Information
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="text-red-500 font-medium mb-2">{error}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={!!user}
                />
              </div>
              {/* City and Area Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping City/Region
                </label>
                <select
                  name="city"
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                    setSelectedCityName(
                      cities.find((city) => city._id === e.target.value)
                        ?.name || ""
                    );
                    setSelectedArea("");
                  }}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city._id} value={city._id}>
                      {city.name}
                    </option>
                  ))}
                </select>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Select area
                </label>
                <select
                  name="area"
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select area</option>
                  {areas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Street
                </label>
                <input
                  name="street"
                  placeholder="Street name and number"
                  value={form.street}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Famous Landmarks / Notes
                </label>
                <textarea
                  name="landmarks"
                  placeholder="Landmarks, notes, delivery instructions, etc."
                  value={form.landmarks}
                  onChange={handleChange}
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Building Number
                </label>
                <input
                  name="building"
                  type="text"
                  placeholder="Building number"
                  value={form.building}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                  Residence Type
                </label>
                <select
                  name="residenceType"
                  value={residenceType}
                  onChange={(e) => setResidenceType(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Select type</option>
                  <option value="apartment">Apartment</option>
                  <option value="private_house">Private House</option>
                  <option value="work">Work</option>
                </select>
              </div>
              {residenceType === "apartment" && (
                <div className="flex gap-4 mt-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Floor Number
                    </label>
                    <input
                      name="floor"
                      type="number"
                      min="0"
                      value={form.floor}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apartment Number
                    </label>
                    <input
                      name="apartment"
                      type="number"
                      min="0"
                      value={form.apartment}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              {residenceType === "work" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                    Company Name
                  </label>
                  <input
                    name="companyName"
                    type="text"
                    value={form.companyName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Cash">Cash on Delivery</option>
                  <option value="Instapay">Instapay</option>
                </select>
              </div>
              {paymentMethod === "Instapay" && (
                <div className="text-sm text-gray-600">
                  Use this link to pay via Instapay:{" "}
                  <a
                    href="https://ipn.eg/S/maryam.helaal/instapay/7S8ts4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    https://ipn.eg/S/maryam.helaal/instapay/7S8ts4
                  </a>
                </div>
              )}
              {paymentMethod === "Instapay" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 mt-4">
                    Instapay Username
                  </label>
                  <input
                    name="instapayUsername"
                    placeholder="Enter your Instapay username"
                    value={instapayUsername}
                    onChange={(e) => setInstapayUsername(e.target.value)}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              )}
              {/* Save info for next time (guests only) */}
              {!user && (
                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={saveInfo}
                      onChange={() => setSaveInfo((v) => !v)}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Save this information for next time
                    </span>
                  </label>
                  {saveInfo && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-2">
                        An account will be created using your email and
                        password.
                      </div>
                      <div className="mb-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          minLength={5}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          minLength={5}
                          required
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <button
                type="submit"
                disabled={submitting || promoValidating}
                className={`w-full bg-primary-dark text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-darker transition-colors mt-6 ${
                  submitting || promoValidating
                    ? "opacity-60 cursor-not-allowed"
                    : ""
                }`}
              >
                {promoValidating
                  ? "Validating Promocode..."
                  : submitting
                  ? "Placing Order..."
                  : "Place Order"}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-xl shadow-lg p-8 h-fit">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Order Summary
            </h2>
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.color}-${item.size}`}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Size: {item.size} | Color: {item.color}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">
                      {(item.price * item.quantity).toLocaleString()} EGP
                    </p>
                  </div>
                </div>
              ))}
              {/* Promocode input and discount display */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Enter promocode"
                  value={promocode}
                  onChange={(e) => setPromocode(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2"
                />
                <button
                  type="button"
                  onClick={handleApplyPromocode}
                  className="bg-primary-dark text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-darker transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <div className="text-red-500 text-sm mt-1">{promoError}</div>
              )}
              {promoInfo && (
                <div className="text-green-600 text-sm mt-1">
                  Promocode <b>{promoInfo.code}</b> applied
                  {promoDiscount > 0 && <>: -{promoDiscount} EGP</>}
                </div>
              )}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Subtotal</span>
                  <span>{subtotal.toLocaleString()} EGP</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Shipping</span>
                  <span>{shippingPrice.toLocaleString()} EGP</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between font-semibold text-lg text-green-600">
                    <span>Discount</span>
                    <span>-{promoDiscount.toLocaleString()} EGP</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>
                    {(totalWithShipping - promoDiscount).toLocaleString()} EGP
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
