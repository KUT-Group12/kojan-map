# GEMINI.md: Project Overview for kojan-map

This document provides a comprehensive overview of the `kojan-map` project, intended as a guide for AI-assisted development.

## 1. Project Overview

`kojan-map` (こじゃんとやまっぷ) is a full-stack, regional Social Networking Service (SNS). It's structured as a monorepo with a containerized architecture, making it easy to set up and run.

### Architecture

- **Monorepo Structure**: The project is organized into two main directories:
  - `backend/`: A Go-based API server.
  - `frontend/`: A React and TypeScript client application.
- **Containerization**: The entire application stack (backend, frontend, database) is managed by Docker and defined in the `compose.yaml` file.

### Technology Stack

- **Backend**:
  - **Language**: Go
  - **Framework**: Gin for routing and HTTP handling.
  - **Database**: MySQL, with GORM used as the ORM.
  - **Authentication**: JWT-based authentication, including Google OAuth2 for user registration.
  - **Dependencies**: Managed with Go Modules (`go.mod`).

- **Frontend**:
  - **Language**: TypeScript
  - **Framework/Library**: React, built with Vite.
  - **UI Components**: Primarily uses [Radix UI](https://www.radix-ui.com/) and is styled with what appears to be a utility-class CSS approach (likely Tailwind CSS, given `clsx` and `tailwind-merge`).
  - **Mapping**: Implemented using `react-leaflet`.
  - **API Communication**: `axios` is used for making HTTP requests to the backend.
  - **Dependencies**: Managed with `npm` (`package.json`).

- **Services**:
  - **`backend`**: The Go API server, accessible on `http://localhost:8080`.
  - **`frontend`**: The React application, served by Vite on `http://localhost:5173`.
  - **`db`**: A MySQL database instance.

## 2. Building and Running

The project is designed to be run with Docker, simplifying the setup process.

### Primary Method (Docker)

- **Run all services**:
  ```bash
  # Build images and start all containers (backend, frontend, db)
  docker compose up --build
  ```

- **Stop all services**:
  ```bash
  # Stop and remove containers
  docker compose down
  ```
  *To also remove the database volume, use `docker compose down -v`.*

### Local Development (Frontend)

For frontend-only changes, you can run the Vite development server directly:

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Testing

- **Backend (Go)**:
  ```bash
  cd backend
  go test ./...
  ```

- **Frontend (Unit/Integration - Vitest)**:
  ```bash
  cd frontend
  # Run tests once
  npm test 
  # Or, to run in watch mode:
  vitest
  ```

- **Frontend (E2E - Playwright)**:
  Note: E2E tests require a clean, running environment. 
  First, ensure all services are built and running. It is recommended to reset the environment before testing:
  ```bash
  # Stop containers and remove volumes to ensure a clean state
  docker compose down -v

  # Build and start all services. Wait for this to complete.
  docker compose up --build
  ```
  Once the services are running, open a **new terminal** and run the test command:
  ```bash
  cd frontend
  npm run e2e -- --workers=1 --reporter=list
  ```

## 3. Development Conventions

### Backend (Go)

- **Code Style & Linting**: A strict set of standards is enforced via GitHub Actions.
  - **Formatting**: `gofmt` and `goimports`.
  - **Linting**: `golangci-lint` is configured in `.golangci.yml` to use `govet`, `errcheck`, `staticcheck`, and `ineffassign`.
- **API Design**:
  - Routes are defined in the `router/` directory, separated into `admin_routes.go` and `user_routes.go`.
  - The pattern involves initializing services and injecting them into handlers for a clean separation of concerns.
  - Middleware is used for authentication (`AuthMiddleware`) and role-based access control (`BusinessOnlyMiddleware`).

### Frontend (TypeScript/React)

- **Code Style & Linting**:
  - **Formatting**: `Prettier` is used to maintain a consistent code style. The configuration is in `.prettierrc`.
  - **Linting**: `ESLint` is configured in `.eslintrc.json`, extending recommended rules for TypeScript and React.
- **Component Architecture**:
  - `src/App.tsx` serves as the main entry point, handling conditional rendering for loading, login, admin, and the main application views.
  - The project relies heavily on a custom component library built with Radix UI primitives, located in `src/components/ui/`.
- **Branching Strategy**:
  - CI workflows are triggered on pushes and pull requests to the `main` and `develop` branches, suggesting a Git Flow-like branching model.

