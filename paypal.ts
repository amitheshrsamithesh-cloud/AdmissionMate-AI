import { db, PaymentRecord } from "./db";

// Official PayPal Sandbox Configuration
const PAYPAL_API_BASE = process.env.PAYPAL_API_URL || "https://api-m.sandbox.paypal.com";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || "";
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || "";

/**
 * Checks whether valid PayPal Sandbox credentials are provided in environment variables
 */
export function isPayPalConfigured(): boolean {
  return Boolean(
    PAYPAL_CLIENT_ID &&
    PAYPAL_CLIENT_ID.trim() !== "" &&
    PAYPAL_CLIENT_ID !== "sb" &&
    PAYPAL_CLIENT_SECRET &&
    PAYPAL_CLIENT_SECRET.trim() !== "" &&
    PAYPAL_CLIENT_SECRET !== "MY_PAYPAL_CLIENT_SECRET"
  );
}

/**
 * Retrieves an OAuth 2.0 access token from PayPal Sandbox REST API.
 * Never simulates or falls back to mock tokens.
 */
export async function getPayPalAccessToken(): Promise<string> {
  if (!isPayPalConfigured()) {
    throw new Error(
      "PAYPAL_CONFIG_ERROR: PayPal Sandbox credentials (PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET) are missing or not configured in backend environment variables. Set them in .env to enable real PayPal Sandbox payments."
    );
  }

  const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[PayPal Sandbox] Token request rejected by PayPal:", response.status, errorText);
    throw new Error(`PAYPAL_AUTH_FAILED: PayPal rejected credentials (HTTP ${response.status}). Verify PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.`);
  }

  const data = await response.json();
  if (!data.access_token) {
    throw new Error("PAYPAL_AUTH_FAILED: PayPal did not return an access token.");
  }
  return data.access_token;
}

export interface CreateOrderParams {
  collegeId: string;
  studentEmail?: string;
  studentName?: string;
}

/**
 * Creates an order in PayPal Sandbox.
 * CRITICAL: The application fee amount, college name, and currency are looked up
 * strictly from server-side trusted college records. Client-provided amounts are never trusted.
 */
export async function createOrder(params: CreateOrderParams) {
  // 1. Validate college using trusted server-side record
  const college = db.getCollegeById(params.collegeId);
  if (!college) {
    throw new Error(`INVALID_COLLEGE: College ID '${params.collegeId}' is not valid.`);
  }

  const trustedAmount = college.applicationFee;
  const trustedAmountStr = trustedAmount.toFixed(2);
  const trustedCurrency = "USD";
  const trustedCollegeName = college.name;

  // 2. Obtain real PayPal access token (fails if credentials missing)
  const accessToken = await getPayPalAccessToken();

  // 3. Call official PayPal Sandbox Orders API v2
  const orderPayload = {
    intent: "CAPTURE",
    purchase_units: [
      {
        reference_id: college.id,
        description: `Application Processing Fee - ${trustedCollegeName}`,
        custom_id: `${college.id}|${params.studentEmail || "applicant"}`,
        amount: {
          currency_code: trustedCurrency,
          value: trustedAmountStr,
          breakdown: {
            item_total: {
              currency_code: trustedCurrency,
              value: trustedAmountStr,
            },
          },
        },
        items: [
          {
            name: `${trustedCollegeName} Application Fee`,
            description: `Undergraduate Application Processing Fee for ${params.studentName || "Applicant"}`,
            unit_amount: {
              currency_code: trustedCurrency,
              value: trustedAmountStr,
            },
            quantity: "1",
            category: "DIGITAL_GOODS",
          },
        ],
      },
    ],
    application_context: {
      brand_name: "AdmissionMate AI",
      landing_page: "NO_PREFERENCE",
      user_action: "PAY_NOW",
      shipping_preference: "NO_SHIPPING",
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderPayload),
  });

  if (!response.ok) {
    const errData = await response.text();
    console.error("[PayPal Sandbox] Order creation failed:", response.status, errData);
    throw new Error(`PAYPAL_ORDER_CREATION_FAILED: ${errData}`);
  }

  const orderData = await response.json();
  if (!orderData.id) {
    throw new Error("PAYPAL_ORDER_CREATION_FAILED: PayPal did not return an order ID.");
  }

  return {
    orderId: orderData.id,
    status: orderData.status,
    currency: trustedCurrency,
    amount: trustedAmount,
    collegeId: college.id,
    collegeName: trustedCollegeName,
  };
}

export interface CaptureOrderParams {
  orderId: string;
  collegeId: string;
}

/**
 * Captures an approved order from PayPal Sandbox and persists the payment record.
 * Validates actual PayPal order status, actual capture ID, amount, and currency.
 * Strictly prevents duplicate captures.
 */
export async function captureOrder(params: CaptureOrderParams): Promise<{ success: boolean; payment: PaymentRecord; rawCaptureId: string }> {
  const { orderId, collegeId } = params;

  if (!orderId || !collegeId) {
    throw new Error("MISSING_PARAMETERS: orderId and collegeId are required for capture.");
  }

  // 1. Prevent duplicate payment captures (Idempotency check)
  if (db.isOrderCaptured(orderId)) {
    const existing = db.getPayments().find((p) => p.orderId === orderId);
    if (existing) {
      throw new Error(`DUPLICATE_CAPTURE_PREVENTED: Order ID '${orderId}' has already been captured and recorded.`);
    }
  }

  // 2. Validate college record from server-side trusted DB
  const college = db.getCollegeById(collegeId);
  if (!college) {
    throw new Error(`INVALID_COLLEGE: College ID '${collegeId}' does not exist.`);
  }

  const expectedAmount = college.applicationFee;
  const expectedCurrency = "USD";

  // 3. Obtain real PayPal access token
  const accessToken = await getPayPalAccessToken();

  // 4. Call official PayPal Sandbox Capture API v2
  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("[PayPal Sandbox] Order capture failed:", response.status, errText);
    throw new Error(`PAYPAL_CAPTURE_FAILED: PayPal capture rejected with status ${response.status}: ${errText}`);
  }

  const rawResponse = await response.json();

  // 5. Verify actual PayPal response status
  if (rawResponse.status !== "COMPLETED") {
    throw new Error(`PAYPAL_PAYMENT_INCOMPLETE: Order status is '${rawResponse.status}'. Payment was not completed.`);
  }

  // 6. Extract actual capture object from PayPal purchase units
  const captureObj = rawResponse.purchase_units?.[0]?.payments?.captures?.[0];
  if (!captureObj || !captureObj.id) {
    throw new Error("PAYPAL_VERIFICATION_FAILED: No valid capture object or capture ID returned by PayPal.");
  }

  if (captureObj.status !== "COMPLETED") {
    throw new Error(`PAYPAL_VERIFICATION_FAILED: Capture status is '${captureObj.status}', expected 'COMPLETED'.`);
  }

  // 7. Verify captured amount and currency match trusted server records
  const capturedAmount = parseFloat(captureObj.amount?.value || "0");
  const capturedCurrency = captureObj.amount?.currency_code;

  if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
    throw new Error(
      `AMOUNT_MISMATCH_SECURITY_ERROR: Captured amount ($${capturedAmount}) does not match trusted fee ($${expectedAmount}) for ${college.name}.`
    );
  }

  if (capturedCurrency !== expectedCurrency) {
    throw new Error(
      `CURRENCY_MISMATCH_SECURITY_ERROR: Captured currency (${capturedCurrency}) does not match expected (${expectedCurrency}).`
    );
  }

  // 8. Extract real verified payer info from PayPal
  const payerEmail = rawResponse.payer?.email_address || "sandbox-applicant@example.com";
  const payerName = rawResponse.payer?.name
    ? `${rawResponse.payer.name.given_name || ""} ${rawResponse.payer.name.surname || ""}`.trim()
    : "PayPal Sandbox Buyer";

  const realCaptureId = captureObj.id; // Real PayPal transaction ID (e.g. 2GG78129...)

  // 9. Persist verified payment record in database
  const receiptNumber = `REC-${college.id.toUpperCase()}-${orderId.slice(-6).toUpperCase()}`;
  const paymentRecord: PaymentRecord = {
    id: `pay-${Date.now()}`,
    orderId,
    captureId: realCaptureId,
    collegeId: college.id,
    collegeName: college.name,
    amount: capturedAmount,
    currency: capturedCurrency,
    status: "COMPLETED",
    payerEmail,
    payerName,
    createdAt: captureObj.create_time || new Date().toISOString(),
    receiptNumber,
    paymentMethod: "PayPal Sandbox Checkout",
    sandboxMode: true,
  };

  const recordResult = db.recordPayment(paymentRecord);
  return {
    success: true,
    payment: recordResult.payment,
    rawCaptureId: realCaptureId,
  };
}

/**
 * Verifies PayPal Webhook event signatures using official PayPal verification API
 */
export async function verifyWebhookSignature(event: any, headers: Record<string, any>): Promise<boolean> {
  if (!PAYPAL_WEBHOOK_ID) {
    console.warn("[PayPal Webhook] PAYPAL_WEBHOOK_ID is not configured. Webhook signature verification skipped.");
    return false;
  }

  try {
    const accessToken = await getPayPalAccessToken();
    const verificationPayload = {
      auth_algo: headers["paypal-auth-algo"],
      cert_url: headers["paypal-cert-url"],
      transmission_id: headers["paypal-transmission-id"],
      transmission_sig: headers["paypal-transmission-sig"],
      transmission_time: headers["paypal-transmission-time"],
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: event,
    };

    const response = await fetch(`${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verificationPayload),
    });

    if (!response.ok) {
      console.error("[PayPal Webhook] Signature verification endpoint returned error:", response.status);
      return false;
    }

    const data = await response.json();
    return data.verification_status === "SUCCESS";
  } catch (err) {
    console.error("[PayPal Webhook] Error during signature verification:", err);
    return false;
  }
}
