/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customUrl]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "dateOfBirth",
ADD COLUMN     "achievements" TEXT[],
ADD COLUMN     "bannerImage" TEXT,
ADD COLUMN     "customSections" JSONB,
ADD COLUMN     "customUrl" TEXT,
ADD COLUMN     "layout" TEXT,
ADD COLUMN     "skills" TEXT[],
ADD COLUMN     "themeColor" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_customUrl_key" ON "Profile"("customUrl");
