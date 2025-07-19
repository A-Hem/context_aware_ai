app/
├── 📂 api/
│   ├── 📄 v1/                 # API versioning is a good practice
│   │   ├── 📄 endpoints/
│   │   │   ├── 📄 think.py    # Route for the /think endpoint
│   │   │   └── 📄 learn.py    # Route for the /learn endpoint
│   │   └── 📄 router.py        # Combines all v1 endpoints
│   └── 📄 auth.py              # User authentication and JWT handling
├── 📂 security/
│   └── 📄 middleware.py        # Middleware to verify JWTs and manage user sessions
├── 📂 services/
│   └── 📄 redis_manager.py     # Manages user-specific Redis client instances
└── 📄 main.py                  # FastAPI application entrypoint
