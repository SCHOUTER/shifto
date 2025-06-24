/*
  Warnings:

  - Made the column `type` on table `availabilities` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "availabilities" ALTER COLUMN "type" SET NOT NULL;
