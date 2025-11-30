-- CreateTable
CREATE TABLE "CourseToUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "CourseToUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseToUser_userId_courseId_key" ON "CourseToUser"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "CourseToUser" ADD CONSTRAINT "CourseToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseToUser" ADD CONSTRAINT "CourseToUser_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
