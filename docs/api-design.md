# AI Code Review System - API Design

## 1. API Overview

The backend will expose RESTful APIs using Node.js and Express.js.

Base URL:

```text
/api

All APIs will use JSON for request and response data unless specified
otherwise.

Protected APIs will require JWT authentication.

2. Authentication
2.1 Register User

Creates a new user account.

Endpoint
POST /api/auth/register
Authentication

Not required.

Request
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
Response
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
Possible Errors
400 - Invalid input
409 - Email already exists
500 - Internal server error
3. Login

Authenticates a user and creates an authenticated session.

Endpoint
POST /api/auth/login
Authentication

Not required.

Request
{
  "email": "john@example.com",
  "password": "Password123"
}
Response
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "accessToken": "jwt-token"
  }
}
Possible Errors
400 - Invalid input
401 - Invalid credentials
500 - Internal server error
4. Get Current User

Returns the currently authenticated user.

Endpoint
GET /api/auth/me
Authentication

Required.

Headers
Authorization: Bearer <access-token>
Response
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
5. Logout

Logs the user out and invalidates the refresh token/session.

Endpoint
POST /api/auth/logout
Authentication

Required.

Response
{
  "success": true,
  "message": "Logout successful"
}
6. Projects
6.1 Create Project

Creates a new project for the authenticated user.

Endpoint
POST /api/projects
Authentication

Required.

Request
{
  "name": "E-Commerce API",
  "description": "Backend API for an e-commerce application"
}
Response
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "id": "uuid",
      "name": "E-Commerce API",
      "description": "Backend API for an e-commerce application"
    }
  }
}
7. Get All Projects

Returns all projects belonging to the authenticated user.

Endpoint
GET /api/projects
Authentication

Required.

Response
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "uuid",
        "name": "E-Commerce API",
        "description": "Backend API"
      },
      {
        "id": "uuid",
        "name": "Portfolio API",
        "description": "Portfolio backend"
      }
    ]
  }
}
8. Get Single Project

Returns details of a specific project.

Endpoint
GET /api/projects/:projectId
Authentication

Required.

Example
GET /api/projects/123
Response
{
  "success": true,
  "data": {
    "project": {
      "id": "uuid",
      "name": "E-Commerce API",
      "description": "Backend API"
    }
  }
}
Authorization

The authenticated user must own the project.

9. Update Project

Updates project information.

Endpoint
PATCH /api/projects/:projectId
Authentication

Required.

Request
{
  "name": "Updated E-Commerce API",
  "description": "Updated description"
}
Response
{
  "success": true,
  "message": "Project updated successfully",
  "data": {
    "project": {
      "id": "uuid",
      "name": "Updated E-Commerce API",
      "description": "Updated description"
    }
  }
}
10. Delete Project

Deletes a project owned by the authenticated user.

Endpoint
DELETE /api/projects/:projectId
Authentication

Required.

Response
{
  "success": true,
  "message": "Project deleted successfully"
}

Related submissions and reviews should be handled according to the database
cascade rules.

11. Code Submissions
11.1 Create Code Submission

Creates a new code submission for a project.

Endpoint
POST /api/projects/:projectId/submissions
Authentication

Required.

Request
{
  "code": "function add(a, b) { return a + b; }",
  "language": "javascript",
  "requirements": "Create a function that adds two numbers."
}
Response
{
  "success": true,
  "message": "Code submitted successfully",
  "data": {
    "submission": {
      "id": "uuid",
      "projectId": "uuid",
      "language": "javascript",
      "createdAt": "timestamp"
    }
  }
}
12. Get Project Submissions

Returns all submissions belonging to a project.

Endpoint
GET /api/projects/:projectId/submissions
Authentication

Required.

Response
{
  "success": true,
  "data": {
    "submissions": [
      {
        "id": "uuid",
        "language": "javascript",
        "createdAt": "timestamp"
      }
    ]
  }
}
13. Get Single Submission

Returns details of a specific submission.

Endpoint
GET /api/submissions/:submissionId
Authentication

Required.

Response
{
  "success": true,
  "data": {
    "submission": {
      "id": "uuid",
      "code": "function add(a, b) {}",
      "language": "javascript",
      "requirements": "Create an addition function"
    }
  }
}
14. Code Review
14.1 Start Code Review

Starts the review process for a code submission.

Endpoint
POST /api/submissions/:submissionId/reviews
Authentication

Required.

Request
{}

The backend retrieves the code, requirements and project information from
the database.

The review process then performs:

Static analysis
AI analysis
AI response validation
Score calculation
Issue generation
Database storage
Initial Response
{
  "success": true,
  "message": "Code review completed successfully",
  "data": {
    "reviewId": "uuid"
  }
}

The initial MVP may process the review synchronously.

The architecture should allow this endpoint to become asynchronous in the
future.

15. Get Review

Returns the complete review result.

Endpoint
GET /api/reviews/:reviewId
Authentication

Required.

Response
{
  "success": true,
  "data": {
    "review": {
      "id": "uuid",
      "status": "COMPLETED",
      "overallScore": 78,
      "qualityScore": 82,
      "securityScore": 70,
      "performanceScore": 75,
      "maintainabilityScore": 85,
      "requirementScore": 80,
      "category": "Backend",
      "summary": "The code is functional but can be improved.",
      "strengths": [
        "Simple structure",
        "Readable implementation"
      ],
      "weaknesses": [
        "Missing error handling"
      ],
      "recommendations": [
        "Add input validation",
        "Improve error handling"
      ]
    }
  }
}
16. Get Review Issues

Returns all issues detected during a review.

Endpoint
GET /api/reviews/:reviewId/issues
Authentication

Required.

Response
{
  "success": true,
  "data": {
    "issues": [
      {
        "id": "uuid",
        "type": "BUG",
        "severity": "HIGH",
        "title": "Potential null reference",
        "description": "The variable may be null.",
        "lineNumber": 15,
        "suggestion": "Validate the value before accessing it."
      }
    ]
  }
}
17. Get Project Review History

Returns review history for a project.

Endpoint
GET /api/projects/:projectId/reviews
Authentication

Required.

Response
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "submissionId": "uuid",
        "overallScore": 82,
        "status": "COMPLETED",
        "createdAt": "timestamp"
      },
      {
        "id": "uuid",
        "submissionId": "uuid",
        "overallScore": 71,
        "status": "COMPLETED",
        "createdAt": "timestamp"
      }
    ]
  }
}
18. API Authentication Matrix
Endpoint	Method	Authentication
/api/auth/register	POST	No
/api/auth/login	POST	No
/api/auth/me	GET	Yes
/api/auth/logout	POST	Yes
/api/projects	GET	Yes
/api/projects	POST	Yes
/api/projects/:id	GET	Yes
/api/projects/:id	PATCH	Yes
/api/projects/:id	DELETE	Yes
/api/projects/:id/submissions	GET	Yes
/api/projects/:id/submissions	POST	Yes
/api/submissions/:id	GET	Yes
/api/submissions/:id/reviews	POST	Yes
/api/reviews/:id	GET	Yes
/api/reviews/:id/issues	GET	Yes
/api/projects/:id/reviews	GET	Yes
19. Common HTTP Status Codes

The API will use standard HTTP status codes.

200 OK
201 Created
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests
500 Internal Server Error
502 Bad Gateway
20. Standard Success Response

Successful responses should follow a consistent structure.

{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
21. Standard Error Response

Error responses should follow a consistent structure.

{
  "success": false,
  "message": "Invalid request",
  "errors": []
}
22. Request Validation

All incoming requests will be validated before reaching the business logic.

Zod will be used for validation.

Example:

HTTP Request
     |
     v
Authentication
     |
     v
Validation
     |
     +---- Invalid ----> 400
     |
     v
Controller
     |
     v
Service

Validation will check:

Required fields
Data types
String lengths
Supported languages
Code size
Requirement size
UUID formats
23. Authorization

Authentication and authorization are separate concerns.

Authentication answers:

"Who is this user?"

Authorization answers:

"Is this user allowed to access this resource?"

For example:

User A
 |
 +---- Project A     ✓ Allowed
 |
 +---- Project B     ✗ Forbidden

The backend must verify ownership before returning or modifying protected
resources.

24. Rate Limiting

Review generation APIs should be rate limited because they call an external
LLM service.

The primary endpoint requiring rate limiting is:

POST /api/submissions/:submissionId/reviews

If the limit is exceeded:

429 Too Many Requests
25. Future API Extensions

Future versions may add:

POST /api/github/connect
GET  /api/github/repositories
GET  /api/github/repositories/:id/files
POST /api/repositories/:id/review
POST /api/pull-requests/:id/review

These endpoints will support GitHub repository and pull-request analysis.

26. API Design Principles

The API should follow these principles:

RESTful resource naming
Proper HTTP methods
Consistent response format
Consistent error format
JWT authentication
Resource ownership validation
Input validation
Rate limiting
Separation of controllers and services
No direct database access from routes