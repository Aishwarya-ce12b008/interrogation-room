# Mastercard 4837 — No Cardholder Authorization

## When This Skill Applies
The Mastercard cardholder claims they did not authorize the transaction. This is Mastercard's fraud dispute code for card-not-present environments. Similar to Visa 10.4 but with Mastercard-specific rules around SecureCode (3DS).

## What the Customer Is Claiming
"I didn't make this purchase. My card was used without my knowledge or consent."

## Investigation Plan
1. Call `get_transaction` with the payment_id — verify transaction details, check auth_type for 3DS/SecureCode and AVS result
2. Call `get_device_fingerprint` with the payment_id — **CRITICAL**: IP, geolocation, device history, VPN/proxy flags, 3DS details
3. Call `get_merchant` with the merchant_id — check merchant category and risk score
4. Call `get_customer_comms` with the payment_id — check for any pre-dispute contact from the cardholder
5. Call `search_past_wins` with reason_code="mc-4837" and the merchant category — retrieve similar winning fraud cases

## Evidence Requirements
- **Required:** Mastercard SecureCode / 3DS authentication proof — if the cardholder passed 3DS, liability shifts to the issuer under Mastercard rules
- **Required:** Device fingerprint analysis — device ID, IP geolocation, and transaction history from the same device
- **Strong:** AVS match confirming the billing address
- **Strong:** Prior undisputed transactions from the same device/IP
- **Strong:** IP geolocation within India (matching cardholder's country)
- **Strong:** No VPN/proxy detected during the transaction
- **Nice-to-have:** Account login history from the same device
- **Nice-to-have:** Delivery to the cardholder's billing address (if physical goods)

## Representment Narrative Structure
1. **Opening:** Summarize the transaction details
2. **3DS/SecureCode:** Lead with 3DS authentication if present — under Mastercard dispute rules, successful 3DS authentication provides strong liability protection for the merchant/acquirer
3. **Device analysis:** Present device fingerprint — show the device has prior legitimate transaction history, IP is consistent with cardholder's location
4. **AVS verification:** Present address verification results
5. **Fraud signal absence:** Enumerate what was NOT flagged — no VPN, no proxy, no foreign IP, not a new device
6. **Transaction consistency:** Show this transaction fits the cardholder's pattern (amount, merchant category, time of day)
7. **Closing:** Request reversal — the transaction was authenticated and shows no indicators of unauthorized use

## Red Flags — Do NOT Fight, Recommend Refund
- No 3DS authentication AND device fingerprint shows high-risk signals
- IP address from a different country AND VPN/proxy detected
- The device has zero prior transaction history AND no 3DS
- AVS result is "mismatch" with no other compensating authentication
- Multiple fraud signals present simultaneously (3+ risk signals)
- Transaction amount is 5x+ the merchant's average transaction size
- The cardholder filed a police report (FIR) for card theft

## Confidence Scoring
- **HIGH (80-100):** 3DS authenticated successfully — this is near-automatic liability shift under Mastercard rules. OR: no 3DS but strong device history (5+ prior transactions) + AVS match + zero risk signals
- **MEDIUM (50-79):** Partial authentication (3DS attempted but not completed) + some positive device signals, or 3DS present but 1-2 minor risk signals
- **LOW (0-49):** No 3DS + high-risk device profile (foreign IP, VPN, new device) — escalate to human review. This may be genuine fraud.
