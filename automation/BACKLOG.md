# Coverage backlog

Checklist of the next units of work for autonomous `/autoTest` sessions to pick up, in
order. Check an item off when its test is written, passing against `ucha-dev`, and
committed. Append new items (with a one-line note on why) rather than reordering existing
ones, unless a note explains why priority changed.

`- [ ]` open · `- [x]` done · `- [?]` proposed by the Backlog Scout — waits for the user's OK
in the "Proposed" section at the end and is never picked up until approved (see
`AGENT_RULES.md`, "Backlog Scout").

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
- [ ] BLOCKED — never pick up unattended. Failed card payments: the site-wide reasons (недостатъчна наличност, неизвестна
      причина, грешна сума, 3DS) — only once the team agrees on a window when nobody else is
      paying on dev.
- [x] Payment history (/payment-history/) — verified live (2026-10-07): success entry
      "Поръчка на абонамент за 12 месеца с карта. | Статус: Успешно плащане" plus
      "Автоматично подновяване: Включено"; declined entry "Статус: Отказана поръчка". Both in
      tests/subscription/payment-results.spec.ts (2 tests).
- [x] Subscriber self-service: auto-renewal off and back on (TC_C033) — verified live
      (2026-10-20): "Изключи" (#turn-recurring-off) → /profile/recurring-off/ →
      #switch-off-button → confirm dialog #modal-recurring-off ("Можете да загубите подаръка
      си", "Да") → "…подновяване на абонамента Ви е изключено."; profile shows "Изключено".
      "Включи" (late-bound handler — needed clickWhenReady) → FIBank "Настройки на
      автоматично подновяване на абонамента" (holds 0,01 €; submit says "Включете", not
      "Плащане") → /payment/final/success "Успешна промяна! … включено." + last 4 card
      digits. 1 test in tests/subscription/auto-renewal.spec.ts; new
      SubscriptionPage.enableRecurringWithCard().
- [ ] Subscriber self-service: "Актуализирай картата си" (update card, #update-mode) with the
      test card, and the installment schedule shown in the profile (UCHAdocumentation
      TC_C032, §6.4).
- [ ] School code (/kod, UCHAdocumentation §5.7 / §6.5): requires an active 12- or 24-month
      prepaid subscription and a real school code — negative cases (no subscription, invalid
      code) are automatable now; a valid code needs one from the admin panel (escalate to
      ATTENTION.md if none is available, don't guess).
- [ ] Expiry emails via set-data's "Subscription Email Simulation" (§11.8): with recurring
      off, simulate e.g. "Изтичащ след 7 дни" and "Изтекъл преди 0 дни" and check the email
      arrives (Gmail helper). Check §6.9 for which subscription types are excluded.

<!-- 2026-10-26: added for unattended night runs (automation/NIGHT_RUN.md), proposed from
UCHAdocumentation §1–12, the Уча.се Staging Checklist (Confluence 3776741470 v675 — rows 2,
10, 14 and 22–32 had no automated tests) and read-only curl checks of t.ucha.dev as a guest.
Ordered by value × feasibility. Items marked "Guest" or "Shared student" also work when Gmail
is unavailable; the rest need a fresh account. Delete any you don't want before a run. -->

- [x] Content access, guest — built 2026-10-26: 6 tests in tests/content/content-access-guest.spec.ts
      + pages/LessonContentPage.ts. The hint bubbles (#free_video_guest / #trailer_guest) are
      player cue points shown ~30 s into playback, so the tests assert their text in the DOM,
      not visibility; playback itself isn't covered. Lesson ids are 8000 (free) / 8005 (trailer).
      Original notes — checked with curl (2026-10-26): on /watch/{id} the
      first 5 lessons of a grade (e.g. 6. клас math /watch/8000–8004) say "Това е безплатен
      видео урок…", the 6th onward (/watch/8005) "Това е трейлър с избрани моменти от видео
      урока!" + "Регистрирай се". Both tests checked (lessons 1 and 6) say "За да разбереш
      как да направиш теста, регистрирай се в Уча.се!" (question preview still listed).
      /pregovor/2099 (lesson 1) shows the map + "Изтегли мисловната карта"
      (/download-mindmap/2099/8000/0 → image/jpeg attachment); /pregovor/2104 (lesson 6)
      says "За да видиш преговора, регистрирай се в Уча.се!" and its download URL returns
      HTML, no file. Guest; assert text, not playback.
- [ ] Search: header lesson search (UCHAdocumentation §4.1) — jQuery autocomplete on
      #searcher → GET /ajax/lessons-search?term= (min. 2 chars, 750 ms delay). Checked with
      curl: "призма" → 5 lessons (title + "Математика" + "6. клас"), each linking to
      /watch/…; nonsense → "Ооо, не! Не намираме това, което търсиш." Assert results
      render, clicking one opens that lesson, no-results state, Escape/X closes the overlay.
      Guest (repeat once as shared student if the result "state" differs).
- [ ] Login: redirect back to the requested page — as guest, /profile/, /profile/settings/,
      /subscription/, /my-keys/, /promo, /new-prices, /kodabonament, /profile/dnevna-misia
      all 302 to /login/ (checked with curl); after logging in, assert the user lands on the
      page they asked for (§5.2 says "previously visited page"; a plain login goes to "/").
      /set-data.php sends guests to "/" instead — assert that too. Shared student (login
      only, no changes).
- [ ] Registration: validation and rejected input — already-registered email (the shared
      student's), malformed email, too short/weak password, empty username/phone: exact
      error text, no step advance, nothing created. Plus UCHA-20432: for Ученик/Родител a
      label under the school field shows the number of registered students + parents from
      that school, hidden until a school is chosen. Guest (never submit a valid form).
- [ ] Leaderboard (/klasaciya-uchenitsi, §4.8) — checked with curl: guest sees tabs "Обща"
      / "Седмична", filters "в Уча.се" / "в града" / "в училище", a countdown "Следващо
      обновяване след:", only the top 15 with masked names ("Au***…") and "За да видиш
      цялата класация, трябва да си част от Уча.се". Logged in: full list, the city/school
      filters actually filter (UCHA-20579), weekly tab differs from overall. Guest + shared
      student. Docs also list an "История" tab that guests don't see — check it logged in.
- [ ] Cookie consent (UCHA-19971) — the banner ("Приемам всички" data-cookie-choose="2",
      "Отказвам всички" "-1") shows in a fresh context; after either choice it's gone and
      stays gone after reload and on another page, with the consent cookie set
      accordingly. Guest, new context per choice.
- [ ] Video player controls (row 25): back/forward skip, playback speed, fullscreen — on a
      free lesson as guest (/watch/8000/nachalen-pregovor-delimost; Flowplayer 3.14 + HLS
      .m3u8, keyboard plugin loaded). Assert on the <video> element / player API
      (currentTime delta after skip, playbackRate after choosing a speed,
      document.fullscreenElement), not on pixels. Risk: Playwright's bundled Chromium may
      not decode H.264; try `channel: 'chrome'` before giving up, and escalate rather than
      fake playback.
- [ ] Content access, free account: the same lessons/tests/mind maps (rows 23 + 27) — a
      fresh student account: free vs trailer lesson banners (the text likely changes from
      "Регистрирай се" to "Активирай абонамент"), whether the lesson 1–5 test can be started
      ("Започни теста") while lesson 6+ shows the subscription CTA, and mind map 6+ still
      locked. Fresh account. Open question: the FAQ mentions a trial; if new accounts get
      one, note what it unlocks and for how long.
- [ ] Campaign: Decathlon 15-day code (UCHAdocumentation §7.6, UCHA-20618) — /campaign/
      decathlon is live on dev ("+15 дни абонамент", valid 01.08.2026–30.11.2026, guest sees
      "За да използваш кода за подарък, стани част от Уча.се!" + login/register). Logged in:
      activate the universal code `decathlon15` (docs; the page only shows "DECATHLON", so
      explore whether the field is there or on /promo) → success, 15 days active on
      /profile/subscription/, "Decathlon" in /payment-history/, email #215 (Gmail helper); a
      second activation is rejected. Fresh account. Also the cheapest free way to get a
      subscribed account for the next item (build it as a shared helper); activation closes
      14.12.2026.
- [ ] Content access, subscriber (rows 24 + 28) — fresh account + decathlon15 (previous
      item's helper): lesson 6+ (e.g. /watch/8005) has no trailer banner, its test starts,
      mind map 6+ shows and /download-mindmap/2104/8005/0 returns the image. If the
      Decathlon code is unavailable, a 6-month FIBank card purchase works but is slow —
      prefer escalating over adding payments.
- [ ] Tests: solving a test end to end (row 29, §4.13) — on a free test, e.g.
      /testove/6161/delimost-nachalen-pregovor (15 questions, mixed types): "Започни теста"
      → answer every question → final page title is one of the five grade texts in §4.13
      with the user's name, "Резултати от теста" lists every question with correct/user
      answers, header/profile XP ("XP от решаване на тестове") goes up, the test page then
      shows the best result, and the grade page tooltip leaves "Незапочнат тест". Second
      test: leaving mid-test shows the exit modal. Fresh account (changes XP).
- [ ] Password reset: negative paths — unknown email on /reset-password/ shows an error and
      sends nothing; the emailed link is single-use (opening it again after a successful
      reset is rejected); mismatched new/confirm passwords are rejected. Reuse the existing
      reset helper. Fresh account.
- [ ] Registration: unconfirmed account — register, don't open the activation link, try to
      log in: assert what the site does (blocked with a message, or logged in with a
      "потвърди имейла" reminder); resend the confirmation (routes /send-reg-email,
      /add-reg-email exist) → a second email arrives and its link activates the account.
      Fresh account.
- [ ] Parallel sessions (row 14): same account in two browsers — log a fresh account in on
      context A, then on context B; assert what happens to A on its next navigation (logged
      out / warning / both stay in). Fresh account only, so the shared student isn't kicked
      out of other tests. Risk: membership.js redirects to /login/device-verification when
      the server asks for it (new-device 2FA) — if that appears, stop, log it in
      ATTENTION.md, don't automate around it.
- [ ] Kindergarten: /dg without a valid code (rows 30 + 32, negative parts) — checked with
      curl: guest sees "Първо влез в профила си или се регистрирай!" + buttons; logged in
      (fresh parent account with "Дете в детска градина"): code field shows, a
      malformed/unknown code gets an error (POST /kidenrgarten-code-activate), and a
      pre-school lesson (/videos/preduchilishtna-podgotovka-matematika/2-grupa/) is still
      locked with the upsell shown. A valid АДГ code is admin-only → ATTENTION.md.
- [ ] Code pages: invalid codes on /campaign/a1 and /kodabonament — guest on /campaign/a1
      sees "Активирай своя абонамент, като влезеш в профила си…" + login/register; logged
      in, an unknown A1 code gets the error from UCHA-20613. /kodabonament (guest →
      /login/) with a fresh teacher account: an unknown teacher code is rejected. Also: MiMU
      (`mimu15`, page says valid 21.06–30.09.2026) should now be refused — if it's
      accepted, that's a finding for ATTENTION.md, not a test to adjust. Fresh accounts.
- [ ] Streak discount at checkout (§5.13, §6.6) — on the account's own /set-data.php, "Запази
      отстъпката" with 5 / 10 / 15 % (`selected_discount`), then /subscription/ shows the
      discount and the reduced total (compute it from the displayed base price; don't
      hardcode). If the discount only shows at FIBank, check the amount there and cancel
      without paying. Fresh account (set-data streak forms are per-user); open question:
      which plans/durations it applies to.
- [ ] Streak days and watch history (§11.5–11.7) — via set-data "Add watched videos" for the
      last few days: the streak counter (header/profile) matches and the "Гледания" tab
      lists those days; "Break streak" on one date removes that day; "Нулиране на стрийк"
      with nothing watched today resets to 0 without removing an earned discount (§7.5).
      Fresh account.
- [ ] Profile: avatar upload and removal (§4.6) — input[name=profile_pic] → crop
      (x1/y1/x2/y2) → save (POST /profile/avatar): the header and profile avatar switch from
      the default image; delete (DELETE /profile/avatar) restores it. Needs a small image
      fixture in test-data/. Fresh account; also note whether profile completion % changes.
- [ ] Profile: "Моята учебна програма" (/profile/moyata-uchebna-programa/) — set the class,
      add a lesson from the curriculum and a custom entry, edit, delete one, then "delete
      all" (AJAX modes add / add-custom / update / delete / delete-all / save-class); the
      PDF download (/profile/moyata-uchebna-programa/pdf) returns a PDF. Fresh account;
      explore first, the docs say little about this tab.
- [ ] Daily missions ("Дневни мисии", /profile/dnevna-misia) — list of mission games, add one
      to the profile (/dnevna-misia/{slug}/dobavi) and remove it (/otkaji), start one
      (/dnevna-misia/{slug}) and confirm an answer is checked. Fresh account. Open question:
      free accounts may not have access, and the games may be canvas-based — if playing
      can't be automated reliably, cover add/remove/start only.
- [ ] Lessons: "Избери своя учебник" on a grade page (§4.9) — /videos/matematika/7-klas/ has
      12 textbooks (data-textbook-id); choosing one changes the lesson list/order and the
      button label, persists after reload (POST /textbook/nav/{id}/upsert) and can be
      cleared. Fresh account (saves a per-user setting; check guest behaviour too).
- [ ] Invite a friend (§5.14, /pokani-priyatel-specheli-bezplaten-abonament, login required)
      — the page shows a personal referral link (/iskam-da-ucha/{ref}); send an invitation
      (/invite-friend/send-mails) ONLY to our own kautotester+… alias and check it arrives
      (Gmail helper); the link opens registration, and registering through it shows up for
      the inviter if the page lists invitees. The friend-buys-a-subscription reward is out of
      scope (payment). Fresh accounts.
- [ ] Comments on a lesson (§4.13, /watch or /pregovor) — guest sees "За да коментираш, стани
      част от Уча.се!" and voting asks to log in; logged in: post a Cyrillic comment → shows
      under "Всички", edit it, voting on your own comment gives "Не можеш да гласуваш за свой
      коментар!", delete it. Fresh account. Risk: the comment is visible to anyone on dev
      until deleted — always delete in `finally`; if comments go to moderation or notify
      staff, stop and escalate.
- [ ] Login with phone number (row 2) — every test account uses 888123456, so try a fresh
      account logging in with "888123456" + its own password: if it lands in that account,
      cover it; if the shared number makes it ambiguous (another account or an error), mark
      it test.fixme and ask in ATTENTION.md for a dedicated number — don't invent
      real-looking phone numbers.
- [ ] Browsing to a lesson as guest: subject → grade → lesson — checked with curl (2026-10-26):
      /videos/matematika/ (200, h1 "Математика", empty #selected-class) and
      /videos/matematika/6-klas/ (200, h1 "Математика" + "6. клас" in #lessons-main-title, a
      section nav "Първи раздел … Осми раздел" with "Начален преговор" first, lesson 1 "Делимост.
      Начален преговор" linking to /watch/8000/nachalen-pregovor-delimost, lessons numbered 1,
      2, 3…, "Незапочнат видео урок" state icon on each). Assert: grade page title and section
      list render, clicking the first lesson lands on /watch/8000/… with its title, and a
      section link (#subcategory-…) scrolls to that section. Guest; read only; no playback.
      (Scout 2026-10-26: guest curl of t.ucha.dev; the textbook item covers only the selector)
- [ ] Unknown pages give a proper 404 — checked with curl (2026-10-26): /tova-ne-sashtestvuva-xyz
      and /watch/99999999/nesashtestvuvasht both return HTTP 404 with the heading "404: Не
      съществува такава страница!" and the "Ако все пак мислиш, че има нещо нередно…" line (title
      ends "Page Not Found", robots noindex). Also /watch/8000 (no slug) is 404, while
      /watch/8000/wrong-slug is 200 — assert both as they are today, and note in ATTENTION.md
      if the product team says the wrong-slug 200 is unintended. Guest; use
      `page.goto` response status + heading text.
      (Scout 2026-10-26: guest curl; no existing item covers error pages)
- [ ] Subscription page as guest (/abonament, §4.4) — checked with curl (2026-10-26): 200, title
      "Абонамент за Уча.се – Достъп до 27 000+ видео урока и теста", h1 "Абонамент за 27 000+
      видео урока, теста и преговора…", price line "При предплащане на 155,40 € | 303,94 лв.
      за период от 12 месеца." (EUR in `.base-price`, BGN in `.converted-price`), CTA "Регистрирай
      се безплатно" → /registration/, payment methods "С карта" / "В брой" / "Чрез ePay". Assert
      the price matches the one the logged-in /subscription/ default shows (155,40 €, existing
      test) and the CTA opens registration. Guest. Open question: logged in as the shared
      student the docs say the CTA becomes "Избери абонамент" — check it read-only, don't
      click through to a purchase.
      (Scout 2026-10-26: guest curl, UCHAdocumentation §4.4)

- [ ] First-login onboarding on the dashboard — found 2026-10-28 when the new shared student
      logged in: a full-screen slider (#pre-onboarding-process, "Как с Уча.се си научаваш бързо и
      успешно?", 3 video slides, prev/next arrows) covers "/" for a new account; the "Към
      уроците" button (#finish-preonboarding) only shows after the slides, and its handler just
      removes the overlay in the browser — it comes back on the next visit to "/" (seen live).
      Explore what makes it stop for good (watching the videos? the dashboard tour started by
      "Разбери как работи", #start-onboarding, when #dashboard has data-onboarding?), then cover:
      shown on first login, finishing it, the tour, and that it no longer appears afterwards.
      Fresh account on a fixed address (testAddress), deactivated at the end. Until then tests
      use BasePage.closeOnboardingOverlay().

## Proposed — needs your OK

Added by the Backlog Scout. Night runs never pick these. Approve in chat ("approve the
search one", "approve 2 and 5") and they move up as normal items; rejected ones go to the
list below so they aren't proposed again.

- [?] Password change ends other sessions (UCHA-20011, §7.4) — fresh account logged in on two
      browser contexts; change the password on A (existing profile-settings flow); assert B is
      logged out on its next navigation (redirect to /login/) and the new password logs in.
      Needs a fresh account, so it can't be confirmed while Gmail is down. Open question: the
      docs describe the mobile app session; confirm it applies to a second web session too.
      (Scout 2026-10-26: UCHAdocumentation §7.4; related to the "Parallel sessions" item)
- [?] Gift code can't be used twice — the gift item's "Not covered: reusing an already-used
      code": buy a gift by card (FIBank sandbox card), redeem on /promo with account B, then
      redeem the same code with account C and assert it is rejected (`.voucher-error`) and C
      gets no subscription. Payment + two fresh accounts, so it needs your OK.
      (Scout 2026-10-26: done gift item, "Not covered" remark)
- [?] Profile overview, read-only (§4.6) — shared student on /profile/: the tabs (Моят профил |
      Дневни мисии | Учебна програма | Абонамент | Учебни игри), the XP breakdown lines
      ("XP от посещения на сайта", "…от гледане на видео уроци", "…от решаване на тестове"), the
      level/XP header and the completion %. Not verifiable with curl as a guest (redirects to
      /login/), so the labels are from the docs and must be checked live first.
      (Scout 2026-10-26: UCHAdocumentation §4.6)

<!-- Rejected proposals — the Backlog Scout reads this list and never proposes these again:
- 2026-10-26 Facebook / Apple login and registration — third-party OAuth popups, no test identities.
- 2026-10-26 2FA: new-device verification, admin access, deletion via 2FA, adding an email to a
  phone-only account — 2FA/admin; phone-only accounts come from the app.
- 2026-10-26 Password reset by phone — every test account shares 888123456.
- 2026-10-26 App-only checklist rows — this is a web suite.
- 2026-10-26 Valid school / kindergarten / teacher / A1 / MultiSport / УАБ codes — admin-generated;
  only negative cases are in scope.
- 2026-10-26 Individual learning game (/individualna-uchebna-igra) — adaptive, unpredictable
  questions; revisit once the test-solving and Decathlon helpers exist.
- 2026-10-26 Contact form (floating button, UCHA-20614) — submitting emails the real support team.
- 2026-10-26 Messages envelope and notifications bell — need content from other users / admins.
- 2026-10-26 Weekly / parent profile report — weekly cron, nothing to assert within a night.
- 2026-10-26 "Препоръчан урок" dashboard block and the lesson-page FAQ section — content comes
  from admin CSV imports; can't tell which pages have it.
- 2026-10-26 FAQ page and its keyword search (/chesto-zadavani-vaprosi, /ajax/faq-search) — static
  help content, low value.
- 2026-10-26 Static / marketing pages: footer links, /za-roditeli, /uchiteli, /ekip, /corporate,
  gift-page subtext (UCHA-20751) — static or cosmetic.
- 2026-10-26 SEO: structured data, canonicals, sitemap, /llms.txt — not user-facing behaviour.
- 2026-10-26 More payments: subscription stacking, gift by cash/ePay — payment area is covered;
  the site-wide FIBank reasons are forbidden.
- 2026-10-26 XP / streak from actually watching a whole video — minutes of real playback per test
  + codec risk; the set-data streak item covers the logic.
-->

<!--
Eduboom (it.eduboom.dev, ro.eduboom.dev) intentionally out of scope for now — user asked
to focus on Ucha.se only (2026-09-15). Re-add when Eduboom coverage is actually wanted:
- [ ] Eduboom IT (it.eduboom.dev): scaffold pages/tests structure + login flow
- [ ] Eduboom RO (ro.eduboom.dev): scaffold pages/tests structure + login flow
-->
