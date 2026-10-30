# Expense Tracker

> Modern, offline-first Android expense tracking and monthly budget planning application with comprehensive annual category analytics.

---

## 🌟 Features

* **💰 100% Offline & Private:** Zero remote servers, zero account signups, zero telemetry. All financial records are stored securely on your device.
* **📅 Monthly Expense Tracking:**
  * Track expenses across months with quick navigation.
  * Live spending dashboard with budget utilization gauge (Under-budget green / Warning amber / Over-budget red).
  * Filter by category and search transactions instantly.
  * Detailed transaction records: Title, Amount (₹), Category, Date, Payment Method (UPI, Net Banking, Credit Card, Cash, etc.), Notes, and Recurring flag.
* **🎯 Monthly Budget Planning:**
  * Set total monthly spending targets or allocate granular targets for each category.
  * **1-Tap "Copy Previous Month Plan"** to effortlessly carry forward budgets.
  * Live variance tracking showing budgeted vs. actual spending.
* **📊 Annual Category Analytics:**
  * Switch between years to view annual expenditures.
  * Key performance metrics: Total Annual Spend, Monthly Average, Top Expense Category, and Peak Spending Month.
  * **Category Breakdown:** Visual distribution and % share for:
    * 🏦 **Loan** (Mortgage, Car EMI, Personal Loans)
    * 💳 **Credit Card** (Card statements, payments)
    * 💡 **Utilities** (Electricity, Water, Gas, Internet)
    * 👨‍👩‍👧‍👦 **Family** (Groceries, Household, Education)
    * 🛡️ **Insurance** (Health, Life, Vehicle)
    * 🏷️ **Custom Categories** (Investments, Subscriptions, etc.)
  * **12-Month Distribution:** Month-over-month trend comparison from January to December.
* **🇮🇳 Indian Rupee (₹) Native:** Native Rupee formatting with Indian numbering representation (e.g. `₹1,25,000`).
* **📦 Data Backup & Export:**
  * Export complete JSON backup for instant restore or device transfer.
  * Export CSV reports compatible with Excel and Google Sheets.
  * One-click restore from JSON backup.

---

## 🚀 GitHub Actions APK Build Pipeline

This repository is configured to build your Android APK entirely in the cloud via **GitHub Actions**—**no Android Studio, Android SDK, or Gradle needs to be installed on your laptop.**

### How to Get Your Android APK:
1. Push any commit to the `main` branch (or run the workflow manually via **Actions** -> **Run workflow**).
2. The pipeline automatically increments the version name on every build:
   * Build #1 ➔ `expense-tracker-0.0.1-beta.apk`
   * Build #2 ➔ `expense-tracker-0.0.2-beta.apk`
   * Build #3 ➔ `expense-tracker-0.0.3-beta.apk`
3. Go to the **Actions** tab on your GitHub repository: `https://github.com/irinthekkan/ExpenseTracker/actions`
4. Click on the latest run titled **"Build Expense Tracker APK"**.
5. Scroll to the **Artifacts** section at the bottom of the summary page.
6. Download **`expense-tracker-0.0.X-beta`**.
7. Unzip the downloaded file to find **`expense-tracker-0.0.X-beta.apk`** and install it directly on your Android phone!

---

## 🛠️ Tech Stack

* **Mobile Architecture:** [Capacitor 8](https://capacitorjs.com/) with native Android Gradle project.
* **UI Framework:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Tailwind CSS v4](https://tailwindcss.com/).
* **Icons:** [Lucide React](https://lucide.dev/).
* **Testing:** [Vitest](https://vitest.dev/) automated test suite for calculations and exports.
* **CI/CD:** GitHub Actions runner (`ubuntu-latest`, Temurin Java 21, Android SDK 36).

---

## 🧪 Local Verification

If you ever wish to test or verify the web bundle locally without installing any Android tools:

```bash
# Install dependencies
npm ci

# Run test suite
npm run test

# Build production bundle
npm run build

# Preview locally
npm run preview
```

---

## 🔒 Security & Privacy

* All user data is kept locally on the device (`localStorage` / Capacitor Storage).
* No network requests are made by the application for transaction handling.
* Your financial privacy is completely protected.
