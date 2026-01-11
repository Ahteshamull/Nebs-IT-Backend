# Notice Board Backend API

RESTful API server for the Notice Board application, built with Node.js, Express, and MongoDB. Handles CRUD operations for notices with file attachment support, pagination, and filtering.

## Features

- 🚀 **RESTful API**: Complete CRUD operations for notices
- 📁 **File Upload**: Multipart file upload with Multer
- 📄 **Pagination**: Server-side pagination with metadata
- 🔍 **Advanced Filtering**: Filter by status, department, type, date range
- 🛡️ **Error Handling**: Centralized error handling middleware
- 📝 **Logging**: Request/response logging for debugging
- 🔐 **Validation**: Input validation for all endpoints
- 📊 **MongoDB Integration**: Mongoose ODM with schema validation

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **File Upload**: Multer middleware
- **Validation**: Custom validation middleware
- **Environment**: dotenv for configuration
- **CORS**: cors middleware for cross-origin requests

## Project Structure

```
server/
├── src/
│   ├── notice/
│   │   ├── controller/notice.controller.js    # Business logic for notice operations
│   │   ├── routes/notice.routes.js          # API route definitions
│   │   ├── schema/notice.modal.js           # Mongoose schema and model
│   │   └── middleware/
│   │       ├── errorCheck.js               # Error handling middleware
│   │       └── upload.js                  # Multer configuration for file uploads
├── uploads/                              # File upload destination
├── .env                                  # Environment variables
├── server.js                             # Express server entry point
└── package.json
```

## API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Notice Endpoints

| Method | Endpoint                 | Description          | Request Body              | Response |
| ------ | ------------------------ | -------------------- | ------------------------- | -------- |
| GET    | `/notice/all`            | Query params         | Paginated list of notices |
| GET    | `/notice/:id`            | -                    | Single notice by ID       |
| POST   | `/notice/create`         | FormData             | Created notice            |
| POST   | `/notice/create-draft`   | FormData             | Created draft notice      |
| PATCH  | `/notice/update/:id`     | FormData             | Updated notice            |
| DELETE | `/notice/delete/:id`     | -                    | Success message           |
| PATCH  | `/notice/status/:id`     | `{ status: string }` | Updated notice            |
| PATCH  | `/notice/save-draft/:id` | FormData             | Saved as draft            |

### Query Parameters (GET /notice/all)

```javascript
{
  page: 1,                    // Page number (default: 1)
  limit: 10,                   // Items per page (default: 10)
  search: "Notice Title",       // Search by notice title
  status: "Published",          // Filter by status
  targetDepartments: "HR",      // Filter by department
  noticeType: "General",        // Filter by type
  publishDate: "2025-01-12"    // Filter by publish date
}
```

### Request Body (POST/PATCH)

All create/update endpoints expect `multipart/form-data`:

```javascript
// FormData fields
noticeTitle: "Notice Title"
noticeType: "General / Company-Wide"
targetDepartments: "All Department"
publishDate: "2025-01-12T00:00:00.000Z"
noticeBody: "Notice content..."
status: "Published"           // or "Draft"
employeeId: "EMP001"
employeeName: "John Doe"
position: "Manager"

// Files (multiple supported)
attachments: [File, File, ...]  // Max 5 files, 5MB each
```

### Response Format

#### Success Response

```json
{
  "success": true,
  "message": "Notice created successfully",
  "data": {
    "_id": "6962d991d74f04071f13002f",
    "noticeTitle": "Notice Title",
    "noticeType": "General / Company-Wide",
    "targetDepartments": "All Department",
    "publishDate": "2025-01-12T00:00:00.000Z",
    "noticeBody": "Notice content...",
    "status": "Published",
    "attachments": [
      {
        "filename": "notice-123.pdf",
        "originalName": "document.pdf",
        "path": "/uploads/notice-123.pdf",
        "size": 1024000,
        "mimeType": "application/pdf"
      }
    ],
    "createdAt": "2025-01-12T00:00:00.000Z",
    "updatedAt": "2025-01-12T00:00:00.000Z"
  }
}
```

#### Paginated Response (GET /notice/all)

```json
{
  "success": true,
  "data": [
    {
      /* Notice objects */
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalNotices": 47,
    "hasNext": true,
    "hasPrev": false,
    "limit": 10
  }
}
```

#### Error Response

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "Notice title is required"
}
```

## Database Schema

### Notice Model

```javascript
const noticeModalSchema = new mongoose.Schema(
  {
    noticeTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    noticeType: {
      type: String,
      required: true,
      enum: [
        "General / Company-Wide",
        "Holiday & Event",
        "HR & Policy Update",
        "Finance & Payroll",
        "Warning / Disciplinary",
        "Emergency / Urgent",
        "IT / System Maintenance",
        "Department / Team",
      ],
    },
    targetDepartments: {
      type: String,
      required: true,
      enum: [
        "All Department",
        "Finance",
        "Sales Team",
        "HR",
        "Web Team",
        "Database Team",
        "Marketing",
        "Operations",
        "Individual",
      ],
    },
    publishDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    noticeBody: {
      type: String,
      required: true,
      trim: true,
    },
    attachments: [
      {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        path: { type: String, required: true },
        size: { type: Number, required: true },
        mimeType: { type: String, required: true },
      },
    ],
    status: {
      type: String,
      enum: ["Draft", "Published", "Unpublished"],
      default: "Draft",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);
```

## File Upload Configuration

### Multer Settings

```javascript
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5, // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  },
});
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or connection string
- npm/yarn/pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd Nebs-IT/server

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Environment Setup

Create `.env` file in root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/notice-board
NODE_ENV=development
```

### Development

```bash
# Start development server
npm run dev
# or
yarn dev
# or
pnpm dev
```

Server runs on [http://localhost:3000](http://localhost:3000)

### Production

```bash
# Start production server
npm start
```

## API Usage Examples

### Create Notice

```bash
curl -X POST http://localhost:3000/api/v1/notice/create \
  -F "noticeTitle=Urgent Meeting" \
  -F "noticeType=Emergency / Urgent" \
  -F "targetDepartments=All Department" \
  -F "publishDate=2025-01-12T10:00:00Z" \
  -F "noticeBody=Team meeting at 10 AM" \
  -F "status=Published" \
  -F "attachments=@meeting-agenda.pdf"
```

### Get All Notices

```bash
curl "http://localhost:3000/api/v1/notice/all?page=1&limit=10&status=Published"
```

### Update Notice

```bash
curl -X PATCH http://localhost:3000/api/v1/notice/update/6962d991d74f04071f13002f \
  -F "noticeTitle=Updated Meeting Time" \
  -F "noticeBody=Meeting moved to 11 AM"
```

### Delete Notice

```bash
curl -X DELETE http://localhost:3000/api/v1/notice/delete/6962d991d74f04071f13002f
```

## Error Handling

### Error Response Format

All errors return consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "code": "ERROR_CODE" // Optional
}
```

### Common Error Codes

| Code              | Description              |
| ----------------- | ------------------------ |
| VALIDATION_ERROR  | Input validation failed  |
| NOT_FOUND         | Resource not found       |
| UNAUTHORIZED      | Invalid authentication   |
| FILE_TOO_LARGE    | File exceeds size limit  |
| INVALID_FILE_TYPE | Unsupported file format  |
| DATABASE_ERROR    | MongoDB operation failed |

## Development Workflow

### 1. Database Setup

```bash
# Start MongoDB
mongod

# Create database (optional)
use notice-board
```

### 2. API Development

1. Create/update Mongoose schema in `src/notice/schema/`
2. Implement controller logic in `src/notice/controller/`
3. Define routes in `src/notice/routes/`
4. Add middleware for validation and error handling
5. Test with Postman/curl

### 3. Testing

```bash
# Run tests (if available)
npm test

# Manual testing
npm run dev
# Test endpoints with Postman or curl
```

### 4. Debugging

- Check server console for request logs
- Verify MongoDB connection status
- Use browser Network tab for API responses
- Check `uploads/` directory for uploaded files

## Deployment

### Environment Variables for Production

```env
PORT=3000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/notice-board
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

### Production Build

```bash
# Install production dependencies
npm ci --production

# Start production server
npm start
```

## Security Considerations

- File upload validation prevents malicious uploads
- Input sanitization for all text fields
- CORS configuration for cross-origin requests
- Rate limiting recommended for production
- Environment variables for sensitive data
- MongoDB connection with authentication

## Performance Optimization

- MongoDB indexes on frequently queried fields
- Pagination prevents large response payloads
- File compression for uploads
- Response caching headers for static files
- Database connection pooling

## Monitoring & Logging

- Request/response logging for debugging
- Error tracking with stack traces
- Performance metrics (response times)
- Database query monitoring
- File upload progress tracking

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Implement changes with tests
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request with description

## License

MIT License - see LICENSE file for details
