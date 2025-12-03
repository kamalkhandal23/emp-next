<!-- # Supabase Storage Integration

This project uses Supabase Storage for file uploads (assignment submissions).

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Note down your project URL and anon key

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these values in:

- Supabase Dashboard → Settings → API

### 3. Storage Bucket Configuration

The system will automatically create an `assignments` bucket on server startup with the following configuration:

- **Bucket Name**: `assignments`
- **Privacy**: Private (requires authentication)
- **File Size Limit**: 10MB
- **Allowed File Types**:
  - Images: jpeg, png, gif
  - Documents: pdf, doc, docx, txt
  - Archives: zip, rar
  - Code files: js, py, java, cpp, c, html, css, json, xml

### 4. Storage Policies (Optional - for enhanced security)

If you want to add Row Level Security (RLS) policies:

1. Go to Supabase Dashboard → Storage → Policies
2. Add policies for the `assignments` bucket:

#### Read Policy (Students can view their own submissions)

```sql
CREATE POLICY "Students can view their submissions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'assignments' AND
  auth.uid()::text = split_part(name, '/', 1)
);
```

#### Upload Policy (Students can upload to their folder)

```sql
CREATE POLICY "Students can upload to their folder"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'assignments' AND
  auth.uid()::text = split_part(name, '/', 1)
);
```

#### Delete Policy (Students can delete their own files)

```sql
CREATE POLICY "Students can delete their files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'assignments' AND
  auth.uid()::text = split_part(name, '/', 1)
);
```

## File Upload Structure

Files are organized in Supabase Storage with the following structure:

```
assignments/
  └── student-{studentId}/
      └── assignment-{assignmentId}/
          ├── 1234567890-123456789.pdf
          ├── 1234567891-987654321.jpg
          └── ...
```

## Features

### Upload Service Functions

- **`uploadFile(file, folder)`** - Upload a single file
- **`uploadMultipleFiles(files, folder)`** - Upload multiple files
- **`getSignedUrl(filePath, expiresIn)`** - Get temporary access URL
- **`deleteFile(filePath)`** - Delete a file
- **`deleteMultipleFiles(filePaths)`** - Delete multiple files

### API Integration

The upload service is integrated with the assignment submission system:

- Multer middleware captures files from multipart/form-data
- Files are stored in memory (buffer)
- Upload service sends files to Supabase Storage
- URLs are stored in MongoDB for reference
- Private files use signed URLs for secure access

## Migration from Local Storage

If you were previously using local file storage:

1. The new system uses `multer.memoryStorage()` instead of `diskStorage`
2. Files are no longer stored in `server/uploads/assignments/`
3. File URLs point to Supabase CDN
4. Old local files can be migrated using a migration script (see below)

### Migration Script (Optional)

To migrate existing local files to Supabase:

```javascript
// scripts/migrateFilesToSupabase.js
// import fs from 'fs';
// import path from 'path';
// import { uploadFile } from '../services/uploadService.js';
// import AssignmentSubmission from '../models/nextgen/education/AssignmentSubmission.js';

// async function migrateFiles() {
//   const submissions = await AssignmentSubmission.find({
//     'fileSubmissions.path': { $regex: /^server\/uploads/ },
//   });

//   for (const submission of submissions) {
//     for (const file of submission.fileSubmissions) {
//       if (file.path.startsWith('server/uploads')) {
//         const localPath = path.join(process.cwd(), file.path);

//         if (fs.existsSync(localPath)) {
//           const fileBuffer = fs.readFileSync(localPath);
//           const fileObj = {
//             buffer: fileBuffer,
//             originalname: file.originalName,
//             mimetype: file.mimetype,
//             size: file.size,
//           };

//           const folder = `student-${submission.student_id}/assignment-${submission.assignment_id}`;
//           const result = await uploadFile(fileObj, folder);

//           if (result.success) {
//             file.path = result.path;
//             file.url = result.url;
//             console.log(`Migrated: ${file.originalName}`);
//           }
//         }
//       }
//     }

//     await submission.save();
//   }

//   console.log('Migration complete!');
// }

// migrateFiles();
// ```

// ## Troubleshooting

// ### Bucket not created automatically

// If the bucket isn't created on server startup:

// 1. Check your Supabase credentials in `.env`
// 2. Manually create the bucket in Supabase Dashboard → Storage
// 3. Set it to "Private" and configure the file size limit

// ### File upload fails

// Common issues:

// - Check file size (max 10MB)
// - Verify file type is allowed
// - Ensure Supabase credentials are correct
// - Check internet connection to Supabase

// ### Cannot access uploaded files

// For private buckets:

// - Use `getSignedUrl()` to generate temporary access URLs
// - Signed URLs expire after 1 hour by default
// - Adjust expiration time as needed

// ## Benefits of Supabase Storage

// ✅ **Scalability**: No server disk space limitations  
// ✅ **CDN**: Fast file delivery globally  
// ✅ **Security**: Built-in authentication and RLS policies  
// ✅ **Reliability**: Automatic backups and redundancy  
// ✅ **Cost-effective**: Pay only for what you use  
// ✅ **Easy management**: Web dashboard for file browsing

// ## Support

// For issues or questions:

// - Supabase Docs: https://supabase.com/docs/guides/storage
// - Project Issues: Create a GitHub issue -->
