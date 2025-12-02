/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `SharedFolder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `url` to the `SharedFolder` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SharedFolder" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SharedFolder_url_key" ON "SharedFolder"("url");
