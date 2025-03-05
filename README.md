# Real Estate Dashboard

This project is a Real Estate Dashboard that displays property listings and real estate news. It fetches data from various sources and presents it in a user-friendly interface.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [File Structure](#file-structure)
- [Contributing](#contributing)
- [License](#license)

## Features

- Display property listings from multiple sources (Housing.com, MagicBricks).
- Show featured properties and latest properties.
- Display real estate news articles.
- Cache property data to reduce API calls.
- Multilingual support for chatbot interactions.


### Backend

1. Navigate to the `backend` directory:
   ```sh
   cd backend
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the backend directory and add the necessary environment variables.

4. Start the backend server:
   ```sh
   npm start
   ```

### Frontend

1. Navigate to the frontend directory:
   ```sh
   cd frontend
   ```

2. Install the dependencies:
   ```sh
   npm install
   ```

3. Start the frontend development server:
   ```sh
   npm start
   ```

## Usage

- Open your browser and navigate to `http://localhost:3000` to view the Real Estate Dashboard.
- Use the navigation links to view all properties or interact with the chatbot.


### Backend

- `GET /api/properties`: Fetch property listings based on search parameters.
- `POST /chatbot`: Interact with the multilingual chatbot.

### Frontend

- `getProperties(filters)`: Fetch properties based on filters.
- `getRealEstateNews(count)`: Fetch real estate news articles.

## File Structure

```
backend/
	.env
	.gitignore
	apifyService.js
	db.js
	middleware/
		auth.js
	models/
		Client.js
		User.js
	package.json
	routes/
		auth.js
		clients.js
	server.js
	uploads/
		4319833366dfcac57eda7aeef74003de
		915310a281039405710e722d8381665e
frontend/
	.gitignore
	package.json
	public/
		favicon.ico
		image.png
		index.html
		logo192.png
		logo512.png
		manifest.json
		robots.txt
	src/
		App.css
		App.js
		components/
		constants/
		context/
		index.css
		index.js
		services/
README.md
```

#### Backend

- `server.js`: Sets up the Express server, middleware, and routes.
- `db.js`: Configures and connects to the database.
- `routes/auth.js`: Handles authentication-related routes.
- `routes/clients.js`: Handles client-related routes.
- `models/User.js`: Defines the User model schema.
- `models/Client.js`: Defines the Client model schema.
- `middleware/auth.js`: Middleware for verifying authentication tokens.

#### Frontend

- `App.js`: Main component that sets up routing and renders other components.
- `Dashboard.js`: Displays real estate properties and news.
- `api.js`: Contains functions for making API calls to fetch properties and news.
- `Login.js`: Handles user login.
- `Register.js`: Handles user registration.
- `SpeechToText.js`: Handles speech-to-text functionality using AssemblyAI.
