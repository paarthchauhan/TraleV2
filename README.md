# Trale - A Social Media Application

## Overview

Trale is a social media application built with the MERN stack (MongoDB, Express, React, Node.js). The application aims to provide a seamless and interactive platform for users to connect, share, and engage with each other.

## Features

- User Authentication (Login & Signup)
- Profile Management
- Search Functionality
- Post Creation, Update, Delete and Feed
- Responsive Design
- Light and Dark Modes
- Generative Captions using AI

## Tech Stack

- **Frontend**: React, Redux, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **GenAI**: Gemini API

## Installation

### Prerequisites

- Node.js (v14 or later)
- MongoDB (local or Atlas)

### Backend Setup

1. Clone the repository:

    ```sh
    git clone https://github.com/tijilparakh04/trale.git
    cd trale
    ```

2. Navigate to the server directory and install dependencies:

    ```sh
    cd server
    npm install
    ```

3. Create a `.env` file in the `server` directory and add the following environment variables:

    ```sh
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```

4. Start the backend server:

    ```sh
    npm start
    ```

### Frontend Setup

1. Navigate to the client directory and install dependencies.

    ```sh
    cd client
    npm install
    ```

2. Start the frontend development server:

    ```sh
    npm start
    ```

## Usage

1. Open your browser and navigate to http://localhost:3000.
2. Sign up for a new account or log in with an existing one.
3. Explore the features such as creating posts, messaging, and more.

## Folder Structure

```sh
trale/
├── client/             # Frontend application
│   ├── public/
│   └── src/
│       ├── assets/     # Images and static assets
│       ├── components/ # Reusable components
│       ├── pages/      # Pages and views
│       ├── redux/      # Redux setup
│       ├── utils/
│       └── App.js
├── server/             # Backend application
│   ├── controllers/    # Route controllers
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── utils/          # Utility functions
│   └── index.js       # Entry point
└── README.md
