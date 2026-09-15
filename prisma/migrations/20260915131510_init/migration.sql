-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('GYM', 'FOOTBALL', 'MATCH', 'REST', 'WALK', 'OTHER');

-- CreateEnum
CREATE TYPE "WorkoutType" AS ENUM ('STRENGTH', 'POWER', 'UPPER_BODY', 'FULL_BODY', 'REDUCED', 'DELOAD', 'OTHER');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('QUADS', 'HAMSTRINGS', 'GLUTES', 'ADDUCTORS', 'CALVES', 'CORE', 'CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'POWER_PLYO');

-- CreateEnum
CREATE TYPE "ExerciseCategory" AS ENUM ('STRENGTH', 'POWER', 'CORE', 'INJURY_PREVENTION', 'ACCESSORY');

-- CreateEnum
CREATE TYPE "BodyZone" AS ENUM ('HAMSTRING', 'ADDUCTOR', 'PUBIS', 'ANKLE', 'KNEE', 'SOLEUS', 'ACHILLES', 'SHOULDER', 'BACK', 'OTHER');

-- CreateEnum
CREATE TYPE "PhotoAngle" AS ENUM ('FRONT', 'SIDE', 'BACK');

-- CreateEnum
CREATE TYPE "CheckinZone" AS ENUM ('GREEN', 'YELLOW', 'ORANGE', 'RED');

-- CreateEnum
CREATE TYPE "ProgressionDecision" AS ENUM ('INCREASE_WEIGHT', 'MAINTAIN', 'DECREASE_WEIGHT', 'INCREASE_REPS', 'MAINTAIN_REPS');

-- CreateEnum
CREATE TYPE "PhaseName" AS ENUM ('ADAPTATION', 'STRENGTH', 'STRENGTH_POWER', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "PRType" AS ENUM ('MAX_WEIGHT', 'EST_1RM', 'MAX_REPS_AT_WEIGHT', 'MAX_VOLUME');

-- CreateEnum
CREATE TYPE "InsightCategory" AS ENUM ('BODY_COMPOSITION', 'SLEEP', 'STRENGTH', 'LOAD', 'FOOTBALL', 'NUTRITION', 'GENERAL');

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Jugador',
    "age" INTEGER NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "initialWeightKg" DOUBLE PRECISION NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'Defensa central',
    "footballSessionsPerWeek" INTEGER NOT NULL DEFAULT 3,
    "gymScheduleNote" TEXT,
    "targetWeightMinKg" DOUBLE PRECISION,
    "targetWeightMaxKg" DOUBLE PRECISION,
    "targetWaistReductionCm" DOUBLE PRECISION,
    "calorieTargetMin" INTEGER,
    "calorieTargetMax" INTEGER,
    "proteinTargetMinG" INTEGER,
    "proteinTargetMaxG" INTEGER,
    "fatTargetPerKg" DOUBLE PRECISION DEFAULT 0.9,
    "programStartDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ExerciseCategory" NOT NULL DEFAULT 'STRENGTH',
    "injuryZones" "BodyZone"[],
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseMuscleGroup" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "factor" DOUBLE PRECISION NOT NULL DEFAULT 1,

    CONSTRAINT "ExerciseMuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT,
    "durationMin" INTEGER,
    "type" "EventType" NOT NULL,
    "intensityRPE" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workout" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "type" "WorkoutType" NOT NULL DEFAULT 'STRENGTH',
    "label" TEXT,
    "checkinId" TEXT,
    "calendarEventId" TEXT,
    "durationMin" INTEGER,
    "sessionRPE" INTEGER,
    "notes" TEXT,
    "nextSessionPlan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "painFlag" BOOLEAN NOT NULL DEFAULT false,
    "progressionDecision" "ProgressionDecision",

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SetEntry" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "reps" INTEGER,
    "rir" INTEGER,
    "difficulty" INTEGER,
    "restSeconds" INTEGER,
    "tempo" TEXT,
    "painFlag" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "SetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FootballSession" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "calendarEventId" TEXT,
    "durationMin" INTEGER,
    "rpe" INTEGER,
    "minutesPlayed" INTEGER,
    "performance" INTEGER,
    "fatigue" INTEGER,
    "legFeel" INTEGER,
    "duels" INTEGER,
    "duelsWon" INTEGER,
    "aerialDuels" INTEGER,
    "aerialDuelsWon" INTEGER,
    "accelerations" INTEGER,
    "directionChanges" INTEGER,
    "sprintRecovery" INTEGER,
    "concentration" INTEGER,
    "positioning" INTEGER,
    "buildupPlay" INTEGER,
    "longPasses" INTEGER,
    "longPassesOk" INTEGER,
    "defensiveErrors" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FootballSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "calendarEventId" TEXT,
    "opponent" TEXT,
    "competition" TEXT,
    "isHome" BOOLEAN,
    "starter" BOOLEAN,
    "minutesPlayed" INTEGER,
    "rpe" INTEGER,
    "performance" INTEGER,
    "fatigue" INTEGER,
    "legFeel" INTEGER,
    "goals" INTEGER,
    "assists" INTEGER,
    "duelsWon" INTEGER,
    "duelsLost" INTEGER,
    "aerialDuelsWon" INTEGER,
    "aerialDuelsLost" INTEGER,
    "accelerations" INTEGER,
    "directionChanges" INTEGER,
    "sprintRecovery" INTEGER,
    "concentration" INTEGER,
    "positioning" INTEGER,
    "buildupPlay" INTEGER,
    "longPasses" INTEGER,
    "longPassesOk" INTEGER,
    "clearances" INTEGER,
    "interceptions" INTEGER,
    "passes" INTEGER,
    "passesCompleted" INTEGER,
    "defensiveErrors" INTEGER,
    "personalRating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyCheckin" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "sleepScore" INTEGER NOT NULL,
    "legsScore" INTEGER NOT NULL,
    "motivationScore" INTEGER NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "zone" "CheckinZone" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCheckin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PainEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkinId" TEXT,
    "zone" "BodyZone" NOT NULL,
    "painLevel" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PainEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Injury" (
    "id" TEXT NOT NULL,
    "zone" "BodyZone" NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'activa',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Injury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SleepEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bedTime" TEXT,
    "wakeTime" TEXT,
    "hoursSlept" DOUBLE PRECISION,
    "quality" INTEGER,
    "wakeups" INTEGER,
    "wakeFeeling" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SleepEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BodyMeasurement" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weightKg" DOUBLE PRECISION,
    "waistCm" DOUBLE PRECISION,
    "bodyFatPct" DOUBLE PRECISION,
    "conditions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BodyMeasurement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgressPhoto" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "angle" "PhotoAngle" NOT NULL,
    "url" TEXT NOT NULL,
    "lighting" TEXT,
    "position" TEXT,
    "distance" TEXT,
    "timeOfDay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProgressPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NutritionEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "calories" INTEGER,
    "proteinG" INTEGER,
    "carbsG" INTEGER,
    "fatG" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HydrationEntry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "waterMl" INTEGER,
    "preMatchMl" INTEGER,
    "duringMl" INTEGER,
    "postMl" INTEGER,
    "electrolytes" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HydrationEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyReview" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "summaryJson" JSONB NOT NULL,
    "evaluation" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "targetDate" TIMESTAMP(3),
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Phase" (
    "id" TEXT NOT NULL,
    "name" "PhaseName" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Phase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalRecord" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "type" "PRType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER,
    "weightKg" DOUBLE PRECISION,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insight" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" "InsightCategory" NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Insight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseMuscleGroup_exerciseId_muscleGroup_key" ON "ExerciseMuscleGroup"("exerciseId", "muscleGroup");

-- CreateIndex
CREATE INDEX "CalendarEvent_date_idx" ON "CalendarEvent"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Workout_calendarEventId_key" ON "Workout"("calendarEventId");

-- CreateIndex
CREATE INDEX "Workout_date_idx" ON "Workout"("date");

-- CreateIndex
CREATE UNIQUE INDEX "FootballSession_calendarEventId_key" ON "FootballSession"("calendarEventId");

-- CreateIndex
CREATE INDEX "FootballSession_date_idx" ON "FootballSession"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Match_calendarEventId_key" ON "Match"("calendarEventId");

-- CreateIndex
CREATE INDEX "Match_date_idx" ON "Match"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyCheckin_date_key" ON "DailyCheckin"("date");

-- CreateIndex
CREATE INDEX "PainEntry_date_idx" ON "PainEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "SleepEntry_date_key" ON "SleepEntry"("date");

-- CreateIndex
CREATE INDEX "BodyMeasurement_date_idx" ON "BodyMeasurement"("date");

-- CreateIndex
CREATE INDEX "ProgressPhoto_date_idx" ON "ProgressPhoto"("date");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionEntry_date_key" ON "NutritionEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "HydrationEntry_date_key" ON "HydrationEntry"("date");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyReview_weekStart_key" ON "WeeklyReview"("weekStart");

-- CreateIndex
CREATE INDEX "PersonalRecord_exerciseId_type_idx" ON "PersonalRecord"("exerciseId", "type");

-- AddForeignKey
ALTER TABLE "ExerciseMuscleGroup" ADD CONSTRAINT "ExerciseMuscleGroup_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workout" ADD CONSTRAINT "Workout_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SetEntry" ADD CONSTRAINT "SetEntry_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FootballSession" ADD CONSTRAINT "FootballSession_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_calendarEventId_fkey" FOREIGN KEY ("calendarEventId") REFERENCES "CalendarEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PainEntry" ADD CONSTRAINT "PainEntry_checkinId_fkey" FOREIGN KEY ("checkinId") REFERENCES "DailyCheckin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalRecord" ADD CONSTRAINT "PersonalRecord_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
