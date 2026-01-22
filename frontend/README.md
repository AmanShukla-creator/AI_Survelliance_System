# AI Surveillance System - Frontend

This is the frontend for the AI Surveillance System, built with React and Vite.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/your-repository.git
    cd your-repository/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env` file in the `frontend` directory by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Then, open the `.env` file and add your Firebase project configuration:

    ```
    VITE_FIREBASE_API_KEY=your_api_key
    VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
    VITE_FIREBASE_PROJECT_ID=your_project_id
    VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    VITE_FIREBASE_APP_ID=your_app_id
    VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

## Troubleshooting

For a summary of the changes made to fix the initial setup issues, please refer to the `troubleshooting.md` file in this directory.