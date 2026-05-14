# RNT Mobile — Codebase Audit Report

**Date**: 2026-05-14  
**Scope**: SvelteKit 5 PWA, Cloudflare Pages/Workers deployment  
**Severity legend**: 🔴 Critical 🟠 High 🟡 Medium 🟢 Low

---

## 1. SECURITY

### 🔴 CRITICAL-1: WordPress Auth Status Exposes User Session State

**Files**: `worker.ts` lines 42–84, `vite.config.ts` lines 38–62  
**Issue**: `/api/wp-auth-status` probes the WordPress admin panel on behalf of the client. Any visitor can determine whether a specific email has a WordPress account, enabling user enumeration.

### 🔴 CRITICAL-2: Hardcoded Sendy List ID in wrangler.toml

**Files**: `wrangler.toml` lines 14–15  
**Issue**: `SENDY_LIST_ID` is stored in source control. Combined with `SENDY_BASE_URL`, this enables spam subscription attacks. The Worker has no rate limiting on the signup endpoint.

---

## 2. WORKER ROUTES

### 🟠 HIGH-1: Unprotected Admin Probe

**File**: `worker.ts`  
**Issue**: The `/api/wp-admin-check` route has no authentication or rate limiting. Can be abused to discover WordPress admin availability.

### 🟠 HIGH-2: Missing Auth Middleware on Sensitive Endpoints

**File**: `worker.ts`  
**Issue**: Several API routes lack authentication checks that should validate Cloudflare-turnstile or similar CAPTCHA tokens.

---

## 3. CONFIG & DEPLOYMENT

### 🟡 MEDIUM-1: Hardcoded WordPress URLs

**Files**: `vite.config.ts`, `worker.ts`  
**Issue**: WordPress base URL hardcoded in multiple places. Should use environment variables for staging/production parity.

### 🟡 MEDIUM-2: No Content-Security-Policy Headers

**File**: `worker.ts` response handling  
**Issue**: No CSP headers set. Leaves the app vulnerable to XSS and data injection attacks.

---

## 4. RECOMMENDATIONS

1. **Remove** `/api/wp-auth-status` and `/api/wp-admin-check` — user enumeration is a privacy violation (DSGVO).
2. **Rate-limit** all public endpoints (signup, newsletter).
3. **Move** Sendy config to Cloudflare secrets, never commit list IDs.
4. **Add** CSP headers via Worker middleware.
5. **Externalize** all WordPress URLs to environment variables.
6. **Audit** authentication middleware coverage on all sensitive routes.
