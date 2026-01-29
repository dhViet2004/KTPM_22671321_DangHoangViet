const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL || "http://localhost:8080";
const RESOURCE_SERVER_URL = process.env.RESOURCE_SERVER_URL || "http://localhost:8081";

// In-memory token storage (in production, use secure storage)
let currentToken = null;
let refreshTokenValue = null;

// Login endpoint - exchange credentials for tokens
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    console.log(`Logging in user: ${username}`);

    const response = await axios.post(`${AUTH_SERVER_URL}/oauth2/token`, {
      username,
      password,
      grant_type: "password"
    });

    currentToken = response.data.access_token;
    refreshTokenValue = response.data.refresh_token;

    console.log(`Login successful for ${username}`);
    console.log(`Access Token: ${currentToken.substring(0, 20)}...`);

    return res.json({
      message: "Login successful",
      access_token: currentToken,
      refresh_token: refreshTokenValue,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in,
      scope: response.data.scope
    });
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    return res.status(401).json({
      error: "Login failed",
      details: error.response?.data || error.message
    });
  }
});

// Refresh token endpoint
app.post("/refresh-token", async (req, res) => {
  try {
    if (!refreshTokenValue) {
      return res.status(400).json({ error: "No refresh token available" });
    }

    console.log("Refreshing access token...");

    const response = await axios.post(`${AUTH_SERVER_URL}/oauth2/refresh`, {
      refresh_token: refreshTokenValue
    });

    currentToken = response.data.access_token;
    refreshTokenValue = response.data.refresh_token;

    console.log("Token refreshed successfully");

    return res.json({
      message: "Token refreshed successfully",
      access_token: currentToken,
      refresh_token: refreshTokenValue,
      token_type: response.data.token_type,
      expires_in: response.data.expires_in
    });
  } catch (error) {
    console.error("Token refresh failed:", error.response?.data || error.message);
    return res.status(401).json({
      error: "Token refresh failed",
      details: error.response?.data || error.message
    });
  }
});

// Get public resource - no token required
app.get("/public-resource", async (req, res) => {
  try {
    console.log("Accessing public resource...");

    const response = await axios.get(`${RESOURCE_SERVER_URL}/public/hello`);

    console.log("Public resource accessed successfully");

    return res.json({
      message: "Public resource accessed",
      data: response.data
    });
  } catch (error) {
    console.error("Failed to access public resource:", error.message);
    return res.status(500).json({
      error: "Failed to access public resource",
      details: error.response?.data || error.message
    });
  }
});

// Get user resource - requires valid token with READ scope
app.get("/user-resource", async (req, res) => {
  try {
    if (!currentToken) {
      return res.status(401).json({ error: "No access token. Please login first" });
    }

    console.log("Accessing user resource...");

    const response = await axios.get(`${RESOURCE_SERVER_URL}/user/data`, {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    console.log("User resource accessed successfully");

    return res.json({
      message: "User resource accessed",
      data: response.data
    });
  } catch (error) {
    if (error.response?.status === 401) {
      console.log("Token expired, attempting refresh...");
      return res.status(401).json({
        error: "Token expired",
        details: "Please refresh your token"
      });
    }

    console.error("Failed to access user resource:", error.message);
    return res.status(500).json({
      error: "Failed to access user resource",
      details: error.response?.data || error.message
    });
  }
});

// Get user profile - requires valid token
app.get("/user-profile", async (req, res) => {
  try {
    if (!currentToken) {
      return res.status(401).json({ error: "No access token. Please login first" });
    }

    console.log("Accessing user profile...");

    const response = await axios.get(`${RESOURCE_SERVER_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    console.log("User profile accessed successfully");

    return res.json({
      message: "User profile retrieved",
      profile: response.data
    });
  } catch (error) {
    console.error("Failed to access user profile:", error.message);
    return res.status(500).json({
      error: "Failed to access user profile",
      details: error.response?.data || error.message
    });
  }
});

// Update user data - requires valid token with WRITE scope
app.post("/update-profile", async (req, res) => {
  try {
    if (!currentToken) {
      return res.status(401).json({ error: "No access token. Please login first" });
    }

    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "Data is required" });
    }

    console.log("Updating user profile...");

    const response = await axios.post(`${RESOURCE_SERVER_URL}/user/update`, data, {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    console.log("User profile updated successfully");

    return res.json({
      message: "Profile updated",
      data: response.data
    });
  } catch (error) {
    console.error("Failed to update profile:", error.message);
    return res.status(500).json({
      error: "Failed to update profile",
      details: error.response?.data || error.message
    });
  }
});

// Get admin resource - requires ADMIN scope
app.get("/admin-resource", async (req, res) => {
  try {
    if (!currentToken) {
      return res.status(401).json({ error: "No access token. Please login as admin" });
    }

    console.log("Accessing admin resource...");

    const response = await axios.get(`${RESOURCE_SERVER_URL}/admin/settings`, {
      headers: {
        Authorization: `Bearer ${currentToken}`
      }
    });

    console.log("Admin resource accessed successfully");

    return res.json({
      message: "Admin resource accessed",
      data: response.data
    });
  } catch (error) {
    if (error.response?.status === 403) {
      console.log("Access denied - insufficient permissions");
      return res.status(403).json({
        error: "Access Denied",
        details: "This resource requires ADMIN scope"
      });
    }

    console.error("Failed to access admin resource:", error.message);
    return res.status(500).json({
      error: "Failed to access admin resource",
      details: error.response?.data || error.message
    });
  }
});

// Health check
app.get("/health", async (req, res) => {
  try {
    const authHealth = await axios.get(`${AUTH_SERVER_URL}/oauth2/health`);
    const resourceHealth = await axios.get(`${RESOURCE_SERVER_URL}/health`);

    return res.json({
      status: "Client is running",
      auth_server: authHealth.data.status,
      resource_server: resourceHealth.data.status,
      current_token: currentToken ? currentToken.substring(0, 20) + "..." : "None"
    });
  } catch (error) {
    return res.status(500).json({
      error: "One or more services are down",
      details: error.message
    });
  }
});

// Test endpoint for full flow
app.post("/test-flow", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    console.log("\n=== Starting OAuth2 Test Flow ===");

    // Step 1: Login
    console.log("Step 1: Logging in...");
    const loginRes = await axios.post(`${AUTH_SERVER_URL}/oauth2/token`, {
      username,
      password,
      grant_type: "password"
    });

    currentToken = loginRes.data.access_token;
    refreshTokenValue = loginRes.data.refresh_token;

    console.log("Step 1 ✓: Login successful");

    // Step 2: Access user resource
    console.log("Step 2: Accessing user resource...");
    const userRes = await axios.get(`${RESOURCE_SERVER_URL}/user/data`, {
      headers: { Authorization: `Bearer ${currentToken}` }
    });

    console.log("Step 2 ✓: User resource accessed");

    // Step 3: Access public resource
    console.log("Step 3: Accessing public resource...");
    const publicRes = await axios.get(`${RESOURCE_SERVER_URL}/public/hello`);

    console.log("Step 3 ✓: Public resource accessed");

    console.log("=== OAuth2 Test Flow Completed Successfully ===\n");

    return res.json({
      message: "Test flow completed successfully",
      results: {
        login: {
          token_type: loginRes.data.token_type,
          expires_in: loginRes.data.expires_in,
          scope: loginRes.data.scope
        },
        user_resource: userRes.data,
        public_resource: publicRes.data
      }
    });
  } catch (error) {
    console.error("Test flow failed:", error.message);
    return res.status(500).json({
      error: "Test flow failed",
      details: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`\n🚀 OAuth2 Client Server running on http://localhost:${PORT}`);
  console.log(`📝 Auth Server: ${AUTH_SERVER_URL}`);
  console.log(`📚 Resource Server: ${RESOURCE_SERVER_URL}\n`);
});
