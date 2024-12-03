-- CreateTable
CREATE TABLE "DatePlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "foodSpot" TEXT NOT NULL,
    "activity" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "time" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
