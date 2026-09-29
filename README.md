# Face Consent Manager — Expo App

This Expo React Native app is wired to the supplied Face Consent Manager API and follows the uploaded UI reference.

## API base URL

Configured in `src/api.ts`:

`https://874c-2409-40d2-10be-296d-8973-117c-6abc-8b70.ngrok-free.app`

If your ngrok URL changes, update `BASE_URL`.

## Main features

- Guest list with All / Opt In / Opt Out / Pending filters
- Search guest by name, guest ID or phone
- Add guest manually (`POST /guests/manual`)
- Add details to scanned guests (`POST /guests`)
- Opt-in + OTP verification
- Opt-out
- Merge duplicate returning guests
- Guest visit/history screen
- Waiter arrivals and table seating
- Current table view and release
- Today table reports
- Employee list
- Health check, manual scan, POS sync and development dummy-data tools
- Pull-to-refresh

## Run

```bash
npm install
npx expo start
```

For Android:

```bash
npx expo start --android
```

For a physical phone, make sure the phone can reach the ngrok URL. Since the API is HTTPS, no Android cleartext setting is required.

## Important API behavior

For scanned guests with a photo, use the details flow first, then opt-in/OTP.

For guests without a photo, use the manual guest flow.

If the API returns `409` because a phone already belongs to another guest, use Merge.

The supplied API documentation says development OTP is `123456` when the backend runs outside production.

## Build

After confirming the app works:

```bash
npx expo-doctor
npx eas build:configure
npx eas build -p android --profile preview
```

If you want an APK, set the preview profile's Android build type to `apk` in `eas.json` after EAS configuration.
