
-- AlterEnum
ALTER TYPE "ExerciseCategory" ADD VALUE 'CARDIO';

-- AlterTable
ALTER TABLE "SetEntry" ADD COLUMN     "distanceKm" DOUBLE PRECISION,
ADD COLUMN     "durationMin" DOUBLE PRECISION;

