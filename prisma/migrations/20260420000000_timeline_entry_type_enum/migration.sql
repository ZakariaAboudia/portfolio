-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('work', 'education', 'project');

-- AlterTable
ALTER TABLE "timeline_entries" ALTER COLUMN "type" TYPE "EntryType" USING "type"::"EntryType";
