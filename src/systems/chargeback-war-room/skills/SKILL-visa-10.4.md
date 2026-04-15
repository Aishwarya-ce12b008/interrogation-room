# Visa 10.4 — Other Fraud: Card-Absent Environment

## When This Skill Applies
The cardholder claims they did not authorize or participate in the transaction. This is a fraud claim in a card-not-present (CNP) environment — typically online/mobile payments.

## What the Customer Is Claiming
"I didn't make this purchase. Someone stole my card details and used them online."

## Investigation Plan
1. Call `get_transaction` with the payment_id — verify transaction details, check auth_type (3DS status) and AVS result
2. Call `get_device_fingerprint` with the payment_id — **CRITICAL**: check IP, geolocation, device history, VPN/proxy flags
3. Call `get_merchant` with the merchant_id — check merchant category and risk score
4. Call `get_customer_comms` with the payment_id — check if the customer contacted the merchant before filing the dispute
5. Call `search_past_wins` with reason_code="visa-10.4" and the merchant category — retrieve similar winning fraud cases
6. **Do NOT call `get_shipping_info`** — shipping evidence is secondary for fraud disputes. Focus on authentication.

## Evidence Requirements
- **Required:** 3DS authentication proof (cardholder passed 3D Secure challenge = liability shift to issuer)
- **Required:** Device fingerprint showing the transaction originated from a known device/IP
- **Strong:** AVS (Address Verification System) match — billing address matches card records
- **Strong:** Prior successful transactions from the same device/IP with no disputes
- **Strong:** IP geolocation matches cardholder's known location (India)
- **Strong:** No VPN or proxy detected
- **Nice-to-have:** Delivery to the cardholder's verified address (if physical goods)
- **Nice-to-have:** Customer login activity from the same device before/after the transaction

## Representment Narrative Structure
1. **Opening:** Summarize the transaction details
2. **3DS Authentication:** If 3DS was used, lead with this — Visa rules state liability shifts to the issuer when 3DS authentication succeeds. This is often an auto-win.
3. **Device fingerprint:** Present the device ID, IP address, and geolocation. Show this device has been used for prior legitimate transactions.
4. **AVS match:** If AVS matched, present this as additional proof the cardholder authorized the transaction
5. **Behavioral consistency:** Show the transaction pattern is consistent with the cardholder's history (same device, same IP range, same location)
6. **Risk assessment:** Note the absence of fraud signals (no VPN, no proxy, no foreign IP)
7. **Closing:** Request reversal — the transaction was properly authenticated and shows no fraud indicators

## Red Flags — Do NOT Fight, Recommend Refund
- 3DS was NOT used AND no other strong authentication exists
- IP address is from a different country than the cardholder's billing address
- VPN or proxy detected AND this is the first transaction from the device
- Device has zero prior transaction history
- Multiple risk signals present (foreign IP + VPN + new device + no 3DS)
- AVS result is "mismatch"
- The transaction amount is unusually high for this merchant category

## Confidence Scoring
- **HIGH (80-100):** 3DS authenticated (automatic liability shift) OR strong device history + AVS match + no fraud signals
- **MEDIUM (50-79):** Some authentication present but gaps (e.g., 3DS but VPN detected, or no 3DS but strong device history)
- **LOW (0-49):** No 3DS + multiple fraud signals (foreign IP, VPN, new device) — escalate to human review. This may be actual fraud.
