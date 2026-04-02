// firebase-init.js -- Shared Firebase config URLs and initialization for Lola's Party System
// Loaded as a non-module <script> on all pages that use Firebase, before module scripts.
//
// Usage (in a page's <script type="module">):
//   import { initializeApp } from '...firebase-app.js';
//   import { getFirestore } from '...firebase-firestore.js';
//   const { app, db, config } = await window.initFirebase({ initializeApp, getFirestore });

/**
 * Cloud Function endpoint URLs (Gen2, *.run.app format).
 * All pages reference these instead of hardcoding URLs.
 */
window.CLOUD_FN_URLS = {
    CONFIG:             "https://get-firebase-config-<CLOUD_RUN_HASH>.a.run.app",
    CHECK_AVAILABILITY: "https://check-availability-<CLOUD_RUN_HASH>.a.run.app",
    SUBMIT_INQUIRY:     "https://submit-inquiry-<CLOUD_RUN_HASH>.a.run.app",
    ECOMMERCE_CHECKOUT: "https://create-ecommerce-checkout-<CLOUD_RUN_HASH>.a.run.app",
    DEPOSIT_LINK:       "https://generate-deposit-link-<CLOUD_RUN_HASH>.a.run.app",
    REJECT_ORDER:       "https://reject-order-<CLOUD_RUN_HASH>.a.run.app",
    FINAL_BALANCE:      "https://generate-final-balance-link-<CLOUD_RUN_HASH>.a.run.app",
    ADMIN_CREATE:       "https://admin-create-order-<CLOUD_RUN_HASH>.a.run.app",
    ADMIN_OPS:          "https://admin-operations-<CLOUD_RUN_HASH>.a.run.app"
};

/**
 * Fetch Firebase config and initialize the app.
 *
 * @param {Object} firebaseImports - Firebase SDK functions imported by the calling module
 * @param {Function} firebaseImports.initializeApp - Required
 * @param {Function} firebaseImports.getFirestore - Required
 * @param {Function} [firebaseImports.getAuth] - Optional (admin.html only)
 * @param {Function} [firebaseImports.getStorage] - Optional (admin.html only)
 * @returns {Promise<{app, db, auth, storage, config}>}
 */
window.initFirebase = async function(firebaseImports) {
    const { initializeApp, getFirestore, getAuth, getStorage } = firebaseImports;
    const resp = await fetch(CLOUD_FN_URLS.CONFIG);
    if (!resp.ok) throw new Error(`Config fetch failed: ${resp.status} ${resp.statusText}`);
    const config = await resp.json();
    if (config.error) throw new Error(config.error);
    const app = initializeApp(config);
    const db = config.databaseId ? getFirestore(app, config.databaseId) : getFirestore(app);
    return {
        app,
        db,
        auth: getAuth ? getAuth(app) : null,
        storage: getStorage ? getStorage(app) : null,
        config
    };
};
