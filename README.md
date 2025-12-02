# Odin File Uploader

## Description
This is my implementation of the File Uploader "Google Drive Clone" project from the Odin Project's Node.js course as a part of their Full-Stack Javascript curriculum.

The project is built with EJS as the view engine, using passport for user authentication and multer for file uploads and downloads. I used a classic MVC pattern with a PostgreSQL database on the back end and a Prisma ORM client facilitating db interaction.

For the final deployment, I updated the file upload and download controller functions to integrate with a Supabase client.

This was another step up in deployment complexity, since the web app lives on one platform, the database on a second, and the actual file storage on a third. Getting the three of them to play nicely with each other was an interesting exercise.