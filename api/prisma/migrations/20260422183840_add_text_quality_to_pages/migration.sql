-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "qualityScore" JSONB;

-- CreateIndex
CREATE INDEX "Page_qualityScore_idx" ON "Page"("qualityScore");
