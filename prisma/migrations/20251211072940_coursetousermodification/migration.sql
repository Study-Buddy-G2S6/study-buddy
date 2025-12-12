/*
  Warnings:

  - The primary key for the `CourseToUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `CourseToUser` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CourseToUser_userId_courseId_key";

-- AlterTable
ALTER TABLE "CourseToUser" DROP CONSTRAINT "CourseToUser_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "CourseToUser_pkey" PRIMARY KEY ("userId", "courseId");
