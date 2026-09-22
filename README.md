# NestJS File Upload API

A production-style file upload REST API built with **NestJS**, **TypeScript**, **Prisma 7**, **PostgreSQL**, **Multer**, **DigitalOcean Spaces**, and **fastq**.

This project was developed as a backend assignment focused on file uploading, validation, database persistence, cloud storage, background processing, rate limiting, and API error handling.

---

## 🚀 Features

### File Upload

* Single file upload
* Multiple file upload
* Maximum 5 files per multiple-upload request
* Maximum 5 MB per file
* Supported formats:

  * JPG
  * JPEG
  * PNG
  * WEBP
* Temporary local file storage
* Automatic local file cleanup

### Database

* PostgreSQL database
* Prisma ORM
* Prisma Client 7
* Upload metadata stored in database
* Upload status tracking
* Uploader IP address tracking
* Pagination
* Search
* Filtering
* Sorting
* Upload statistics

### DigitalOcean Spaces

* S3-compatible DigitalOcean Spaces integration
* AWS SDK v3
* Files uploaded to Spaces through a background queue
* Database updated after successful cloud upload
* Cloud files deleted when an upload is deleted

### Background Processing

* `fastq` upload queue
* Concurrent cloud uploads
* Queue-based DigitalOcean Spaces processing
* Upload status updated to `done` or `failed`

### Security & Validation

* Custom file validation pipe
* MIME type validation
* File extension validation
* File size validation
* Custom rate-limit guard
* 1 GB daily upload limit per IP address
* Local file cleanup after rejected uploads
* Multiple-file cleanup when one file fails validation

### API Infrastructure

* Global validation pipe
* Global HTTP exception filter
* Upload logging interceptor
* Consistent API error responses
* Static local upload handling

---

# 🛠️ Tech Stack

| Technology          | Purpose                           |
| ------------------- | --------------------------------- |
| NestJS 11           | Backend framework                 |
| TypeScript          | Programming language              |
| Prisma 7            | ORM                               |
| PostgreSQL          | Database                          |
| Multer              | File upload handling              |
| AWS SDK v3          | DigitalOcean Spaces communication |
| DigitalOcean Spaces | Cloud object storage              |
| fastq               | Upload queue                      |
| class-validator     | DTO validation                    |
| class-transformer   | DTO transformation                |
| Node.js             | Runtime                           |

---

# 📁 Project Structure

```text
file-upload-api/
│
├── generated/
│   └── prisma/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
│   └── uploads/
│
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   │
│   ├── common/
│   │   └── filters/
│   │       └── http-exception.filter.ts
│   │
│   ├── config/
│   │   └── spaces.config.ts
│   │
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── spaces/
│   │   ├── spaces.module.ts
│   │   ├── spaces.service.ts
│   │   │
│   │   └── queue/
│   │       └── upload-queue.service.ts
│   │
│   └── upload/
│       ├── dto/
│       │   └── query-uploads.dto.ts
│       │
│       ├── guards/
│       │   └── rate-limit.guard.ts
│       │
│       ├── interceptors/
│       │   └── upload-logging.interceptor.ts
│       │
│       ├── interfaces/
│       │   └── upload-file.interface.ts
│       │
│       ├── pipes/
│       │   └── file-validation.pipe.ts
│       │
│       ├── upload.controller.ts
│       ├── upload.module.ts
│       └── upload.service.ts
│
├── .env
├── .gitignore
├── package.json
├── prisma.config.ts
└── README.md
```

---

# ⚙️ Installation

## 1. Clone the repository

```bash
git clone https://github.com/shahjalalhazari/PS-Assignment-6-NestJs-File-Uploader-API
```

Move into the project:

```bash
cd PS-Assignment-6-NestJs-File-Uploader-API
```

---

## 2. Install dependencies

```bash
npm install
```

---

# 🗄️ PostgreSQL Setup

Create a PostgreSQL database.

For example:

```text
nestjs-file-uploader-db
```

The application uses Prisma to communicate with PostgreSQL.

---

# 🔐 Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestjs-file-uploader-db"

PORT=3000

SPACES_ENDPOINT="https://<region>.digitaloceanspaces.com"
SPACES_REGION="<region>"
SPACES_BUCKET="<bucket-name>"
SPACES_ACCESS_KEY="<your-access-key>"
SPACES_SECRET_KEY="<your-secret-key>"
```

---

# 🧬 Prisma Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

You can also open Prisma Studio:

```bash
npx prisma studio
```

---

# ▶️ Running the Application

### Development

```bash
npm run start:dev
```

### Production build

```bash
npm run build
```

### Production

```bash
npm run start:prod
```

The API will run at:

```text
http://localhost:3000
```

---

# 📡 API Endpoints

## 1. Upload Single File

```http
POST /upload/single
```

### Form-data

```text
file: <image>
```

### Supported files

```text
.jpg
.jpeg
.png
.webp
```

### Maximum size

```text
5 MB
```

### Upload flow

```text
Multer
   ↓
FileValidationPipe
   ↓
RateLimitGuard
   ↓
Daily quota check
   ↓
Save metadata to PostgreSQL
   ↓
fastq queue
   ↓
DigitalOcean Spaces
   ↓
Update database
   ↓
Delete temporary local file
```

---

# 2. Upload Multiple Files

```http
POST /upload/multiple
```

### Form-data

```text
files: <image>
files: <image>
files: <image>
```

### Limits

```text
Maximum files: 5
Maximum size per file: 5 MB
```

The multiple-upload validation pipe validates every received file.

If one file is invalid:

```text
Validation fails
      ↓
All received temporary files are deleted
      ↓
400 Bad Request
```

This prevents rejected files from remaining on the server.

---

# 3. Get Uploads

```http
GET /upload
```

Supports:

* Pagination
* Status filtering
* MIME type filtering
* Search
* Sorting

### Example

```http
GET /upload?page=1&limit=10
```

### Search

```http
GET /upload?search=photo
```

### Status filter

```http
GET /upload?status=done
```

### MIME type filter

```http
GET /upload?mimeType=image/png
```

### Sorting

```http
GET /upload?sortBy=size&sortOrder=desc
```

### Combined example

```http
GET /upload?page=1&limit=10&status=done&mimeType=image/png&search=test&sortBy=createdAt&sortOrder=desc
```

---

# 4. Get Single Upload

```http
GET /upload/:id
```

Example:

```http
GET /upload/550e8400-e29b-41d4-a716-446655440000
```

If the upload does not exist:

```json
{
  "statusCode": 404,
  "message": "Upload not found",
  "error": "Not Found",
  "timestamp": "2026-09-22T00:00:00.000Z",
  "path": "/upload/550e8400-e29b-41d4-a716-446655440000"
}
```

---

# 5. Delete Upload

```http
DELETE /upload/:id
```

The delete process is:

```text
Find database record
        ↓
Delete DigitalOcean Spaces file
        ↓
Delete local file if it exists
        ↓
Delete database record
```

Example response:

```json
{
  "message": "Upload deleted successfully",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

# 6. Upload Statistics

```http
GET /upload/stats
```

### Response

```json
{
  "totalFiles": 45,
  "totalSize": 52428800,
  "totalSizeFormatted": "50 MB",
  "byStatus": {
    "done": 40,
    "pending": 3,
    "failed": 2
  },
  "byMimeType": {
    "image/png": 20,
    "image/jpeg": 18,
    "image/webp": 7
  }
}
```

`totalSize` is returned in bytes, while `totalSizeFormatted` provides a human-readable value.

---

# 🛡️ Rate Limiting

The application includes a custom rate-limit guard.

Current configuration:

```text
10 upload requests
per 1 minute
per IP address
```

When the limit is exceeded:

```http
429 Too Many Requests
```

Response:

```json
{
  "statusCode": 429,
  "message": "Too many upload requests. Please try again later.",
  "error": "Too Many Requests",
  "timestamp": "2026-09-22T00:00:00.000Z",
  "path": "/upload/single"
}
```

---

# 📦 Daily Upload Limit

Each IP address can upload a maximum of:

```text
1 GB per day
```

The application calculates the total uploaded bytes for the current day.

For example:

```text
Current usage: 1,010 MB
New upload:    25 MB
-----------------------
Total:         1.10 GB
```

The upload is rejected because it exceeds the daily 1 GB limit.

---

# ☁️ DigitalOcean Spaces

Uploaded files are temporarily stored locally before being processed by the queue.

The `SpacesService` uses the AWS SDK v3 because DigitalOcean Spaces provides an S3-compatible API.

The process is:

```text
Local File
    ↓
fastq Queue
    ↓
SpacesService
    ↓
DigitalOcean Spaces
    ↓
Database URL updated
    ↓
Local temporary file deleted
```

Successful uploads receive:

```text
status = done
storageType = spaces
```

Failed cloud uploads receive:

```text
status = failed
```

---

# ⚡ fastq Upload Queue

The project uses `fastq` to process DigitalOcean Spaces uploads.

The queue currently processes up to:

```text
2 uploads concurrently
```

This prevents every upload from directly performing the cloud-storage operation during the main request processing.

---

# 🗃️ Database Model

The main Prisma model is:

```prisma
model Upload {
  id String @id @default(uuid())

  originalName String

  fileName String @unique

  mimeType String

  size Int

  url String

  storageType String @default("local")

  uploadedBy String?

  status String @default("pending")

  createdAt DateTime @default(now())

  updatedAt DateTime @updatedAt

  @@index([status])
  @@index([mimeType])
  @@index([createdAt])
}
```

### Important fields

| Field          | Description                    |
| -------------- | ------------------------------ |
| `id`           | Unique upload ID               |
| `originalName` | Original uploaded filename     |
| `fileName`     | Generated unique filename      |
| `mimeType`     | File MIME type                 |
| `size`         | File size in bytes             |
| `url`          | Local or Spaces URL            |
| `storageType`  | `local` or `spaces`            |
| `uploadedBy`   | Uploader IP address            |
| `status`       | `pending`, `done`, or `failed` |
| `createdAt`    | Upload creation time           |
| `updatedAt`    | Last update time               |

---

# 🚨 Error Handling

The project includes a global HTTP exception filter.

All API errors follow a consistent structure:

```json
{
  "statusCode": 400,
  "message": "File is required",
  "error": "Bad Request",
  "timestamp": "2026-09-22T00:00:00.000Z",
  "path": "/upload/single"
}
```

This makes API errors easier for frontend applications and API clients to consume.

---

# 📝 Upload Logging

An upload logging interceptor records:

* HTTP method
* Request URL
* Client IP
* Response status
* Request duration

Example:

```text
[UPLOAD] POST /upload/single - IP: ::1

[UPLOAD] POST /upload/single - Status: 201 - Duration: 245ms
```

Failed requests are also logged:

```text
[UPLOAD] POST /upload/single - Status: 400 - Duration: 12ms
```

---

# 🧹 File Cleanup

The application removes temporary local files when they are no longer needed.

### Successful cloud upload

```text
Local file
    ↓
DigitalOcean Spaces upload
    ↓
Database updated
    ↓
Local file deleted
```

### Validation failure

```text
Files received
    ↓
Validation fails
    ↓
All rejected temporary files deleted
```

### Service-level failure

```text
Database / quota / queue error
    ↓
Temporary local files deleted
```

This prevents unnecessary files from accumulating inside `public/uploads`.

---

# 🔄 Upload Status Flow

An upload normally starts as:

```text
pending
```

After successful DigitalOcean Spaces upload:

```text
done
```

If the cloud upload fails:

```text
failed
```

Example:

```text
POST /upload/single
       ↓
   pending
       ↓
 fastq queue
       ↓
 DigitalOcean Spaces
       ↓
   ┌───────┴───────┐
   ↓               ↓
 done            failed
```

---

# 🧪 Testing

You can test the API using:

* Postman
* Insomnia
* Thunder Client
* REST Client
* cURL

Example:

```bash
curl -X POST http://localhost:3000/upload/single \
  -F "file=@photo.jpg"
```

Get uploads:

```bash
curl http://localhost:3000/upload
```

Get statistics:

```bash
curl http://localhost:3000/upload/stats
```

Delete an upload:

```bash
curl -X DELETE http://localhost:3000/upload/<UPLOAD_ID>
```

---

# 📋 Assignment Requirements Completed

| Requirement                  | Status |
| ---------------------------- | ------ |
| NestJS API                   | ✅      |
| TypeScript                   | ✅      |
| PostgreSQL                   | ✅      |
| Prisma 7                     | ✅      |
| Single upload                | ✅      |
| Multiple upload              | ✅      |
| Maximum 5 files              | ✅      |
| 5 MB file limit              | ✅      |
| JPG/JPEG/PNG/WEBP validation | ✅      |
| Database upload information  | ✅      |
| Uploader IP tracking         | ✅      |
| 1 GB/day per-IP limit        | ✅      |
| Rate-limit guard             | ✅      |
| DigitalOcean Spaces          | ✅      |
| AWS SDK v3                   | ✅      |
| fastq upload queue           | ✅      |
| Upload status tracking       | ✅      |
| Upload listing               | ✅      |
| Pagination                   | ✅      |
| Search                       | ✅      |
| Status filtering             | ✅      |
| MIME type filtering          | ✅      |
| Sorting                      | ✅      |
| Get single upload            | ✅      |
| Delete upload                | ✅      |
| Upload statistics            | ✅      |
| Multiple-file cleanup        | ✅      |
| Global exception filter      | ✅      |
| Upload logging interceptor   | ✅      |

---

# 🎯 Project Goal

The goal of this project was to build a complete backend file-upload system while practicing real-world NestJS concepts including:

* Modules
* Controllers
* Services
* Guards
* Pipes
* Interceptors
* Exception Filters
* DTO validation
* Prisma ORM
* PostgreSQL
* File handling with Multer
* Cloud object storage
* Background job processing
* API error handling
* Rate limiting
* File cleanup

The project demonstrates how a basic file-upload endpoint can be developed into a structured backend service with database persistence, cloud storage, validation, queue processing, and operational safeguards.

---

# 👨‍💻 Author

**Shahjalal Hazari**

NestJS • TypeScript • PostgreSQL • Prisma • REST API • DigitalOcean Spaces