# Security & Validation Rules

Version: 1.0
Status: Mandatory

---

# PURPOSE

Security is mandatory.

Every feature must be secure by default.

Never sacrifice security for convenience.

---

# AUTHENTICATION

JWT Authentication only.

Never trust frontend authentication.

Every protected endpoint must verify JWT.

Never expose secrets.

Never expose tokens.

Never log JWTs.

Never return passwords.

Never return password hashes.

Always verify token expiration.

---

# AUTHORIZATION

Every endpoint must validate roles.

Never trust role values from frontend.

Always use backend middleware.

RBAC must remain enforced.

Admin

Logistics Director

Carrier Dispatcher

Hub Operator

Each role may only access allowed resources.

---

# VALIDATION

Validate every request.

Validate

Body

Params

Query

Headers

Never trust client data.

Reject invalid requests.

Return meaningful validation errors.

---

# SANITIZATION

Sanitize all inputs.

Prevent

XSS

Injection

Prototype pollution

Malformed payloads

Trim strings.

Normalize values.

Reject dangerous content.

---

# PASSWORDS

Hash using bcrypt.

Never store plain passwords.

Never log passwords.

Minimum strength validation.

---

# FILE UPLOADS

Validate

File type

File size

Extension

Reject executable files.

Never trust filename.

Generate unique filenames.

---

# DATABASE

Never expose Mongo IDs unnecessarily.

Never allow unrestricted queries.

Validate ObjectIds.

Prevent duplicate writes.

Use transactions where required.

Use indexes when needed.

---

# API SECURITY

Rate limit sensitive endpoints.

Handle unauthorized access.

Handle forbidden access.

Handle expired tokens.

Return proper HTTP status codes.

Never leak stack traces.

---

# ERROR HANDLING

Return user-friendly messages.

Log detailed errors internally.

Never expose internal implementation.

Never expose database errors.

---

# LOGGING

Log

Authentication failures

Authorization failures

Server errors

Critical operations

Never log

Passwords

JWTs

Secrets

Personal sensitive data

---

# ENVIRONMENT VARIABLES

All secrets belong in .env.

Never hardcode

JWT Secret

Mongo URI

API Keys

SMTP Credentials

Gemini Keys

Cloudinary Keys

---

# SOCKET SECURITY

Authenticate socket connections.

Disconnect unauthorized users.

Validate emitted events.

Prevent unauthorized subscriptions.

---

# FRONTEND SECURITY

Protect private routes.

Clear auth state on logout.

Never store sensitive information outside secure storage.

Handle expired sessions gracefully.

---

# SECURITY CHECKLIST

Before completing any feature verify

✔ Authentication enforced

✔ Authorization enforced

✔ Validation complete

✔ Sanitization complete

✔ Error handling complete

✔ Secure API responses

✔ No sensitive logs

✔ No hardcoded secrets

✔ Database queries validated

✔ Production-ready security