# API & Database Schema Specification

## 🗄️ Database Schema (MongoDB Collections)

### 1. `users`
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `email` | String | Unique user email |
| `password_hash` | String | Bcrypt hashed password |
| `api_keys` | Object | Encrypted keys (Gemini, etc.) |

### 2. `projects`
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `user_id` | ObjectId | Reference to `users` |
| `project_name` | String | User-defined name |
| `characters` | Object | Map of character names to visual traits |
| `last_updated` | DateTime | Auto-updated timestamp |

### 3. `scenes`
| Field | Type | Description |
|---|---|---|
| `_id` | ObjectId | Primary Key |
| `project_id` | ObjectId | Reference to `projects` |
| `scene_number`| Integer | Sequence identifier |
| `description` | String | Scene action/content |
| `generated_prompt`| String | The final output for Veo |

## 🔌 API Endpoints Reference

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Projects
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:id`
- `PUT /api/projects/:id`

### AI Operations
- `POST /api/gemini/analyze-character` (Vision)
- `POST /api/gemini/break-script` (Text Analytics)
- `POST /api/gemini/generate-prompt` (Prompt Engineering)
