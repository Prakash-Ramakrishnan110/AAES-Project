# AAES – AI-Powered Academic Evaluation System
## “Intelligent Hybrid Assignment Evaluation & Department Monitoring Platform”

### 1. Project Objective

AAES aims to develop a full-stack, secure, AI-driven academic evaluation platform designed to automate assignment assessment, streamline programming auto-grading, and provide real-time department-level academic intelligence.

The system is engineered to manage multiple departments, support semester transitions with historical preservation, enable hybrid AI-human evaluation, and offer structured analytics for academic governance. The platform is designed for institutional deployment and future SaaS scalability.

### 2. System Overview

AAES functions as a centralized academic intelligence system built on strict role-based access control (RBAC). It supports four primary user roles:

- **Admin** – System governance and configuration control
- **HOD** – Department-level academic monitoring and analytics
- **Staff** – Academic management, assignment creation, and evaluation
- **Student** – Assignment submission and performance tracking

The architecture ensures:
- Strict role isolation
- Historical data preservation
- Academic year and semester versioning
- Secure evaluation workflows
- Modular service separation

The system maintains academic continuity across semesters without overwriting prior data.

### 3. Authentication & Authorization

AAES implements secure authentication using encrypted password storage and token-based authorization mechanisms.

**Key Security Controls:**
- Password hashing using secure encryption
- JWT-based session management
- Role-Based Access Control (RBAC) for all APIs
- Department and academic-year contextual mapping
- Protected backend routes with middleware validation

Each user is mapped to:
- Department
- Role
- Academic Year
- Semester (for students)

Unauthorized access attempts must be blocked at both API and frontend levels.

### 4. Major Functional Modules

#### 4.1 Department & User Management (Admin Module)

The Admin role provides centralized governance capabilities.

**Features:**
- Create and manage multiple departments
- Assign HOD to departments
- Add and manage Staff and Students
- Bulk student creation support
- Semester promotion mechanism
- Academic year configuration

**Semester Transition Mechanism:**
- Students are promoted without overwriting historical records.
- Previous semester subjects, assignments, and marks remain archived and accessible.
- Academic versioning ensures full auditability.

#### 4.2 Subject Management

Subjects are mapped using three primary dimensions:
- Department
- Semester
- Academic Year

Even if the subject name is identical across departments, separate entries must be maintained to preserve structural integrity.

**Staff Assignment:**
- Many-to-many mapping supported
- Cross-department teaching supported
- Referential integrity must be enforced at database level

#### 4.3 Assignment Module

Staff can create assignments under their mapped subjects.

**Each assignment includes:**
- Title
- Description
- Maximum Marks
- Deadline
- Assignment Type (Theory / Python Programming)
- AI Evaluation Enable Option
- Optional Model Answer
- Semester & Academic Year mapping

Assignments must only be visible to students mapped to that subject.
Late submission control and status tracking must be enforced.

#### 4.4 Theory Evaluation Engine (Hybrid AI-Human Model)

AAES supports a dual-mode AI evaluation system.

**Input Types:**
- PDF documents
- DOC files
- Handwritten images

**Processing Pipeline:**
- OCR extraction (for images)
- Text normalization and cleaning
- AI evaluation using local LLM

**Dual Evaluation Modes:**
1. **Model-Answer Comparison Mode**
   - Compares student answer with faculty-provided model answer
   - Detects missing conceptual elements
   - Generates structured feedback

2. **Rubric-Based Evaluation Mode**
   - Evaluates based on:
     - Concept clarity
     - Technical depth
     - Completeness
     - Structure and coherence

**AI Output:**
- Preliminary Score
- Strengths
- Weaknesses
- Improvement Suggestions

Staff may override AI-generated marks to ensure fairness and academic control.
Students can only view final approved marks.

#### 4.5 Python Auto-Grading Engine

The Python evaluation engine enables structured programming assessment.

**Input:**
- Student-submitted Python code

**Execution Process:**
- Sandboxed environment execution
- CPU and memory restriction
- Timeout enforcement
- No system or file access
- Test case-based evaluation

**Evaluation Logic:**
- Execute code against predefined test cases
- Capture standard output
- Compare with expected output
- Award marks based on successful test cases

**Security Controls:**
- Restricted execution context
- Infinite loop prevention
- System command restriction
- Execution logs stored for audit

Staff can override automated marks when necessary.

#### 4.6 Analytics & Dashboards

AAES includes real-time analytical dashboards tailored to each role.

**HOD Dashboard:**
- Total Students
- Total Staff
- Subject Distribution
- Average Department Score
- Pass Percentage
- Semester Trend Analysis
- Staff Performance Comparison

**Staff Dashboard:**
- Subject-wise performance summary
- Assignment status tracking
- Evaluation overview

**Student Dashboard:**
- Subject enrollment overview
- Assignment submission history
- Performance summary
- Feedback tracking

All analytics must support filtering by semester and academic year.

### 5. Security Requirements

AAES must enforce:
- Strict role-based isolation
- Secure file upload validation
- Controlled Python execution environment
- SQL injection prevention
- Parameterized database queries
- API-level request validation
- Error logging and audit tracking
- Protection against unauthorized data exposure

Students must never access other students’ data.

### 6. Architecture Requirements

The system must follow a modular architecture including:
- Authentication Service
- Academic Management Service
- AI Evaluation Engine
- OCR Processing Module
- Programming Execution Engine
- Analytics Processing Layer

Each component must be independently maintainable and scalable.
Referential integrity across departments, users, subjects, assignments, and submissions must be strictly enforced.
Concurrency handling must support simultaneous submissions without performance degradation.

### 7. Final Expected Outcome

AAES must operate as a structured, scalable academic intelligence platform that transforms traditional manual evaluation into a hybrid AI-human academic governance system.

The system must:
- Manage multiple departments
- Preserve historical academic data
- Support semester transitions
- Perform AI-assisted theory evaluation
- Execute secure programming auto-grading
- Provide real-time department monitoring
- Enable faculty oversight and transparency

The final implementation must be demo-ready, academically defensible in viva, institutionally deployable, and architecturally scalable for future SaaS expansion.
