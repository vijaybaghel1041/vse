# Run VSE Locally and on Docker

The goal of this task is to configure the `vse` project so it can be easily run using Docker, as well as providing instructions and scripts to run it locally. The application consists of a Spring Boot backend, an Angular frontend, and requires a MySQL database.

## Proposed Changes

### Docker Configuration
To ensure the application can be seamlessly run on Docker, I will create Dockerfiles for both the frontend and backend, and a `docker-compose.yml` file to orchestrate the entire stack.

#### [NEW] [docker-compose.yml](file:///c:/Users/Vijay%20Baghel/OneDrive/Desktop/vse/docker-compose.yml)
Will define 3 services:
1. `db`: MySQL 8 server using `vse_db`, mapping port 3307 to host so it behaves like the local requirement.
2. `backend`: Built from `vse-backend-git` Dockerfile, exposing port 8080.
3. `frontend`: Built from `vse-frontend-git` Dockerfile, mapped to port 80.

---

### Backend Components

#### [NEW] [Dockerfile](file:///c:/Users/Vijay%20Baghel/OneDrive/Desktop/vse/vse-backend-git/Dockerfile)
A multi-stage Docker build for the Spring Boot application using Java 17 and Maven.
- Stage 1: Build the `.jar` using Maven.
- Stage 2: Run the `.jar` using a lightweight Eclipse Temurin 17 JRE.

---

### Frontend Components

#### [NEW] [Dockerfile](file:///c:/Users/Vijay%20Baghel/OneDrive/Desktop/vse/vse-frontend-git/Dockerfile)
A multi-stage Docker build for the Angular application using Node 22.
- Stage 1: Run `npm install` and `npm run build` using the Node environment.
- Stage 2: Serve the compiled static assets using an `nginx:alpine` web server.

#### [NEW] [nginx.conf](file:///c:/Users/Vijay%20Baghel/OneDrive/Desktop/vse/vse-frontend-git/nginx.conf)
Configuration for NGINX to ensure client-side routing (HTML5 history API) works correctly in Angular out of the box.

---

## Open Questions

None. The application structure is standard and the required setup is known based on `application.properties` and `package.json`.

## Verification Plan

### Automated Tests
* None.

### Manual Verification
* The user will run `docker-compose up --build -d` and verify the Angular frontend is accessible at http://localhost.
* The backend API is accessible via http://localhost:8080/api/vse.
* The local database will be created using Docker as `mysql` on port `3307`.
* The user can follow provided instructions to run the application purely locally without Docker (requires a local MySQL instance).
