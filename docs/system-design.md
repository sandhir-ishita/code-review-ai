# AI Code Review System - High Level Design

## 1. System Overview

The AI Code Review System is a full-stack web application that allows users
to submit source code and receive an automated code review.

The system combines:

1. Static Code Analysis
2. AI-based Code Analysis
3. Requirement-based Analysis
4. Rule-based Scoring
5. Persistent Review History

The application follows a client-server architecture.

---

## 2. High Level Architecture

The system consists of the following major components:

```text
                         USER
                           |
                           v
                  +------------------+
                  | React Frontend   |
                  +--------+---------+
                           |
                           | HTTP/HTTPS
                           v
                  +------------------+
                  | Express Backend  |
                  +--------+---------+
                           |
              +------------+------------+
              |            |            |
              v            v            v
        Authentication  Controllers  Validation
                           |
                           v
                       Services
                           |
                 +---------+---------+
                 |                   |
                 v                   v
          Static Analyzer       AI Service
                 |                   |
                 |                   v
                 |              Pre-trained
                 |                 LLM
                 |                   |
                 +---------+---------+
                           |
                           v
                        Prisma
                           |
                           v
                    PostgreSQL
3. Frontend

The frontend will be developed using React.js.

The frontend is responsible for:

User registration
User login
Dashboard
Project management
Code submission
Requirement input
Starting a code review
Displaying review results
Displaying detected issues
Displaying code quality scores
Displaying review history

The frontend communicates with the backend through REST APIs.

The frontend should not directly communicate with PostgreSQL or the LLM
provider.

4. Backend

The backend will be developed using:

Node.js
Express.js
JavaScript

The backend is responsible for:

Authentication
Authorization
Request validation
Project management
Code submission management
Static analysis
AI integration
Review generation
Score calculation
Database operations
Error handling
Rate limiting

The backend acts as the main application layer between the frontend,
AI services and database.

5. Authentication and Authorization

The system will use JWT-based authentication.

Authentication flow:

User
 |
 | Login
 v
Express API
 |
 v
Validate Credentials
 |
 v
Check Password using bcrypt
 |
 v
Generate JWT
 |
 v
Send JWT to Client

For protected requests:

React
 |
 | JWT
 v
Express API
 |
 v
Authentication Middleware
 |
 v
Verify JWT
 |
 +---- Invalid ----> 401 Unauthorized
 |
 v
Request Controller

Authorization will ensure that a user can access only their own projects,
submissions and reviews.

6. Project Management

Each authenticated user can create multiple projects.

Example:

User
 |
 +-- E-Commerce API
 |
 +-- College Management System
 |
 +-- Portfolio Backend

A project can contain multiple code submissions.

Each submission can have its own review.

7. Code Submission

The user submits:

Source code
Programming language
Project
Optional requirements

Example request:

Code:
function add(a, b) {
    return a + b;
}

Language:
JavaScript

Requirement:
Create a function that adds two numbers.

The backend validates the submission before processing it.

Validation includes:

User authentication
Project ownership
Supported programming language
Code length
Requirement length
Valid request structure
8. Code Review Pipeline

The code review process follows these steps:

User submits code
        |
        v
Authenticate user
        |
        v
Validate request
        |
        v
Check project ownership
        |
        v
Save code submission
        |
        v
Run Static Analysis
        |
        v
Prepare AI Review Input
        |
        v
Send code + requirements + static analysis
to LLM
        |
        v
Receive structured AI response
        |
        v
Validate AI response
        |
        v
Combine static analysis + AI analysis
        |
        v
Calculate scores
        |
        v
Save review in PostgreSQL
        |
        v
Return review to frontend
9. Static Code Analysis

Static analysis examines the source code without executing it.

For the initial version, JavaScript and TypeScript will be supported.

Static analysis may detect:

Syntax errors
Unused variables
Undefined variables
Code smells
Complexity issues
Style violations
Common JavaScript problems
Potentially dangerous patterns

ESLint will be used as one of the primary static analysis tools.

Static analysis results will be passed to the review service.

10. AI Review Service

The AI Review Service communicates with a pre-trained LLM.

The LLM will receive:

Source Code
+
Programming Language
+
User Requirements
+
Static Analysis Results

The AI will analyze:

Code quality
Readability
Maintainability
Logical correctness
Potential bugs
Security problems
Performance problems
Edge cases
Requirement compliance
Improvement opportunities

The AI should return structured JSON rather than an unstructured response.

11. AI Response Validation

AI responses cannot be trusted blindly.

The backend will validate the response before storing it.

Flow:

LLM
 |
 v
AI JSON Response
 |
 v
Schema Validation
 |
 +---- Invalid ----> Retry / Error Handling
 |
 v
Valid Review Data
 |
 v
Database

Zod will be used to validate the AI response structure.

12. Review Scoring

The system will generate scores between 0 and 100.

The main scores are:

Overall Score
Code Quality Score
Security Score
Performance Score
Maintainability Score
Requirement Compliance Score

Example:

Overall:              78
Code Quality:         82
Security:             70
Performance:          75
Maintainability:      85
Requirements:         80

The final scoring logic will be implemented in a separate scoring service.

13. Issue Classification

Detected issues will be classified by type.

Possible types:

BUG
SECURITY
PERFORMANCE
CODE_QUALITY
MAINTAINABILITY
REQUIREMENT

Each issue will also have a severity:

CRITICAL
HIGH
MEDIUM
LOW
INFO

Example:

Type: SECURITY
Severity: HIGH
Title: Potential SQL Injection
Line: 25

Description:
User input may be directly used in a database query.

Suggestion:
Use parameterized queries.
14. Requirement Analysis

The user can provide functional requirements along with the code.

Example:

Requirement:

Create an API that returns all active users.

The AI will compare the requirement with the submitted code.

The result may contain:

Requirement Compliance: 75%

Satisfied:
- User data is returned

Missing:
- Active users are not filtered

Recommendation:
Add filtering for active users.
15. Database Layer

PostgreSQL will be used as the primary database.

Prisma ORM will be used for database access.

The backend will communicate with PostgreSQL through Prisma.

Express
   |
   v
Service Layer
   |
   v
Prisma ORM
   |
   v
PostgreSQL

The database will store:

Users
Projects
Code submissions
Reviews
Issues
Review summaries
16. Error Handling

The backend will use centralized error handling.

Possible errors include:

Invalid request
Invalid authentication
Unauthorized access
Invalid project
Unsupported programming language
Code too large
AI API failure
Invalid AI response
Database failure
Rate limit exceeded

The API should return consistent error responses.

Example:

{
    "success": false,
    "message": "Project not found"
}
17. Security Architecture

Security will be considered at every layer.

The system will implement:

Password hashing
JWT authentication
Authorization
Input validation
Rate limiting
Secure environment variables
CORS configuration
HTTP security headers
Request size limits
Protection against unauthorized resource access

User-submitted code will not be directly executed on the backend.

18. Rate Limiting

AI requests can be expensive.

Therefore, review APIs will have rate limits.

Example:

User
 |
 v
Review API
 |
 v
Rate Limiter
 |
 +---- Limit exceeded ----> 429 Too Many Requests
 |
 v
AI Service

Rate limits can later be changed according to the user's plan.

19. Separation of Responsibilities

The backend will follow a modular architecture.

Routes
  |
  v
Controllers
  |
  v
Services
  |
  +---- AI Service
  |
  +---- Static Analysis Service
  |
  +---- Scoring Service
  |
  v
Prisma
  |
  v
PostgreSQL

Responsibilities:

Routes

Define API endpoints.

Controllers

Handle HTTP requests and responses.

Services

Contain business logic.

Middleware

Handle authentication, validation, rate limiting and errors.

AI Service

Communicates with the LLM provider.

Static Analysis Service

Runs static code analysis.

Scoring Service

Calculates review scores.

Prisma

Handles database communication.

20. Complete Request Flow

A complete code review request will work as follows:

1. User logs into the application.

2. Backend authenticates the user and generates a JWT.

3. User creates or selects a project.

4. User submits source code.

5. User optionally provides requirements.

6. Backend validates the request.

7. Backend verifies project ownership.

8. Submission is stored in PostgreSQL.

9. Static analysis is performed.

10. AI Review Service prepares the LLM request.

11. Code, requirements and static analysis results are sent to the LLM.

12. LLM returns structured review data.

13. Backend validates the AI response.

14. Static analysis and AI analysis are combined.

15. Review scores are calculated.

16. Issues and review information are stored in PostgreSQL.

17. Backend returns the review result.

18. React displays the review dashboard to the user.
21. Future Scalability

The initial application can process reviews synchronously.

For larger workloads, the architecture can later be extended using background
jobs and queues.

Future architecture:

React
  |
  v
Express API
  |
  v
Job Queue
  |
  v
Review Worker
  |
  +---- Static Analyzer
  |
  +---- AI Service
  |
  v
PostgreSQL

This will allow the system to handle multiple review requests without blocking
the main API server.

22. Future Enhancements

Future versions may include:

GitHub integration
GitHub Pull Request reviews
Repository analysis
Multi-file analysis
Code diff analysis
Automatic code fixes
AI-generated patches
More programming languages
Team collaboration
Role-based access control
Background job processing
Review analytics