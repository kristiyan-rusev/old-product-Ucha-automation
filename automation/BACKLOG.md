# Coverage backlog

Checklist of the next units of work for autonomous `/autoTest` sessions to pick up, in
order. Check an item off when its test is written, passing against `ucha-dev`, and
committed. Append new items (with a one-line note on why) rather than reordering existing
ones, unless a note explains why priority changed.

- [x] Registration: parent user kind — verified live (2026-09-15): the phone field itself
      is unchanged, but the final sub-step adds a "Ученик" / "Дете в детска градина" choice
      absent from the student flow, which re-renders the grade `<select>`'s options
      (1.-12. клас vs. 1.-4. група) rather than being a separate field. Covered by two new
      tests in registration.spec.ts.
- [x] Registration: teacher user kind — verified live (2026-09-15): the final sub-step has
      no grade selector at all (teachers aren't assigned a grade/group); it reuses the same
      two radio inputs as parent, relabeled "Учител в училище" / "Учител в детска градина"
      with no other effect. Also found and fixed a latent bug: `fillCredentials` waited on
      `gradeSelect`, which never appears for teacher — switched to `citySelect`, present
      across all three kinds. Covered by two new tests in registration.spec.ts.
- [x] Registration: bulgarian-abroad user kind — verified live (2026-09-15): same shape as
      teacher (city + school, no grade selector), plus no profile-type radio at all. Only
      real difference is citySelect lists "Country, City" pairs abroad instead of Bulgarian
      towns — accepted the same way via selectOption. Reused selectCityAndSchool as-is.
      Covered by two new tests in registration.spec.ts.
- [x] Registration: other user kind — verified live (2026-09-15): only two sub-steps total
      (account details, then credentials) — gradeSelect/citySelect/schoolSelect don't exist
      in the DOM at all for this kind, "Напред" stays permanently hidden, and submit is
      already available right alongside email/password. Covered by two new tests in
      registration.spec.ts.
- [x] Profile settings: edit personal data (name/gender/phone) — verified live (2026-09-15):
      "Лични данни" is an in-place edit (not a modal), toggled via
      `data-profile_mode="form"/"preview"` buttons scoped by `data-profile_section`. Saving
      ANY change here — even name/gender only, phone untouched — always triggers phone
      re-verification via the same #modal-code-verification used by deactivation, but a
      different variant: the code is sent automatically (no "Изпрати код" step), so it only
      needs confirming (111111 bypass applies). Covered by one new test in
      profile-settings.spec.ts (new file for all profile-settings coverage).
- [x] Profile settings: edit school & grade — verified live (2026-09-15): same
      form/edit/preview button pattern as personal_data, section id is `additional_data`
      (not a guessable name — also revealed the other remaining sections' real ids:
      `login_email`, `login_details`, `newsletter`). Unlike personal_data, saving here is a
      plain AJAX POST with no phone re-verification. Covered by one new test in
      profile-settings.spec.ts.
- [x] Profile settings: change login email — verified live (2026-09-16): confirmed the
      longest of these flows. Save opens an intermediate "before we continue, we'll text
      your phone" prompt (#modal-send-code) → a third distinct SMS-code modal variant
      (#modal-confirm-code, neither deactivation's nor personal_data's) → then a
      confirmation email to the *new* address (subject "Потвърди смяната..."), and only
      visiting that link finalizes the change — which also logs the user out. Added
      fetchEmailChangeConfirmationLink() and covered by one new test in
      profile-settings.spec.ts.
- [x] Profile settings: change password — verified live (2026-09-16): plain old/new/confirm
      password fields, saves directly with no re-verification (same pattern as school &
      grade). Old password stops working, new one logs in immediately. Covered by one new
      test in profile-settings.spec.ts.
- [x] Profile settings: notification preference toggles — verified live (2026-09-16): two
      live toggles (comment-reply emails, marketing emails) — a third ("profile report to
      parent") is permanently disabled without a paid subscription, not covered. Saves
      directly, no re-verification. Notably, the preview text itself flips polarity ("Не
      искам..." -> "Искам...") on toggle, not just the status icon. Covered by one new test
      in profile-settings.spec.ts.
- [x] Subscription purchase: main /subscription/ flow, built as a reusable root-level page
      object (2026-09-23) — added specifically so future story folders can import it the
      same way they already import RegistrationPage/LoginPage, instead of each one
      re-deriving its own copy (as stories/UCHA-20682-multisport/pages/SubscriptionPage.ts
      had to before this existed). Moved the real FIBank sandbox test card from that story's
      local test-data/ to the root test-data/fibank-test-card.ts as a shared resource;
      updated the story's import accordingly (no behavior change there, only the import
      path). Verified live: duration cards (data-id 10/4/19 = 6/12/24 months, 12 is the
      default), payment method cards (data-id 2/3/4 = cash/card/epay, card is the default),
      contract type cards (data-id N/Y = prepaid/installment). Covered by 8 new tests in
      tests/subscription/subscription-purchase.spec.ts:
      - 12-month prepaid is the default selection with the correct price (155,40 €/303,94 лв.)
      - switching to 24 months updates the price (294 €)
      - switching to installment reveals the monthly-contract price instead of the total
      - 12-month prepaid via FIBank card completes and shows an active subscription
      - 24-month prepaid via FIBank card completes and shows an active subscription
      - 12-month installment: confirmed the extra `/payment-contract` parent/guardian +
        SMS-verification step before FIBank (same flow already found in the MultiSport story)
      - EasyPay ("В брой"): confirmed it's a *pending* order with a 10-digit payment code,
        not an activated subscription by itself, then settles it for real via EasyPay/B-Pay's
        own demo bill-payment simulator (`demo.epay.bg/ezp/pay_bill.cgi`, provided by the
        user) and confirms the subscription actually activates from that alone
      - ePay: confirmed the redirect to the real ePay gateway (`demo.epay.bg` on dev) carries
        the correct invoice amount, then logs in with user-provided demo credentials
        (`test-data/epay-test-credentials.ts`), confirms the pending payment, and confirms
        the subscription activates after following the gateway back to our own site
      Found and fixed two real bugs along the way (see HEALING_LOG.md for both): (1)
      `/pay_final.php` (EasyPay's confirmation page) has a genuine duplicate-
      `id="payment-help-details"` markup bug; (2) switching payment method and immediately
      clicking subscribe can silently submit under the *previous* method — traced to an
      async `/payment/subscription/load-payments` call the page fires after its initial
      render, which gates which payment methods are actually selectable; fixed in
      `SubscriptionPage.goto()`/`selectPaymentMethod()`. Also added `waitForActiveSubscription()`
      since neither gateway's confirmation activates the subscription instantly.

<!-- 2026-10-06: payment items below added at the user's request, now that the FIBank bug
is fixed (all 8 subscription tests pass again, incl. the card checkouts). Items 1–5 complete
the Staging Checklist's "Абонаменти, ключове" section; 6–10 are deeper payment coverage.
Each purchase uses a fresh throwaway account (as the existing subscription tests do), and
everything builds on the existing pages/SubscriptionPage.ts. -->

- [x] Subscription purchase: 6-month prepaid by card, ePay and EasyPay; 24-month prepaid by
      ePay and EasyPay; 24-month installment by card — verified live (2026-10-07). Duration
      data-ids: 10 = 6 months, 4 = 12, 19 = 24. Prices: 6 months 122,70 € / 239,98 лв.
      (20,45 €/month); 24 months 294,00 € / 575,01 лв.; 24-month installment 15,95 €/month.
      ePay shows the amount without trailing zeros ("122.7", "294"). 6 months can't be paid
      monthly (the card gets `disabled` once installment is selected). 7 tests in
      tests/subscription/subscription-durations.spec.ts; the shared register+confirm+login
      step moved to utils/registerAndLogin.ts. Staging Checklist subscription rows (card /
      ePay / EasyPay × 6/12/24, monthly 12/24) are now all covered.
- [x] Gift subscription (TC_C037) — verified live (2026-10-07): /podarak-za-uchenik/ has one
      pay button per method (card `data-qa="select_payment_3"`, cash `_2`, ePay `_4`); card
      goes straight to FIBank ("Закупуване на подарък - 12 месеца абонамент" — the gift is
      always 12 months) → /payment/final/success ("Вие успешно закупихте подарък…", link to
      /profile/gifts/{id}). The buyer gets an 8-digit code on /profile/subscription/ ("КОД ЗА
      ПОДАРЪК: …") but no subscription. Redeemed on /promo (#input_voucher, #save-data):
      "Поздравления! Твоят абонамент е активиран!", 12-month prepaid active, payment history
      "Подарък от Уча.се: абонамент за подарък 12 месеца. Статус: Успешно зареждане". Unknown
      code → `.voucher-error`. 2 tests in tests/subscription/gift.spec.ts; new GiftPage and
      PromoPage. Not covered: gift by cash/ePay, the gift email, reusing an already-used code.
- [x] Chemistry keys purchase (TC_S007) — verified live (2026-10-07): /my-keys/ shows
      "Оставащи ключове: N" + unlocked videos; "Зареди ключове" → /keys/ (same card pattern as
      /subscription/: packages data-id 7 = 60+20 free (default, 61,36 €), 6 = 20, 5 = 3
      (7,67 €); payment card/cash/ePay) → FIBank ("Активиране на N ключа…") →
      /payment/final/success ("Браво! Ти успешно закупи …") → keys added. 2 tests in
      tests/subscription/chemistry-keys.spec.ts; new ChemistryKeysPage.
- [ ] Chemistry keys: unlocking a video with a key. Lessons are /watch/{id}/… under
      /videos/himiya-kandidat-studenti/{mu-sofia,mu-varna}/ (e.g. /watch/11105/…). No unlock
      button found on the lesson page itself — likely inside the player / only after play
      (docs: POST /video/[:payment_video_id]/unlock). Explore before writing the test; assert
      the key count drops by 1 and the video appears under "Моите отключени видеа".
- [x] Failed card payments via the FIBank simulator — verified live (2026-10-07), "изтекла
      карта" only (the other reasons fail every payment on dev for everyone — the user chose
      to leave them out). set-data form: `select[name="fail_reason"]` (0 normal, 101 expired
      card, 116 / 1000 / 110 / 160 site-wide). Declined card → back on
      /payment/final/success (!) with "Неуспешно завършена поръчка! Няма извършена
      трансакция…", history "Статус: Отказана поръчка", no subscription (URL quirk in
      ATTENTION.md). New pages/SetDataPage.ts; always reset to normal in `finally`.
- [ ] Failed card payments: the site-wide reasons (недостатъчна наличност, неизвестна
      причина, грешна сума, 3DS) — only once the team agrees on a window when nobody else is
      paying on dev.
- [x] Payment history (/payment-history/) — verified live (2026-10-07): success entry
      "Поръчка на абонамент за 12 месеца с карта. | Статус: Успешно плащане" plus
      "Автоматично подновяване: Включено"; declined entry "Статус: Отказана поръчка". Both in
      tests/subscription/payment-results.spec.ts (2 tests).
- [ ] Subscriber self-service after paying: turn auto-renewal off and back on, "Актуализирай
      картата си" (update card) with the test card, and the installment schedule shown in the
      profile (UCHAdocumentation TC_C032 / TC_C033, §6.4).
- [ ] School code (/kod, UCHAdocumentation §5.7 / §6.5): requires an active 12- or 24-month
      prepaid subscription and a real school code — negative cases (no subscription, invalid
      code) are automatable now; a valid code needs one from the admin panel (escalate to
      ATTENTION.md if none is available, don't guess).
- [ ] Expiry emails via set-data's "Subscription Email Simulation" (§11.8): with recurring
      off, simulate e.g. "Изтичащ след 7 дни" and "Изтекъл преди 0 дни" and check the email
      arrives (Gmail helper). Check §6.9 for which subscription types are excluded.

<!--
Eduboom (it.eduboom.dev, ro.eduboom.dev) intentionally out of scope for now — user asked
to focus on Ucha.se only (2026-09-15). Re-add when Eduboom coverage is actually wanted:
- [ ] Eduboom IT (it.eduboom.dev): scaffold pages/tests structure + login flow
- [ ] Eduboom RO (ro.eduboom.dev): scaffold pages/tests structure + login flow
-->
