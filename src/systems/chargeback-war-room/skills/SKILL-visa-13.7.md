# Visa 13.7 — Cancelled Merchandise/Services

## When This Skill Applies
The cardholder claims they cancelled the merchandise or service but were still charged, or that the merchant did not provide a refund after cancellation.

## What the Customer Is Claiming
"I cancelled my order/booking/subscription, but the merchant still charged me and won't refund my money."

## Investigation Plan
1. Call `get_transaction` with the payment_id — verify what was purchased and when
2. Call `get_merchant` with the merchant_id — check merchant category (this determines which policy applies)
3. Call `get_refund_policy` with the merchant_id — **CRITICAL**: this is the primary evidence for 13.7 disputes
4. Call `get_customer_comms` with the payment_id — **CRITICAL**: review cancellation request timing, merchant response, and whether the customer followed the cancellation process
5. Call `search_past_wins` with reason_code="visa-13.7" and the merchant category — retrieve similar winning cases

## Evidence Requirements
- **Required:** Merchant's cancellation/refund policy as communicated to the customer at time of purchase
- **Required:** Proof that the customer agreed to the terms (click-wrap, checkbox, booking confirmation with terms)
- **Required:** Timeline showing: purchase date → cancellation request date → policy window
- **Strong:** The cancellation request was outside the refund/cancellation window
- **Strong:** Customer communication where the merchant explained the policy and offered alternatives
- **Strong:** Evidence the service was already rendered or goods were already shipped before cancellation
- **Nice-to-have:** Terms of service page with timestamp showing policy was live at time of purchase
- **Nice-to-have:** Evidence the customer used the service after the alleged cancellation date

## Representment Narrative Structure
1. **Opening:** Summarize the transaction and what was purchased
2. **Policy disclosure:** Present the merchant's cancellation/refund policy and prove it was disclosed at purchase time
3. **Timeline:** Show the exact timeline — when was the purchase made, when did the customer request cancellation, and how this falls relative to the policy window
4. **Policy application:** Explain why the cancellation doesn't qualify for a refund under the stated terms
5. **Merchant response:** Show the merchant communicated with the customer and offered alternatives (date change, credit, freeze, etc.)
6. **Service rendered:** If applicable, show the service was already provided or goods were already shipped
7. **Closing:** Request reversal — the merchant's policy was clearly communicated and the cancellation request does not meet the refund criteria

## Red Flags — Do NOT Fight, Recommend Refund
- The merchant has no documented cancellation/refund policy
- The policy was not communicated to the customer at time of purchase
- The cancellation request was within the stated refund window and the merchant didn't honor it
- The merchant never responded to the cancellation request
- The service was not rendered and the event/booking date hasn't passed yet
- The merchant already offered a refund but didn't process it
- Similar disputes from other customers suggest a systemic issue with the merchant's cancellation process

## Confidence Scoring
- **HIGH (80-100):** Clear policy was disclosed, cancellation request was outside the policy window, merchant offered alternatives, and customer either declined or didn't respond
- **MEDIUM (50-79):** Policy exists and was disclosed, but the timing is borderline (within a day of the policy window) or the merchant's response was slow
- **LOW (0-49):** No documented policy, policy wasn't shown at purchase, or cancellation request was within the refund window — escalate to human review
