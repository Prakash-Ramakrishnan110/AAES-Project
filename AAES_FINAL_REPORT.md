# Advanced Academic Evaluation System (AAES)
## A PROJECT REPORT

**Submitted by**
**PRAKASH R (732721104036)**
**NAVANEETHA C (732721104043)**

**In partial fulfillment for the award of the degree of**
**BACHELOR OF ENGINEERING**
**IN**
**COMPUTER SCIENCE AND ENGINEERING**

**SHANMUGHA COLLEGE OF ENGINEERING AND TECHNOLOGY**
**THIRUMALAYAMPALAYAM, COIMBATORE - 641 105**
**ANNA UNIVERSITY: CHENNAI 600 025**

---

## TABLE OF CONTENTS

- [ABSTRACT](#abstract)
- [1. INTRODUCTION](#1-introduction)
  - [1.1 OBJECTIVE](#11-objective)
  - [1.2 AIM](#12-aim)
- [2. LITERATURE SURVEY](#2-literature-survey)
- [3. SYSTEM STUDY](#3-system-study)
  - [3.1 EXISTING SYSTEM](#31-existing-system)
  - [3.2 DISADVANTAGES](#32-disadvantages)
  - [3.3 PROPOSED SYSTEM](#34-proposed-system)
  - [3.4 ADVANTAGES](#35-advantages)
- [4. METHODOLOGY](#4-methodology)
- [5. SYSTEM DESIGN](#5-system-design)
  - [5.1 BLOCK DIAGRAM](#54-block-diagram)
  - [5.2 ACTIVITY DIAGRAMS](#55-activity-diagram)
- [6. IMPLEMENTATION](#6-implementation)
  - [6.1 IMPLEMENTATION DETAILS](#62-implementation-details)
- [7. CONCLUSION](#8-conclusion)
- [8. APPENDIX - SCREENSHOTS](#b-screenshots)

---

## ABSTRACT

The rapid advancement of educational technology has catalyzed the need for intelligent systems to manage and evaluate student academic progress. Modern educational institutions handle a massive volume of assignments, encompassing both written theory and practical programming tasks. Manual evaluation is time-consuming and prone to human bias. To bridge this critical gap, this project proposes the Advanced Academic Evaluation System (AAES), a platform designed to revolutionize the evaluation process in higher education and large learning institutions. 

AAES leverages Artificial Intelligence (AI) and Optical Character Recognition (OCR) to evaluate handwritten and textual answers. In the realm of computer science, it incorporates an auto-grading module for multiple programming languages (C, Java, Python). Coupled with Performance Analytics Dashboards for Students, Faculty, HODs, and Administrators, AAES identifying "at-risk" students, and facilitating data-driven pedagogical decisions.

---

## 1. INTRODUCTION

Education in the 21st century revolves increasingly around timely feedback and robust competency mapping. The Advanced Academic Evaluation System (AAES) overhaul this paradigm entirely. Utilizing a sophisticated React front-end coupled with a Node.js backend, our system provides an ecosystem where assignment rollout, submission, automated checking, and detailed analytical reporting are centralized. 

### 1.1 OBJECTIVE
1. **Automated Descriptive Grading**: Match semantic meaning using advanced Language Models.
2. **Handwriting Analysis**: OCR integration for student uploaded answer sheets.
3. **Programming Assessment**: In-browser IDE for multi-language code compilation with hidden unit testing.
4. **Data Analytics**: Personalized dashboards for identifying student risk tiers.

### 1.2 AIM
The core aim is to design an interoperable, secure, and cloud-ready educational platform that eliminates manual grading overheads. By shifting from a human-dependent evaluation process to an AI-assisted framework, we aim to ensure zero bias and provide instantaneous feedback.

---

## 2. LITERATURE SURVEY

The foundation of AAES builds on advanced research in AI in Education (AIEd) and Learning Analytics:
1. **Automated Essay Scoring (AES)**: Transformer-based NLP models (BERT, GPT variants) for semantic understanding.
2. **OCR in Education**: Cloud-trained ML APIs for diverse and unstructured academic handwritings.
3. **Auto-Grading Programming**: Containerized auto-graders for safe execution of student code against timed test cases.
4. **Learning Analytics Dashboards (LAD)**: Visual indicators for pro-active behavioral correction in students.

---

## 3. SYSTEM STUDY

### 3.1 EXISTING SYSTEM
Presently, most institutions rely on fragmented software modules. The typical flow involves manual distribution, manual writing on paper, and manual evaluation by faculty downloading individual files.

### 3.2 DISADVANTAGES OF EXISTING SYSTEM
- **Excessive Time Consumption**: Faculty require days to evaluate a single class.
- **Grader Bias and Fatigue**: Subjective bias and inconsistencies in marking.
- **Lack of Analytics**: No real-time tracking of student progress curves.

### 3.3 PROPOSED SYSTEM
The Proposed AAES serves as a unified SaaS-like educational portal including:
- **For Descriptive Assignments**: AI semantic similarity evaluation against faculty rubrics.
- **For Programming Assignments**: Monaco IDE with sandboxed execution environments.
- **For Administration**: Centralized HOD/Principal dashboards for macroscopic institutional monitoring.

### 3.4 ADVANTAGES OF PROPOSED SYSTEM
- **Hyper-Efficiency**: Assignments evaluated in seconds.
- **Absolute Objectivity**: Zero emotional bias in marks distribution.
- **Continuous Macro Monitoring**: Institutional health dashboards for leadership.

---

## 4. METHODOLOGY

We adopted the **Agile Iterative Methodology** alongside a **Microservice-oriented Architecture**. Development was divided into distinct epics:
* **Sprint 1**: Core Authentication & JWT security.
* **Sprint 2**: Programming IDE & Code Execution.
* **Sprint 3**: OCR & Large Language Model prompt-engineering.
* **Sprint 4**: Advanced Administration Dashboards & Audit Logs.

---

## 5. SYSTEM DESIGN

### 5.1 BLOCK DIAGRAM
The system follows a Model-View-Controller (MVC) and RESTful API design leveraging the MERN stack for maximum responsiveness.

### 5.2 ACTIVITY DIAGRAMS
The system defines clear workflows for Students (Submission/Review), Faculty (Creation/Evaluation), and Admin (Governance/Auditing).

---

## 6. IMPLEMENTATION

### 6.1 IMPLEMENTATION DETAILS
1. **User Authentication**: Secure encryption using bcrypt and JWT-based session management.
2. **Theory Evaluation Engine**: Hybrid AI-Human model utilizing Gemini API for semantic comparison.
3. **Python Auto-Grading Engine**: Sandboxed execution against hidden test cases with timeout enforcement.
4. **Analytics Pipeline**: MongoDB aggregation pipelines feeding real-time Recharts dashboards.

---

## 7. CONCLUSION

The Advanced Academic Evaluation System (AAES) represents a paradigm-shifting leap over traditional academic tracking. By marrying NLP, OCR, and secure code-sandboxing with intuitive analytics, the project fundamentally solves the bottleneck of manual evaluation, liberating educators and guaranteeing timely feedback for students.

---

## 8. APPENDIX - SCREENSHOTS

**Fig.No:B.1 HOME PAGE / DASHBOARD**
**Fig.No:B.2 LOGIN & AUTHENTICATION**
**Fig.No:B.3 ASSIGNMENT SUBMISSION (IDE)**
**Fig.No:B.4 AI EVALUATION RESULT**
**Fig.No:B.5 ADMIN MONITORING PORTAL**
**Fig.No:B.6 AUDIT LOGS & GOVERNANCE**
