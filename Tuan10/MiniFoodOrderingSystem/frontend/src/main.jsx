import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./styles.css";

const api = {
  user: import.meta.env.VITE_USER_API_URL || "http://localhost:8081",
  food: import.meta.env.VITE_FOOD_API_URL || "http://localhost:8082",
  order: import.meta.env.VITE_ORDER_API_URL || "http://localhost:8083",
  payment: import.meta.env.VITE_PAYMENT_API_URL || "http://localhost:8084"
};

function App() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("user");
  const [password, setPassword] = useState("123456");
  const [user, setUser] = useState(null);
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [processingOrders, setProcessingOrders] = useState({});
  const [circuitBreakers, setCircuitBreakers] = useState([]);
  const [circuitBreakerLog, setCircuitBreakerLog] = useState([]);
  const [testingTarget, setTestingTarget] = useState("");
  const [burstCount, setBurstCount] = useState(8);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadFoods();
    loadCircuitBreakers();
  }, []);

  useEffect(() => {
    if (user) {
      loadOrders(user.id);
    } else {
      setOrders([]);
      setCart([]);
      setPaymentMethods({});
      setProcessingOrders({});
    }
  }, [user]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  async function loadFoods() {
    const { data } = await axios.get(`${api.food}/foods`);
    setFoods(data);
  }

  async function loadOrders(userId = user?.id) {
    if (!userId) {
      setOrders([]);
      return;
    }
    const { data } = await axios.get(`${api.order}/orders`, { params: { userId } });
    setOrders(data);
    setPaymentMethods((current) => data.reduce((next, order) => ({
      ...next,
      [order.id]: current[order.id] || "COD"
    }), {}));
  }

  async function loadCircuitBreakers() {
    const { data } = await axios.get(`${api.order}/circuit-breakers`);
    setCircuitBreakers(data);
  }

  async function submitAuth(event) {
    event.preventDefault();
    const endpoint = mode === "login" ? "login" : "register";
    const { data } = await axios.post(`${api.user}/${endpoint}`, { username, password, role: "USER" });
    setUser(data);
    setMessage(`${data.username} da ${mode === "login" ? "dang nhap" : "dang ky"} thanh cong`);
  }

  function logout() {
    setUser(null);
    setMessage("Da dang xuat. Ban van co the xem menu, nhung can dang nhap de dat mon.");
  }

  function addToCart(food) {
    setCart((current) => {
      const found = current.find((item) => item.id === food.id);
      if (found) {
        return current.map((item) => item.id === food.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...current, { ...food, quantity: 1 }];
    });
  }

  function changeQty(id, delta) {
    setCart((current) => current
      .map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
      .filter((item) => item.quantity > 0));
  }

  async function createOrder() {
    if (!user) {
      setMessage("Vui long dang nhap truoc khi dat mon");
      return;
    }
    const payload = {
      userId: user.id,
      items: cart.map((item) => ({ foodId: item.id, quantity: item.quantity }))
    };
    const { data } = await axios.post(`${api.order}/orders`, payload);
    setCart([]);
    await loadOrders(user.id);
    setMessage(`Da tao don #${data.id}`);
  }

  async function pay(orderId) {
    const method = paymentMethods[orderId] || "COD";
    setProcessingOrders((current) => ({ ...current, [orderId]: true }));
    setOrders((current) => current.map((order) => (
      order.id === orderId ? { ...order, status: `PROCESSING_${method}` } : order
    )));
    setMessage(`Dang xu ly thanh toan ${method} cho don #${orderId}`);
    try {
      const { data } = await axios.post(`${api.payment}/payments`, { orderId, method });
      await loadOrders(user.id);
      setMessage(`${data.message} cho don #${data.orderId}`);
    } finally {
      setProcessingOrders((current) => ({ ...current, [orderId]: false }));
    }
  }

  async function testCircuitBreaker(target) {
    setTestingTarget(target);
    try {
      const { data } = await axios.post(`${api.order}/circuit-breakers/test/${target}`);
      setCircuitBreakerLog((current) => [
        `${new Date().toLocaleTimeString()} ${target.toUpperCase()}: ${data.status} - ${data.message}`,
        ...current
      ].slice(0, 6));
    } catch (error) {
      const data = error.response?.data;
      setCircuitBreakerLog((current) => [
        `${new Date().toLocaleTimeString()} ${target.toUpperCase()}: ${data?.status || "FAILED"} - ${data?.message || error.message}`,
        ...current
      ].slice(0, 6));
    } finally {
      await loadCircuitBreakers();
      setTestingTarget("");
    }
  }

  async function burstCircuitBreaker(target) {
    setTestingTarget(`burst-${target}`);
    try {
      const { data } = await axios.post(`${api.order}/circuit-breakers/burst/${target}`, null, {
        params: { count: burstCount }
      });
      setCircuitBreakerLog((current) => [
        `${new Date().toLocaleTimeString()} BURST ${target.toUpperCase()}: ${data.total} calls, ${data.success} success, ${data.failed} failed`,
        ...data.results.slice(-4).reverse().map((result, index) => `  #${data.total - index}: ${result.status} - ${result.message}`),
        ...current
      ].slice(0, 10));
    } catch (error) {
      setCircuitBreakerLog((current) => [
        `${new Date().toLocaleTimeString()} BURST ${target.toUpperCase()}: FAILED - ${error.message}`,
        ...current
      ].slice(0, 10));
    } finally {
      await loadCircuitBreakers();
      setTestingTarget("");
    }
  }

  return (
    <main>
      <section className="topbar">
        <div>
          <h1>Mini Food Ordering</h1>
          <p>Service-Based Architecture demo</p>
        </div>
        <div className="session">
          <span className="badge">{user ? `${user.username} / ${user.role}` : "Guest"}</span>
          {user && <button onClick={logout}>Dang xuat</button>}
        </div>
      </section>

      {message && <div className="notice">{message}</div>}

      <section className="grid">
        <form className="panel auth" onSubmit={submitAuth}>
          <div className="tabs">
            <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>Login</button>
            <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>Register</button>
          </div>
          <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="primary">{mode === "login" ? "Login" : "Register"}</button>
        </form>

        <section className="panel menu">
          <h2>Danh sach mon</h2>
          <div className="food-list">
            {foods.map((food) => (
              <article key={food.id} className="food">
                <div>
                  <strong>{food.name}</strong>
                  <span>{food.category}</span>
                </div>
                <b>{Number(food.price).toLocaleString("vi-VN")}d</b>
                <button disabled={!user} onClick={() => addToCart(food)}>Them</button>
              </article>
            ))}
          </div>
          {!user && <p className="hint">Dang nhap de them mon vao gio hang.</p>}
        </section>

        <section className="panel cart">
          <h2>Gio hang</h2>
          {!user && <p className="empty">Guest chi xem duoc danh sach mon.</p>}
          {user && cart.length === 0 && <p className="empty">Chua co mon nao</p>}
          {cart.map((item) => (
            <div className="cart-row" key={item.id}>
              <span>{item.name}</span>
              <div>
                <button onClick={() => changeQty(item.id, -1)}>-</button>
                <b>{item.quantity}</b>
                <button onClick={() => changeQty(item.id, 1)}>+</button>
              </div>
            </div>
          ))}
          <div className="total">Tong: {total.toLocaleString("vi-VN")}d</div>
          <button className="primary" disabled={!user || !cart.length} onClick={createOrder}>Tao don hang</button>
        </section>

        <section className="panel orders">
          <div className="orders-head">
            <h2>Don hang cua toi</h2>
          </div>
          <div className="order-list">
            {!user && <p className="empty">Dang nhap de xem don hang cua ban.</p>}
            {user && orders.length === 0 && <p className="empty">Ban chua co don hang nao.</p>}
            {orders.map((order) => (
              <article key={order.id} className="order">
                <div>
                  <strong>#{order.id} - {order.username}</strong>
                  <span>{order.status} / {Number(order.total).toLocaleString("vi-VN")}d</span>
                </div>
                <div className="payment-actions">
                  <select
                    value={paymentMethods[order.id] || "COD"}
                    disabled={order.status === "PAID" || processingOrders[order.id]}
                    onChange={(event) => setPaymentMethods((current) => ({ ...current, [order.id]: event.target.value }))}
                  >
                    <option value="COD">COD</option>
                    <option value="BANKING">Banking</option>
                  </select>
                  <button
                    disabled={order.status === "PAID" || processingOrders[order.id]}
                    onClick={() => pay(order.id)}
                  >
                    {processingOrders[order.id] ? "Dang xu ly..." : order.status === "PAID" ? "Da thanh toan" : "Thanh toan"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="panel circuit-lab">
          <div className="orders-head">
            <h2>CircuitBreaker Lab</h2>
            <button onClick={loadCircuitBreakers}>Refresh</button>
          </div>
          <div className="breaker-grid">
            {circuitBreakers.map((breaker) => (
              <article className={`breaker ${breaker.state.toLowerCase()}`} key={breaker.name}>
                <strong>{breaker.name}</strong>
                <span>{breaker.state}</span>
                <small>calls {breaker.bufferedCalls} / failed {breaker.failedCalls} / rate {Math.round(breaker.failureRate)}%</small>
              </article>
            ))}
          </div>
          <div className="lab-actions">
            <button disabled={testingTarget === "user"} onClick={() => testCircuitBreaker("user")}>
              {testingTarget === "user" ? "Testing..." : "Test User Service"}
            </button>
            <button disabled={testingTarget === "food"} onClick={() => testCircuitBreaker("food")}>
              {testingTarget === "food" ? "Testing..." : "Test Food Service"}
            </button>
          </div>
          <div className="burst-actions">
            <label>
              Burst count
              <input
                type="number"
                min="1"
                max="30"
                value={burstCount}
                onChange={(event) => setBurstCount(Number(event.target.value))}
              />
            </label>
            <button disabled={testingTarget === "burst-user"} onClick={() => burstCircuitBreaker("user")}>
              {testingTarget === "burst-user" ? "Sending..." : "Burst User"}
            </button>
            <button disabled={testingTarget === "burst-food"} onClick={() => burstCircuitBreaker("food")}>
              {testingTarget === "burst-food" ? "Sending..." : "Burst Food"}
            </button>
          </div>
          <div className="lab-log">
            {circuitBreakerLog.length === 0 && <p className="empty">Stop service roi bam Burst de day failure rate vuot nguong.</p>}
            {circuitBreakerLog.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
