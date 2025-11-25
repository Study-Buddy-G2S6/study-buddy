import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Read and parse the development settings at runtime to avoid needing JSON module declarations
const settingsPath = path.join(process.cwd(), 'config', 'settings.development.json');

export async function GET() {
  try {
    const file = fs.readFileSync(settingsPath, 'utf8');
    const config = JSON.parse(file);
    return NextResponse.json(config.defaultCourses ?? []);
  } catch (err) {
    // Log server-side and return an empty array so the UI can render without crashing
    console.error('default-courses: failed to read settings file', err);
    return NextResponse.json([], { status: 200 });
  }
}

// Provide a default export to satisfy "prefer default export" linters while
// keeping the named `GET` handler that Next's App Router requires.
export default GET;
