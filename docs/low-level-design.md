# AI Code Review System - Low Level Design

## 1. LLD Overview

This document defines the internal structure of the AI Code Review System.

The backend will follow a modular layered architecture.

The major layers are:

```text
Routes
   ↓
Middleware
   ↓
Controllers
   ↓
Services
   ↓
Repositories / Prisma
   ↓
PostgreSQL

External services such as the LLM provider and static analysis tools will be
accessed through dedicated services.

2. Backend Architecture

The backend will be divided into the following layers:

┌─────────────────────────────┐
│           Routes            │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│         Middleware          │
│ Auth / Validation / Rate    │
│ Limiting / Error Handling   │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│         Controllers         │
└──────────────┬──────────────┘
               ↓
┌─────────────────────────────┐
│          Services           │
│ Business Logic              │
└───────┬─────────┬───────────┘
        │         │
        ↓         ↓
┌────────────┐ ┌──────────────┐
│   Static   │ │  AI Service  │
│  Analyzer  │ │              │
└────────────┘ └──────┬───────┘
                      ↓
                    LLM
        │
        ↓
┌─────────────────────────────┐
│       Prisma / Database     │
└──────────────┬──────────────┘
               ↓
        PostgreSQL
3. Backend Folder Structure

The backend will use the following structure:

server/
│
├── src/
│   │
│   ├── config/
│   │   ├── env.js
│   │   └── database.js
│   │
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── project.controller.js
│   │   ├── submission.controller.js
│   │   └── review.controller.js
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── project.routes.js
│   │   ├── submission.routes.js
│   │   └── review.routes.js
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── project.service.js
│   │   ├── submission.service.js
│   │   ├── review.service.js
│   │   ├── ai.service.js
│   │   ├── static-analysis.service.js
│   │   └── scoring.service.js
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validate.middleware.js
│   │   ├── rate-limit.middleware.js
│   │   └── error.middleware.js
│   │
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── project.validator.js
│   │   ├── submission.validator.js
│   │   └── review.validator.js
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── password.js
│   │   └── logger.js
│   │
│   ├── app.js
│   └── server.js
│
├── prisma/
│   ├── schema.prisma
│   └── seed.js
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
├── .gitignore
└── package.json
4. Routes Layer

Routes define HTTP endpoints.

Routes should not contain business logic.

Example:

POST /api/auth/register

The route should:

Receive the request.
Apply required middleware.
Call the appropriate controller.

Example structure:

Request
  ↓
auth.routes.js
  ↓
validate middleware
  ↓
auth.controller.js
5. Controller Layer

Controllers are responsible for handling HTTP requests and responses.

Controllers should:

Read request data.
Call services.
Return HTTP responses.
Pass errors to error middleware.

Controllers should NOT:

Directly query PostgreSQL.
Call the LLM directly.
Contain complex business logic.

Example:

auth.controller.js

register()
login()
getCurrentUser()
logout()
6. Service Layer

Services contain the main business logic.

Services include:

auth.service.js
project.service.js
submission.service.js
review.service.js
ai.service.js
static-analysis.service.js
scoring.service.js
7. Authentication Service

The authentication service handles:

register()
login()
verifyCredentials()
createSession()
logout()

Registration flow:

Controller
    ↓
Auth Service
    ↓
Validate email
    ↓
Check existing user
    ↓
Hash password
    ↓
Create user
    ↓
Create session
    ↓
Return authentication result
8. Password Utility

Password operations will be separated into a utility.

Responsibilities:

hashPassword()
comparePassword()

Passwords will be hashed using bcrypt.

The application will never store plain-text passwords.

9. JWT Utility

JWT operations will be isolated in:

utils/jwt.js

Responsibilities:

generateAccessToken()
verifyAccessToken()

The authentication middleware will use this utility.

10. Authentication Middleware

The authentication middleware will:

Read the Authorization header.
Extract the bearer token.
Verify the JWT.
Identify the user.
Attach the authenticated user information to the request.

Flow:

Request
   ↓
Authorization Header
   ↓
Extract JWT
   ↓
Verify JWT
   ↓
Valid?
 ┌─┴───────────┐
No             Yes
↓               ↓
401          req.user
                ↓
             Controller
11. Project Service

The project service handles project operations.

Responsibilities:

createProject()
getProjects()
getProjectById()
updateProject()
deleteProject()

Every operation must verify project ownership.

Example:

User ID
   +
Project ID
   ↓
Check Ownership
   ↓
Allowed?
 ┌─┴─────┐
No      Yes
↓        ↓
403     Continue
12. Submission Service

The submission service handles code submissions.

Responsibilities:

createSubmission()
getSubmissions()
getSubmissionById()

Before creating a submission:

Authenticate user.
Validate project.
Verify project ownership.
Validate programming language.
Validate code size.
Validate requirement size.
Store submission.
13. Review Service

The review service is the main coordinator of the code review process.

Responsibilities:

createReview()
getReview()
getProjectReviews()
getReviewIssues()

The review service coordinates:

Submission
     ↓
Static Analysis
     ↓
AI Service
     ↓
Response Validation
     ↓
Issue Merging
     ↓
Scoring
     ↓
Database
14. Static Analysis Service

The static analysis service is responsible for analyzing code using
deterministic tools.

Initial implementation will use ESLint.

Responsibilities:

analyzeCode()
normalizeResults()

Input:

Source Code
Language

Output:

{
  "tool": "eslint",
  "errorCount": 2,
  "warningCount": 3,
  "issues": []
}

The service should not contain AI logic.

15. AI Service

The AI service communicates with the selected LLM provider.

Responsibilities:

buildPrompt()
sendRequest()
parseResponse()
validateResponse()
normalizeResponse()

Input:

Code
Language
Requirements
Static Analysis Results

Output:

Normalized AI Review

The rest of the backend should not depend directly on the specific LLM
provider.

16. AI Provider Abstraction

The application should use an abstraction between the review service and
the LLM provider.

Conceptually:

Review Service
      ↓
AI Service
      ↓
AI Provider Interface
      ↓
LLM Provider

This allows the provider to be replaced later.

Example:

AI Provider
   ├── Provider A
   ├── Provider B
   └── Local Model

The review service should not need to know which provider is being used.

17. Prompt Builder

Prompt construction should be separated from the API call.

Responsibilities:

buildCodeReviewPrompt()

The prompt should include:

System Instructions
+
Programming Language
+
Source Code
+
Requirements
+
Static Analysis Results

The prompt should instruct the model to:

Analyze only the supplied context.
Avoid inventing bugs.
Identify uncertainty.
Return structured JSON.
Follow the defined schema.
18. AI Response Validator

The AI response must be validated before being used.

Flow:

LLM
 ↓
Raw Response
 ↓
Parse JSON
 ↓
Zod Validation
 ↓
Valid?
 ├── No → Retry / Error
 └── Yes
       ↓
Normalized Review

This prevents malformed AI responses from reaching the database.

19. Scoring Service

The scoring service calculates final review scores.

Responsibilities:

calculateOverallScore()
calculateQualityScore()
calculateSecurityScore()
calculatePerformanceScore()
calculateMaintainabilityScore()
calculateRequirementScore()

The scoring logic should be deterministic wherever possible.

Example:

Final Score
=
Quality
+
Security
+
Performance
+
Maintainability
+
Requirement Compliance

The exact weighting will be defined during implementation.

20. Issue Deduplication

Issues generated by static analysis and AI may overlap.

Example:

Static Analyzer:
Unused variable at line 10

AI:
Unused variable detected at line 10

The review service should identify likely duplicates.

Possible matching criteria:

Issue Type
+
Line Number
+
Similar Description

Duplicate issues should be merged where appropriate.

21. Validation Layer

Zod validators will validate incoming HTTP requests.

Validators include:

auth.validator.js
project.validator.js
submission.validator.js
review.validator.js

Example submission validation:

code:
required
string
maximum length

language:
required
enum

requirements:
optional
string
maximum length
22. Error Handling

A centralized error middleware will handle application errors.

Flow:

Controller
    ↓
Service
    ↓
Error
    ↓
next(error)
    ↓
Error Middleware
    ↓
HTTP Response

The application should not expose internal stack traces in production.

23. Repository / Database Access

Database operations will be performed through Prisma.

Services will use Prisma for:

Create
Read
Update
Delete

The application should not create raw database connections inside
controllers.

Example:

Controller
    ↓
Service
    ↓
Prisma
    ↓
PostgreSQL
24. Review Creation Sequence

The detailed review creation flow is:

POST /api/submissions/:id/reviews
              |
              v
       Auth Middleware
              |
              v
        Review Controller
              |
              v
         Review Service
              |
              v
      Fetch Submission
              |
              v
      Verify Ownership
              |
              v
     Create Review(PENDING)
              |
              v
     Run Static Analysis
              |
              v
       Build AI Prompt
              |
              v
          LLM API
              |
              v
      Validate AI Result
              |
              v
       Merge Issues
              |
              v
       Calculate Scores
              |
              v
      Update Review
              |
              v
       Save Issues
              |
              v
        Return Result
25. Review Service Pseudocode

Conceptually:

createReview(userId, submissionId):

    submission = getSubmission(submissionId)

    verifyOwnership(userId, submission)

    review = createPendingReview(submission)

    staticResult = analyzeCode(
        submission.code,
        submission.language
    )

    aiResult = analyzeWithAI(
        submission.code,
        submission.language,
        submission.requirements,
        staticResult
    )

    validateAIResult(aiResult)

    issues = mergeIssues(
        staticResult,
        aiResult
    )

    scores = calculateScores(
        staticResult,
        aiResult,
        submission.requirements
    )

    saveReview(
        review,
        scores,
        aiResult
    )

    saveIssues(
        review,
        issues
    )

    return review
26. Transaction Strategy

Database operations that must remain consistent should use database
transactions.

For example:

Create Review
     +
Create Issues
     +
Update Review Status

These operations should be coordinated so that a partially saved review is
avoided.

27. Review Failure Handling

If the review process fails:

PENDING
   ↓
RUNNING
   ↓
FAILED

The system should store enough information to identify the failure.

Sensitive provider details and API keys must never be exposed to the user.

28. Rate Limiting Layer

Rate limiting middleware will be applied to sensitive endpoints.

The most important endpoint is:

POST /api/submissions/:submissionId/reviews

Flow:

Request
   ↓
Rate Limiter
   ↓
Allowed?
 ├── No → 429
 └── Yes
       ↓
   Authentication
       ↓
   Controller
29. Logging

A centralized logger will be used.

Important events may include:

Authentication failure
Review started
Review completed
AI provider error
Database error
Validation failure
Rate limit exceeded

Logs should not contain:

Passwords
JWT secrets
LLM API keys
Full source code unless explicitly required
Sensitive user information

---

# 30. Frontend Structure

The frontend will use React.

Initial structure:

```text
client/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── CodeEditor.jsx
│   │   ├── ScoreCard.jsx
│   │   ├── IssueCard.jsx
│   │   └── LoadingState.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Projects.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── SubmitCode.jsx
│   │   ├── ReviewDetails.jsx
│   │   └── History.jsx
│   │
│   ├── services/
│   │   └── api.js
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │
│   ├── utils/
│   │
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
31. Frontend Authentication Flow
Login Form
    ↓
API Request
    ↓
Backend
    ↓
JWT / Session
    ↓
Auth Context
    ↓
Protected Application

The frontend should not expose sensitive backend secrets.

32. Frontend Review Flow
Submit Code Page
      ↓
User enters code
      ↓
User selects language
      ↓
User enters requirements
      ↓
Submit
      ↓
POST /reviews
      ↓
Review Result
      ↓
Review Details Page
33. Review Dashboard Components

The review dashboard should contain:

Overall Score
      ↓
Category
      ↓
Score Cards
      ↓
Summary
      ↓
Strengths
      ↓
Weaknesses
      ↓
Detected Issues
      ↓
Requirement Analysis
      ↓
Recommendations
34. State Management

The initial application can use React Context for authentication state.

Local component state can be used for:

Code editor
Form fields
Loading states
Review results

A dedicated global state library can be introduced later if the application
becomes more complex.

35. API Client

All frontend API calls should be centralized in:

services/api.js

The frontend should not duplicate API request configuration across components.

The API client will handle:

Base URL
Authentication headers
JSON requests
Error handling
36. Security Boundaries

The following boundaries must be maintained:

Frontend
   |
   | Public API
   v
Backend
   |
   +---- PostgreSQL
   |
   +---- LLM Provider
   |
   +---- Static Analyzer

The frontend must never directly access:

PostgreSQL
Prisma
LLM API keys
Internal backend services
37. Testing Structure

Backend tests:

tests/
├── unit/
│   ├── auth.service.test.js
│   ├── scoring.service.test.js
│   ├── ai.service.test.js
│   └── validators.test.js
│
└── integration/
    ├── auth.test.js
    ├── projects.test.js
    ├── submissions.test.js
    └── reviews.test.js

The goal is to test both isolated business logic and complete API flows.

38. Design Principles

The implementation should follow:

Separation of concerns
Single responsibility
Modular architecture
Dependency isolation
Input validation
Centralized error handling
Secure authentication
Resource ownership checks
Testability
Provider abstraction
Maintainability