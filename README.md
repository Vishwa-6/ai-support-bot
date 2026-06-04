# SupportNest – Business AI Support Platform

## Overview

SupportNest is a Micro-SaaS AI-powered customer support platform designed to help businesses automate customer interactions using their own business knowledge.

Many small and medium-sized businesses struggle to provide instant responses to customer questions due to limited support staff, high operational costs, and increasing customer expectations for 24/7 availability.

SupportNest solves this problem by allowing businesses to create their own AI-powered chatbot that can answer customer queries based on business-specific information. Each business receives a unique chatbot link and QR code that customers can access instantly from mobile devices.

---

## Why This Project?

Customer support is one of the most resource-intensive functions for businesses.

According to industry research:

* Over 60% of customers expect immediate responses from businesses.
* Many small businesses cannot afford dedicated support teams operating around the clock.
* Repetitive questions such as pricing, services, working hours, policies, and product information consume a large portion of support resources.
* Delayed responses often lead to customer dissatisfaction and lost business opportunities.

SupportNest was built to address these challenges by providing businesses with an easy-to-deploy AI support solution without requiring technical expertise.

---

## Problem Statement

Businesses frequently face:

* Repeated customer questions
* Delayed response times
* Limited support availability
* High customer service workload
* Difficulty scaling support operations

Customers often leave websites or abandon purchases when answers are not available immediately.

---

## Solution

SupportNest enables businesses to:

* Create an account and onboard quickly
* Upload business-specific knowledge
* Generate a unique AI chatbot
* Share chatbot access using URLs and QR codes
* Provide customers with instant AI-powered responses
* Maintain conversation history and chat logs
* Reduce repetitive support workload

The platform transforms static business information into an intelligent conversational assistant.

---

## How It Works

1. Business registers on SupportNest
2. Business uploads knowledge and information
3. Platform processes and stores business data
4. Unique chatbot URL and QR code are generated
5. Customers scan the QR code or open the chatbot link
6. AI responds using the business knowledge base
7. Business owners can review chat logs and customer interactions

---

## Who Benefits?

### Small Businesses

* Retail stores
* Local shops
* Restaurants
* Clinics
* Service providers
* Educational institutes

### Customers

* Receive instant answers
* No waiting for support representatives
* Access information 24/7

### Business Owners

* Reduce support workload
* Improve customer satisfaction
* Scale customer support efficiently
* Gain insights from customer conversations

---

## Key Features

### Business Knowledge Base

Businesses can upload and manage information that powers AI responses.

### AI-Powered Customer Support

Customers receive intelligent responses based on business-specific data.

### QR Code Sharing

Each business gets a dedicated QR code for easy customer access.

### Dynamic Chatbot Links

Unique chatbot URLs are generated for every business.

### Customer Conversation Logs

Businesses can review and analyze customer interactions.

### Secure Authentication

Protected login and registration system with JWT authentication.

### Multi-Tenant Architecture

Each business operates independently with its own data and chatbot experience.

---

## Micro-SaaS Concept

SupportNest is designed as a Micro-SaaS product.

A Micro-SaaS is a focused software business that solves a specific problem for a targeted audience.

Instead of building a large enterprise platform, SupportNest focuses on one important challenge:

**Helping businesses automate customer support using AI.**

The platform is lightweight, scalable, and suitable for businesses that want an affordable AI support solution without investing in large customer service teams.

---

### Real-World Impact

SupportNest helps businesses:

* Provide support 24/7
* Reduce repetitive customer queries
* Improve response times
* Enhance customer experience
* Scale support operations without increasing manpower

By transforming business knowledge into an AI-powered assistant, SupportNest enables businesses to serve more customers while reducing operational overhead.

---


## Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose

### AI Integration

* Google Gemini API

### Deployment

* Vercel
* Render


## Getting Started

### Local Setup

```bash
# Clone repository
git clone 
cd ai-support-bot

# Frontend
cd client
npm install
npm run dev

# Backend (new terminal)
cd server
npm install
npm run dev
```

### Environment Variables

**server/.env:**

PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-key
CLIENT_URL=http://localhost:5173

**client/.env:**

VITE_API_URL=http://localhost:5000
VITE_APP_URL=http://localhost:5173

## Deployment

- **Frontend:** https://vercel.com
- **Backend:** https://render.com
- **Database:** https://mongodb.com/cloud

## Future Enhancements

* Vector Database Integration
* Semantic Search
* Analytics Dashboard
* Business Branding Customization
* Multi-Language Support
* AI Performance Metrics
* Customer Feedback System
* WhatsApp Integration
* Website Widget Embedding

---

## Project Status

Current Version: MVP (Minimum Viable Product)

SupportNest is a functional Micro-SaaS platform that demonstrates how AI can be leveraged to automate customer support for businesses through knowledge-driven conversational experiences.

---

## Author

Developed by Vishwa

Business AI Support Platform | Micro-SaaS Project

## License

MIT
