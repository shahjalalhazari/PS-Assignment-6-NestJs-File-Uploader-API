/*
  Warnings:

  - You are about to drop the column `uplodedBy` on the `Upload` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Upload" DROP COLUMN "uplodedBy",
ADD COLUMN     "uploadedBy" TEXT;
