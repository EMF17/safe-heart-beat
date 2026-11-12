# Run Pulse on a phone

Both native projects load https://pulse-checkin.app/app over HTTPS. These are native app shells around the live website, not offline copies. Publish website changes before testing them in the app. Check-ins previously saved in Safari are not automatically shared with the app; create a Sync Code in Safari and restore it in the app if needed.

## iPhone — personal device testing

Requires a Mac, Xcode 26 or later, an Apple Account, and an iPhone running iOS 15 or later. This Linux workspace cannot compile, sign, or install iPhone apps and cannot connect to your phone.

1. Connect this Lovable project to GitHub and download its source to your Mac.
2. Install Node.js 22 or later and Bun, then run `bun install` in the project folder.
3. Run `bun run mobile:ios` to sync and open the Xcode project.
4. Connect your unlocked iPhone to the Mac and accept **Trust This Computer**.
5. In Xcode, select the **App** target → **Signing & Capabilities**, enable automatic signing, and choose your Apple Account's team. If the bundle ID is unavailable, choose your own unique identifier in both Xcode and `capacitor.config.ts`.
6. Select your iPhone as the run destination and click **Run**. Follow any Xcode prompts to enable **Developer Mode** on your iPhone under **Settings → Privacy & Security**. You may also need to trust the developer under **Settings → General → VPN & Device Management**.
7. Open Pulse, complete welcome screens, save an emergency contact, tap **I'm Safe**, and check that the entry appears under **History** after reopening the app.

A free Apple Account normally supports personal-device testing with short-lived provisioning; it is not App Store distribution. TestFlight/App Store distribution requires paid Apple Developer membership, signing, submission, and review. App Store acceptance is not guaranteed, especially for website-wrapper apps.

## Android — personal device testing

Requires Android Studio, the Android SDK selected by the project's Gradle configuration, and JDK 21.

1. Download the source and run `bun install`.
2. Run `bun run mobile:android` to sync and open Android Studio.
3. Let Android Studio install requested SDK components and finish syncing.
4. Enable **Developer options → USB debugging** on your Android phone, connect it by USB, and accept its debugging permission prompt.
5. Select the phone in Android Studio and click **Run**. Follow the same check-in and History test above.

To generate an Android test APK locally, run `bun run mobile:apk`. It is written to `android/app/build/outputs/apk/debug/app-debug.apk`. This is a debug build, not a Play Store release. Store distribution requires a signed release, a Play Console account, and review. Never commit signing keys.

## Current limitations

- Internet is required to load the app; failed loading shows a local connection message. Reopen the app after reconnecting.
- QR scanning has camera permission declarations but must be tested on real devices.
- Website notification reminders are not native scheduled reminders and must not be relied on when the app is closed. This request does not add native push notifications or background email scheduling.
- Passkeys need separate native device validation; use Sync Code recovery if passkeys are unavailable.
- The check-in flow was tested in a phone-sized browser, not in a native device runtime.
- No IPA/APK has been compiled or signed in this workspace; iPhone execution requires the Mac and phone steps above.