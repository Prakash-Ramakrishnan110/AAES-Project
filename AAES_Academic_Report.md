# AAES: Intelligent Hybrid Assignment Evaluation & Department Monitoring Platform

## TABLE OF CONTENTS
1. [INTRODUCTION](#1-introduction)
   - 1.1 [Objective](#11-objective)
   - 1.2 [Aim](#12-aim)
2. [LITERATURE SURVEY](#2-literature-survey)
3. [SYSTEM STUDY](#3-system-study)
   - 3.1 [Existing System](#31-existing-system)
   - 3.2 [Problem Statement](#32-problem-statement)
   - 3.3 [Proposed System](#33-proposed-system)
4. [METHODOLOGY](#4-methodology)
   - 4.1 [Existing Methods](#41-existing-methods)
   - 4.2 [Proposed Methods](#42-proposed-methods)
5. [SYSTEM DESIGN](#5-system-design)
   - 5.1 [Input Design](#51-input-design)
   - 5.2 [Output Design](#52-output-design)
   - 5.3 [Block Diagram](#53-block-diagram)
   - 5.4 [Data Flow Diagram (Work Flow)](#54-data-flow-diagram-work-flow)
6. [IMPLEMENTATION](#6-implementation)
   - 6.1 [Modules](#61-modules)
   - 6.2 [Modules Description](#62-modules-description)
7. [CONCLUSION](#7-conclusion)
8. [SCOPE OF FUTURE ENHANCEMENT](#8-scope-of-future-enhancement)
9. [REFERENCES](#9-references)
10. [APPENDIX](#10-appendix)

---

## LIST OF FIGURES
1.  **Figure 5.1** — System Architecture Block Diagram
2.  **Figure 5.2** — Evaluation Flow Diagram (Workflow)
3.  **Figure 5.3** — Python Sandboxed Auto-grading Flow
4.  **Figure 6.1** — Role-Based Access Control Matrix

---

## LIST OF TABLES
1.  **Table 3.1** — Comparison of Existing System vs. Proposed System
2.  **Table 6.1** — Hardware Configuration Requirements
3.  **Table 6.2** — Software Configuration Requirements

---

## LIST OF ABBREVIATIONS
- **AAES**: AI-Powered Academic Evaluation System
- **AI**: Artificial Intelligence
- **RBAC**: Role-Based Access Control
- **HOD**: Head of Department
- **OCR**: Optical Character Recognition
- **LLM**: Large Language Model
- **JWT**: JSON Web Token
- **API**: Application Programming Interface

---

## 1. INTRODUCTION

The rapid digitization of academic institutions demands efficient, automated, and unbiased mechanisms for evaluating student performances. The **AI-Powered Academic Evaluation System (AAES)** is a full-stack, secure, AI-driven platform designed to automate both theoretical assignment assessment and practical programming grading while providing real-time, department-level academic intelligence. 

### 1.1 Objective
The primary objective of this project is to develop a centralized academic evaluation platform that leverages Artificial Intelligence (AI) to automate assignment grading, reduce faculty workload, enforce strict Role-Based Access Control (RBAC), and generate comprehensive analytical dashboards for institutional governance.

### 1.2 Aim
To design and deploy a highly scalable, secure hybrid evaluation engine capable of processing handwritten documents via Optical Character Recognition (OCR), evaluating programming submissions via secure sandboxing, and maintaining historical academic records across semesters and academic years without data loss.

---

## 2. LITERATURE SURVEY

Traditional academic evaluation relies heavily on manual processing, which is time-consuming, prone to human error, and biased. 
- Studies on **Auto-Grading Systems** demonstrate that automated assessment tools (like HackerRank or Leetcode implementations) significantly decrease grading time for technical subjects but historically lack the capacity to evaluate subjective theoretical answers.
- Recent advancements in **Optical Character Recognition (OCR)** (such as Tesseract) and **Large Language Models (LLMs)** have opened pathways for evaluating unstructured, handwritten data.
- Literature on **Role-Based Academic Governance** dictates that modern Educational ERP sets require strict modular boundaries between Administrators, Department Heads, Teaching Staff, and Students to ensure data integrity and privacy.

AAES consolidates these three domains—Auto-grading logic, LLM-based subjective evaluation, and strict RBAC governance—into a single, hybrid platform.

---

## 3. SYSTEM STUDY

### 3.1 Existing System
In the existing ecosystem of most universities, assignments are evaluated manually. Faculty members collect physical papers, handwritten PDFs, or code files and grade them individually. The administrative tracking of average scores, pass percentages, and subject-level performance is done disjointedly using spreadsheets.
*   **Drawbacks of Existing Systems:**
    *   **Time-Intensive:** Manual reading of lengthy theoretical papers or testing individual code scripts is extremely inefficient.
    *   **Inconsistency:** Variations in grading rubrics between different faculty members lead to subjective bias.
    *   **Lack of Analytics:** HODs and Admins lack a unified overview of real-time department performance.
    *   **Data Fragmentation:** Academic records across different semesters are rarely stored dynamically in an accessible queryable format.

### 3.2 Problem Statement
*"To architect a secure, centralized academic platform that automates subjective and programming evaluation while providing hierarchical, real-time academic analytics for staff, HODs, and administrators without overwriting historical data."*

### 3.3 Proposed System
The proposed AAES platform overcomes these limitations by integrating a **Hybrid AI-Human Evaluation Engine**. 
*   **Key Advantages of the Proposed System:**
    *   Provides specialized evaluation pipelines: LLM-based text/OCR grading for theory, and isolated test-case sandbox execution for Python code.
    *   Implements role isolation (Admin, HOD, Staff, Student) across a unified database.
    *   Generates real-time, detailed analytical dashboards (Pass rates, average scores, class comparisons).
    *   Equips staff with final override capabilities to ensure fairness ("Hybrid" model).
    *   Supports semester transitions organically—archiving previous metrics rather than deleting them.
---

## 4. METHODOLOGY

### 4.1 Existing Methods
Faculty individually analyze submissions. Technical students submit ZIP files of their source code for which faculty sets up isolated environments to run and compile their scripts manually. If errors occur, debugging is at the discretion of the evaluator.

### 4.2 Proposed Methods
1.  **Strict Isolation Architecture** � React frontend is decoupled from the Node.js API and Python execution environment.
2.  **Continuous Monitoring** � HODs receive aggregated metrics through automated Mongo aggregation queries.
3.  **Hybrid Review Logic** � AI conducts initial passes. If staff disagree, they input an override grade.

---

## 5. SYSTEM DESIGN

### 5.1 Input Design
Users log in using JSON Web Token (JWT) secured endpoints. They input configuration criteria, files (PDFs/DOCs/Images), Python Code, or numerical grading overrides. Security mechanisms enforce parameter sanitization.

### 5.2 Output Design
Outputs include numerical grades, categorical feedback (Strengths, Weaknesses, Improvements), AI confidence percentages, visual dashboard charts, and detailed error logs for programming tasks.

### 5.3 Block Diagram
The following block diagram outlines the primary architectural components of AAES:

`mermaid
graph TD
    A[Client UI - React.js/Tailwind] -->|HTTPS REST| B(Node.js / Express Backend)
    B --> C[(MongoDB - Database)]
    B -->|File / Code Payload| D{{Python Evaluation Service}}
    
    subgraph Python AI Engine
        D -->|Images/PDFs| E[Tesseract OCR]
        D -->|Extracted Text| F[Local LLM - Ollama]
        D -->|Python Scripts| G[Sandboxed OS Execution]
    end
    
    F -->|JSON Grading Feedback| D
    G -->|Test Case Results| D
    D -->|Evaluation Packet| B
    B -->|Processed Dashboard Analytics| A
`

### 5.4 Data Flow Diagram (Work Flow)
This diagram illustrates the flow of data during a theory assignment evaluation:

`mermaid
sequenceDiagram
    participant Student
    participant React UI
    participant Node.js Backend
    participant Python Setup
    participant AI Model Engine

    Student->>React UI: Submits Assignment (PDF/Text)
    React UI->>Node.js Backend: POST /api/submissions
    Node.js Backend->>Node.js Backend: Validates JWT & Eligibility
    Node.js Backend->>Python Setup: POST /evaluate/question (Form Data: Text + Keywords)
    Python Setup->>AI Model Engine: Prompt (Keyword Verification + Grading Logic)
    AI Model Engine-->>Python Setup: Structured JSON (Score + Feedback)
    Python Setup-->>Node.js Backend: Parsed Results
    Node.js Backend->>Node.js Backend: Updates MongoDB Submission Record
    Node.js Backend-->>React UI: Returns Success Status
    React UI-->>Student: Displays 'Graded' Status
`

---
## 6. IMPLEMENTATION

### 6.1 Modules
1.  **Authentication & Security Module**
    *   Ensures JWT-based payload delivery. Re-authenticates state asynchronously. Roles strictly dictating view layers.
2.  **Assignment & Dashboard Management Module**
    *   Connects Mongoose collections for rapid aggregated data (e.g., Average HOD Marks) parsing via structured grouping. Semester archiving ensures no historical cross-pollution.
3.  **AI Hybrid Theory Evaluation Engine**
    *   Ingests student answers. Uses Tesseract OCR (if Image/PDF), then pings Ollama running a gemma3:1b structured prompt for Keyword tracking, scoring, and textual justifications.
4.  **Python Auto-Grading Execution Engine**
    *   Isolates raw code logic inside sandboxed terminal calls, piping standard error and standard out to confirm array of test cases.

### 6.2 Modules Description
The development of AAES utilizes the **MERN Stack combined with Python/FastAPI**.
*   **MongoDB**: Stores hierarchical records (Users -> Departments -> Subjects -> Assignments -> Submissions).
*   **Express.js/Node.js**: The central nervous system handling all REST routing, request validation, Multer file parsing, and business logic linking.
*   **React.js / Tailwind CSS / Framer Motion**: Provides a fluid, real-time, aesthetically rich user interface optimized for diverse device form factors. Includes dynamic, concurrent rendering of AI progress steps.
*   **Python/FastAPI**: Serves strictly as the computational evaluation endpoint to keep heavy AI processing independent from Node's asynchronous event loop.

---

## 7. CONCLUSION
The **AI-Powered Academic Evaluation System (AAES)** successfully establishes a modern, institution-ready governance platform. By transitioning subjective grading from entirely manual to an AI-assisted hybrid approach, faculty can drastically reduce grading turnaround times while maintaining final editorial control. The system�s strict hierarchical tracking via the Admin and HOD dashboards ensures long-term transparent accountability and analytical clarity for department metrics, proving its viability for broader institutional deployment.

---

## 8. SCOPE OF FUTURE ENHANCEMENT
1.  **Cloud Native Scaling:** Containerizing the Node and Python engines using Docker/Kubernetes for infinite auto-scaling during high-traffic exam weeks.
2.  **Plagiarism Detection Engine:** Adding Cosine-Similarity NLP checks to flag potential cheating between student submissions.
3.  **Advanced Diagram Evaluation:** Expanding OCR logic to evaluate specific hand-drawn architectural or mathematical diagrams.
4.  **Direct App Store Publishing:** Utilizing the established Capacitor codebase configuration to launch AAES in Native App Stores for mobile push-notification support.

---

## 9. REFERENCES
1.  FastAPI Documentation: https://fastapi.tiangolo.com/
2.  Mongoose Semantic Documentation: https://mongoosejs.com/
3.  Tesseract OCR Engine Data: https://github.com/tesseract-ocr/tesseract
4.  React Framer Motion UI Patterns: https://www.framer.com/motion/

---

## 10. APPENDIX
The source code for AAES is organized into two primary microservices (ackend and python_service) communicating seamlessly alongside a statically built rontend SPA via REST configurations. Full local execution parameters can be replicated via the provided start-all.bat execution manifest.
